import {type Asset,type Category,type State,canAccessAsset,id,now} from './domain';
let database:Promise<IDBDatabase>|undefined;
function db() {return database ||= new Promise((resolve,reject)=>{const r=indexedDB.open('maison-clm-assets-v2',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Không mở được IndexedDB; file chưa được lưu.'));});}
export async function storeBlob(key:string,blob:Blob) {const d=await db();await new Promise<void>((resolve,reject)=>{const t=d.transaction('files','readwrite');t.objectStore('files').add(blob,key);t.oncomplete=()=>resolve();t.onerror=()=>reject(Error('Không lưu được file. Kiểm tra dung lượng trình duyệt.'));});}
export async function readBlob(a:Asset):Promise<Blob> {
 if(a.fixtureText!==undefined)return new Blob([a.fixtureText],{type:a.mime});
 const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction('files').objectStore('files').get(a.storageKey);r.onsuccess=()=>r.result?resolve(r.result):reject(Error('Không tìm thấy bytes file trong trình duyệt này.'));r.onerror=()=>reject(Error('Không đọc được file.'));});
}
export async function assetFromBlob(blob:Blob,filename:string,category:Category,actor:string,fixtureText?:string):Promise<Asset> {
 if(!blob.size)throw Error('File rỗng không được chấp nhận.');
 if(blob.size>25*1024*1024)throw Error('Giới hạn demo: mỗi file tối đa 25 MB.');
 const digest=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
 const hash=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
 const key=id();if(fixtureText===undefined)await storeBlob(key,blob);
 return {id:key,storageKey:key,filename,mime:blob.type||'application/octet-stream',size:blob.size,category,uploadedBy:actor,uploadedAt:now(),restricted:category==='LEGAL_DOC',hash,fixtureText};
}
export function mockPdf(text:string) {
 const safe=text.replace(/[^\x20-\x7e]/g,' ').replace(/[()\\]/g,'');
 const content=`BT /F1 11 Tf 40 760 Td (MAISON DEMO - NOT A LEGAL DOCUMENT) Tj 0 -24 Td (${safe.slice(0,110)}) Tj ET`;
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
 let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((o,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=pdf.length;
 pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(o=>`${String(o).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return pdf;
}
export async function fixtureAsset(label:string,category:Category,actor:string) {const text=mockPdf(label);return assetFromBlob(new Blob([text],{type:'application/pdf'}),`${label.replace(/[^a-z0-9-]/gi,'-')}.pdf`,category,actor,text);}
export async function downloadAsset(s:State,assetId:string) {
 if(!canAccessAsset(s,assetId))throw Error('Không có quyền tải file này.');
 const a=s.assets.find(a=>a.id===assetId);if(!a)throw Error('File không tồn tại.');const blob=await readBlob(a);
 const digest=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());const hash=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');if(hash!==a.hash)throw Error('Checksum không khớp; file có thể đã bị thay đổi.');
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=a.filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
