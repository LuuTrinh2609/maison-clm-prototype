// Execute the same TypeScript domain and fixture services used by the React UI.
import fs from 'node:fs/promises';
import ts from 'typescript';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const target=new URL('./.test-build/',import.meta.url);
await fs.mkdir(target,{recursive:true});
for(const name of ['domain','assets','scenarios','i18n']){
 const source=await fs.readFile(new URL(`./src/${name}.${name==='i18n'?'tsx':'ts'}`,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");
 await fs.writeFile(new URL(`${name}.mjs`,target),js);
}
const d=await import(new URL('domain.mjs',target));
const {fixtureAsset,assetFromBlob,mockPdf}=await import(new URL('assets.mjs',target));
const {seedScenario,freshDemo,migrateLegacy}=await import(new URL('scenarios.mjs',target));
const get=(s,sc='SC01')=>s.contracts.find(c=>c.scenario===sc);
const step=(s,c,action,actor=c.requesterId)=>d.transition(s,{contractId:c.id,...action},actor);
async function draft(sc='SC01',variation=false){return seedScenario(d.initialState(),sc,variation);}
function submit(s,sc='SC01'){const c=get(s,sc);return step(s,c,{type:'SUBMIT'});}
function approveReviews(s,sc='SC01'){
 for(const t of d.currentRound(get(s,sc))?.tasks||[])s=step(s,get(s,sc),{type:'REVIEW',taskId:t.id,outcome:'APPROVED',comment:'Reviewed current version'},t.userId);
 return s;
}
function finalize(s,sc='SC01'){return step(s,get(s,sc),{type:'FINALIZE',partnerAgreed:true});}
function approveF01(s,sc='SC01'){
 while(get(s,sc).status==='F01_IN_PROGRESS') {const t=d.activeF01(get(s,sc));s=step(s,get(s,sc),{type:'F01',taskId:t.id,outcome:'APPROVED',comment:'Confirmed frozen metadata'},t.userId);}
 return s;
}
async function archive(s,sc='SC01'){
 let c=get(s,sc);s=step(s,c,{type:'SEND_SIGN',signatoryId:'u_signatory'});c=get(s,sc);
 // Partner may sign first; independent evidence and actor constraints still apply.
 s=step(s,c,{type:'SIGN',party:'partner',asset:await fixtureAsset(`${sc}-partner-signed`,'SIGNED_COPY',c.requesterId)});
 s=step(s,get(s,sc),{type:'SIGN',party:'maison',asset:await fixtureAsset(`${sc}-maison-signed`,'SIGNED_COPY','u_signatory')},'u_signatory');
 s=step(s,get(s,sc),{type:'COMPLETE',checklist:[true,true,true]});
 c=get(s,sc);assert.equal(c.status,'SIGNED_ARCHIVED');assert.equal(c.signing.versionId,d.currentVersion(c).id);assert.equal(c.signing.hash,d.currentVersion(c).hash);assert(c.partySnapshot);assert(s.notifications.some(n=>n.userId==='u_acc_readonly'&&n.contractId===c.id));assert(d.canRead(s,c,'u_acc_readonly'));assert(c.audit.every(e=>e.actorId&&e.at&&e.action));
 return s;
}
test('SC01: A template → FIN only → locked V1 F01 → both signatures → archive',async()=>{
 let s=submit(await draft());let c=get(s);assert.equal(c.route,'A');assert.deepEqual(d.currentRound(c).tasks.map(t=>t.group),['FIN_ACC']);
 const initialVersion=d.currentVersion(c).id;s=approveReviews(s);assert.equal(get(s).status,'PENDING_FINALIZATION');s=finalize(s);assert(d.currentVersion(get(s)).locked);assert.equal(d.currentVersion(get(s)).hash.length,64);assert.deepEqual(d.currentF01(get(s)).steps.map(t=>t.group),['REQUESTER','MANAGER','FIN_ACC']);s=await archive(approveF01(s));assert.equal(d.currentVersion(get(s)).id,initialVersion);assert.equal(get(s).rounds.length,1);
});
test('SC02: B goods has Legal + FIN + Procurement in parallel; pending Procurement blocks finalization',async()=>{
 let s=submit(await draft('SC02'),'SC02'),c=get(s,'SC02');assert.equal(c.route,'B');assert.deepEqual(d.currentRound(c).tasks.map(t=>t.group).sort(),['FIN_ACC','LEGAL','PROCUREMENT']);
 for(const t of d.currentRound(c).tasks.filter(t=>t.group!=='PROCUREMENT'))s=step(s,get(s,'SC02'),{type:'REVIEW',taskId:t.id,outcome:'APPROVED',comment:''},t.userId);
 assert.equal(get(s,'SC02').status,'IN_REVIEW');assert.throws(()=>finalize(s,'SC02'));const t=d.currentRound(get(s,'SC02')).tasks.find(t=>t.group==='PROCUREMENT');s=step(s,get(s,'SC02'),{type:'REVIEW',taskId:t.id,outcome:'APPROVED',comment:''},t.userId);s=finalize(s,'SC02');assert.equal(d.currentF01(get(s,'SC02')).steps.at(-1).group,'LEGAL');await archive(approveF01(s,'SC02'),'SC02');
});
test('SC03: all responses before consolidation; V2 resets reviewers; F01-only correction preserves V2 review',async()=>{
 let s=submit(await draft('SC03'),'SC03'),c=get(s,'SC03');const v1=structuredClone(d.currentVersion(c));const legal=d.currentRound(c).tasks.find(t=>t.group==='LEGAL'),fin=d.currentRound(c).tasks.find(t=>t.group==='FIN_ACC');
 s=step(s,c,{type:'REVIEW',taskId:legal.id,outcome:'CHANGES_REQUESTED',comment:'Clarify acceptance criteria'},legal.userId);assert.equal(get(s,'SC03').status,'IN_REVIEW');assert.throws(()=>step(s,get(s,'SC03'),{type:'CONSOLIDATE',comment:'Return'},legal.userId));
 s=step(s,get(s,'SC03'),{type:'REVIEW',taskId:fin.id,outcome:'APPROVED',comment:''},fin.userId);assert.equal(get(s,'SC03').status,'REVIEW_CONSOLIDATION');s=step(s,get(s,'SC03'),{type:'CONSOLIDATE',comment:'Clarify acceptance criteria before resubmission'},legal.userId);
 s=step(s,get(s,'SC03'),{type:'VERSION',asset:await fixtureAsset('SC03-main-V2-revised','CONTRACT_MAIN','u_it_requester')});c=get(s,'SC03');assert.equal(c.rounds.length,2);assert(d.currentRound(c).tasks.every(t=>t.outcome==='PENDING'));assert.deepEqual(c.versions[0],v1);assert.equal(c.rounds[0].tasks.find(t=>t.group==='FIN_ACC').outcome,'APPROVED');
 s=finalize(approveReviews(s,'SC03'),'SC03');const v2id=d.currentVersion(get(s,'SC03')).id;const before=structuredClone(get(s,'SC03').rounds);
 for(let i=0;i<2;i++){const t=d.activeF01(get(s,'SC03'));s=step(s,get(s,'SC03'),{type:'F01',taskId:t.id,outcome:'APPROVED',comment:''},t.userId);}
 const t=d.activeF01(get(s,'SC03'));assert.equal(t.group,'FIN_ACC');s=step(s,get(s,'SC03'),{type:'F01',taskId:t.id,outcome:'CHANGES_REQUESTED',comment:'Attach corrected payment confirmation'},t.userId);
 s=step(s,get(s,'SC03'),{type:'CORRECT_F01',payment:'Corrected F01: net 30 days',total:get(s,'SC03').total,comment:'F01-only payment clarification; main file unchanged'});c=get(s,'SC03');assert.equal(c.versions.length,2);assert.equal(d.currentVersion(c).id,v2id);assert.deepEqual(c.rounds,before);assert.equal(c.f01Runs.length,2);assert(d.currentF01(c).steps.every(t=>t.outcome==='PENDING'));s=await archive(approveF01(s,'SC03'),'SC03');assert.equal(get(s,'SC03').versions.length,2);
});
for(const variation of [false,true])test(`SC04 ${variation?'D partial acceptance':'C quantity annex'}: exemption → departmental F01 → archive`,async()=>{
 let s=submit(await draft('SC04',variation),'SC04'),c=get(s,'SC04');assert.equal(c.route,variation?'D':'C');assert.equal(c.rounds.length,0);assert.equal(c.status,'PENDING_FINALIZATION');assert(c.originalFileId&&c.originalRef==='LEG-2025-008');s=finalize(s,'SC04');assert.deepEqual(d.currentF01(get(s,'SC04')).steps.map(t=>t.group),['REQUESTER','MANAGER']);await archive(approveF01(s,'SC04'),'SC04');
});
test('SC05: draft request needs no initial file; Legal upload does not approve Legal review',async()=>{
 let s=submit(await draft('SC05'),'SC05'),c=get(s,'SC05');assert.equal(c.status,'PENDING_LEGAL_DRAFT');assert.equal(c.versions.length,0);assert.equal(d.getTasks(s,c,'u_legal')[0].label,'Prepare Contract Draft');
 s=step(s,c,{type:'VERSION',asset:await fixtureAsset('SC05-Legal-main-V1','CONTRACT_MAIN','u_legal')},'u_legal');c=get(s,'SC05');assert.equal(c.route,'B');assert.equal(c.status,'IN_REVIEW');assert(d.currentRound(c).tasks.every(t=>t.outcome==='PENDING'));await archive(approveF01(finalize(approveReviews(s,'SC05'),'SC05'),'SC05'),'SC05');
});
test('Routing: strict 23m boundary, source integrity, ambiguous amounts, individual and FX fallback',async()=>{
 const s=await draft(),c=get(s);assert.equal(d.calculateRoute({...c,total:'22999999'},s).route,'A');assert.equal(d.calculateRoute({...c,total:'23000000'},s).route,'B');
 for(const patch of [{total:'0'},{total:''},{total:'-1'},{source:'VENDOR_UPLOAD'},{source:'LEGAL_DRAFT_REQUEST'},{currency:'USD',vnd:'20000000',fxSource:'manual',fxDate:'2026-11-09'},{valueType:'ESTIMATED'},{valueType:'VARIABLE'},{valueType:'NO_PAYMENT'},{versions:[{...d.currentVersion(c),controlled:false}]}])assert.equal(d.calculateRoute({...c,...patch},s).route,'B',JSON.stringify(patch));
 s.parties.find(p=>p.id===c.partyId).kind='INDIVIDUAL';assert.equal(d.calculateRoute({...c,partySnapshot:undefined},s).route,'B');assert.equal(d.calculateRoute(c,s).route,'A','Generated party snapshot stays pinned when directory changes');
});
test('Save incomplete Draft allowed; principle evidence and meaningful value required at Submit',async()=>{
 const s=d.initialState(),c=d.blankContract();const saved=d.transition(s,{type:'SAVE',contract:c});assert.equal(saved.contracts[0].status,'DRAFT');assert.throws(()=>step(saved,c,{type:'SUBMIT'}));
 const full=await draft();get(full).attachments=[];assert(d.validateSubmit(get(full),full).some(x=>x.includes('APPROVED_PRINCIPLE')));
 const variable=await draft('SC02');Object.assign(get(variable,'SC02'),{valueType:'VARIABLE',total:'',basis:'Price per call-off order and separately accepted quantity'});assert.equal(d.validateSubmit(get(variable,'SC02'),variable).length,0);get(variable,'SC02').valueType='MISSING';assert(d.validateSubmit(get(variable,'SC02'),variable).length>0);
});
test('C/D needs original, declaration, reason, unchanged conditions and correct document type',async()=>{
 const s=await draft('SC04'),c=get(s,'SC04');for(const patch of [{affirmed:false},{reason:''},{originalRef:''},{originalFileId:''},{unchanged:false},{construction:true},{documentType:'Liquidation'}]){const bad={...c,...patch};assert.equal(d.calculateRoute(bad,s).route,'B');assert(d.validateSubmit(bad,s).length>0);}
});
test('Named eligible reviewers mandatory; Procurement cannot replace FIN; invalid F01 order rejected',async()=>{
 const s=await draft('SC02'),c=get(s,'SC02');c.reviewers=c.reviewers.filter(t=>t.group!=='FIN_ACC');assert(d.validateSubmit(c,s).some(x=>x.includes('FIN_ACC')));c.reviewers.push({group:'FIN_ACC',userId:'u_procurement'});assert(d.validateSubmit(c,s).some(x=>x.includes('FIN_ACC')));c.f01Assignments.reverse();assert(d.validateSubmit(c,s).some(x=>x.includes('F01')));
});
test('Review comment does not complete; requester/admin cannot approve another reviewer task',async()=>{
 let s=submit(await draft()),c=get(s),t=d.currentRound(c).tasks[0];for(const actor of ['u_it_requester','u_admin','u_legal'])assert.throws(()=>step(s,c,{type:'REVIEW',taskId:t.id,outcome:'APPROVED',comment:''},actor));
 s=step(s,c,{type:'REVIEW',taskId:t.id,outcome:'PENDING',comment:'Need supporting detail'},t.userId);assert.equal(d.currentRound(get(s)).tasks[0].outcome,'PENDING');assert.throws(()=>finalize(s));assert.throws(()=>step(s,get(s),{type:'REVIEW',taskId:t.id,outcome:'CHANGES_REQUESTED',comment:''},t.userId));
});
test('F01 current assignee only; later/replayed tasks denied; locked version/hash required',async()=>{
 let s=finalize(approveReviews(submit(await draft()))),c=get(s),run=d.currentF01(c);const first=run.steps[0],last=run.steps.at(-1);
 assert.throws(()=>step(s,c,{type:'F01',taskId:last.id,outcome:'APPROVED',comment:''},last.userId));assert.throws(()=>step(s,c,{type:'F01',taskId:first.id,outcome:'APPROVED',comment:''},'u_admin'));
 const bad=structuredClone(s);d.currentVersion(get(bad)).hash='mismatch';assert.throws(()=>step(bad,get(bad),{type:'F01',taskId:first.id,outcome:'APPROVED',comment:''},first.userId));
 s=step(s,c,{type:'F01',taskId:first.id,outcome:'APPROVED',comment:''},first.userId);assert.throws(()=>step(s,get(s),{type:'F01',taskId:first.id,outcome:'APPROVED',comment:''},first.userId));
});
test('Same eligible person in different F01 roles still needs separate sequential actions',async()=>{
 let s=await draft('SC02'),c=get(s,'SC02');s.users.find(u=>u.id==='u_fin').groups.push('LEGAL');c.f01Assignments=c.f01Assignments.map(a=>a.group==='LEGAL'?{...a,userId:'u_fin'}:a);s=finalize(approveReviews(submit(s,'SC02'),'SC02'),'SC02');s=approveF01(s,'SC02');assert.equal(d.currentF01(get(s,'SC02')).steps.filter(t=>t.userId==='u_fin'&&t.outcome==='APPROVED').length,2);
});
test('New file during F01 starts fresh full review; frozen old run retained and stale approval denied',async()=>{
 let s=finalize(approveReviews(submit(await draft('SC02'),'SC02'),'SC02'),'SC02'),c=get(s,'SC02');const oldRun=structuredClone(d.currentF01(c)),oldTask=oldRun.steps[0];
 s=step(s,c,{type:'VERSION',asset:await fixtureAsset('SC02-main-V2-during-F01','CONTRACT_MAIN',c.requesterId)});c=get(s,'SC02');assert.equal(c.status,'IN_REVIEW');assert.equal(c.rounds.length,2);assert(d.currentRound(c).tasks.every(t=>t.outcome==='PENDING'));assert.deepEqual(d.currentF01(c),oldRun);assert.throws(()=>step(s,c,{type:'F01',taskId:oldTask.id,outcome:'APPROVED',comment:''},oldTask.userId));
});
test('Routing-critical F01 correction A→B invalidates approvals and requires full B review',async()=>{
 let s=finalize(approveReviews(submit(await draft()))),c=get(s),t=d.activeF01(c);s=step(s,c,{type:'F01',taskId:t.id,outcome:'CHANGES_REQUESTED',comment:'Revise total'},t.userId);s=step(s,get(s),{type:'CORRECT_F01',payment:c.payment,total:'23000000',comment:'Updated amount basis'});c=get(s);assert.equal(c.route,'B');assert.equal(c.status,'IN_REVIEW');assert.deepEqual(d.currentRound(c).tasks.map(t=>t.group),['FIN_ACC','LEGAL']);assert(d.currentRound(c).tasks.every(t=>t.outcome==='PENDING'));
});
test('Complete requires two signature proofs plus all checks; signed records cannot be overwritten',async()=>{
 let s=approveF01(finalize(approveReviews(submit(await draft())))),c=get(s);s=step(s,c,{type:'SEND_SIGN',signatoryId:'u_signatory'});c=get(s);assert.throws(()=>step(s,c,{type:'COMPLETE',checklist:[true,true,true]}));assert.throws(()=>step(s,c,{type:'SIGN',party:'maison',asset:{}},'u_it_requester'));
 s=step(s,c,{type:'SIGN',party:'maison',asset:await fixtureAsset('signature-proof-maison','SIGNED_COPY','u_signatory')},'u_signatory');s=step(s,get(s),{type:'SIGN',party:'partner',asset:await fixtureAsset('signature-proof-partner','SIGNED_COPY','u_it_requester')});assert.throws(()=>step(s,get(s),{type:'COMPLETE',checklist:[true,false,true]}));s=step(s,get(s),{type:'COMPLETE',checklist:[true,true,true]});c=get(s);const snapshot=structuredClone(c.partySnapshot);s.parties.find(p=>p.id===c.partyId).name='Changed directory name';assert.deepEqual(c.partySnapshot,snapshot);assert.throws(()=>d.transition(s,{type:'SAVE',contract:c}));assert.throws(()=>step(s,c,{type:'ATTACH',asset:{}}));assert.throws(()=>step(s,c,{type:'VERSION',asset:{}}));
});
test('Access decisions: no department blanket view, non-assigned assets denied, ACC only signed package',async()=>{
 let s=await draft(),c=get(s);s.users.push({id:'colleague',name:'Another IT person',department:'IT',groups:['REQUESTER'],active:true});assert(!d.canRead(s,c,'colleague'));assert(!d.canRead(s,c,'u_procurement'));assert(!d.canRead(s,c,'u_acc_readonly'));assert(!d.canAccessAsset(s,c.versions[0].fileId,'colleague'));assert(d.canAccessAsset(s,c.versions[0].fileId,'u_fin'));assert.equal(d.getTasks(s,c,'colleague').length,0);
 s=await archive(approveF01(finalize(approveReviews(submit(s)))));c=get(s);assert(d.canAccessAsset(s,c.signing.evidence[0],'u_acc_readonly'));assert(!d.canAccessAsset(s,c.signing.evidence[0],'colleague'));
});
test('Scenario reset deterministic Draft and isolated; serialization preserves state and file fixtures',async()=>{
 let s=await freshDemo();s=submit(s,'SC02');const other=structuredClone(get(s,'SC02'));s=await seedScenario(s,'SC01');assert.deepEqual(get(s,'SC02'),other);assert.equal(get(s).status,'DRAFT');assert.equal(get(s).versions.length,1);assert.equal(get(s).rounds.length,0);assert.equal(get(s).total,'20000000');const reloaded=JSON.parse(JSON.stringify(s));assert.equal(JSON.stringify(reloaded),JSON.stringify(s));assert(s.assets.every(a=>a.fixtureText&&a.hash));
});
test('Legacy drafts / counterparties migrate without modifying original record or faking file evidence',()=>{
 const raw=JSON.stringify([{id:'legacy-123',form:{title:'Legacy draft',kind:'Phụ lục hợp đồng',partner:'Original vendor',file:'old-file.docx',amount:'5000'}}]);const s=migrateLegacy(d.initialState(),raw),c=s.contracts[0];assert.equal(c.id,'legacy-123');assert.equal(c.status,'DRAFT');assert.equal(c.documentType,'Annex');assert.equal(c.versions.length,0);assert(c.keyTerms.includes('old-file.docx'));assert(s.parties.some(p=>p.name==='Original vendor'));
});
test('Business days exclude weekends / holidays; reminders and overdue alerts are deduplicated',async()=>{
 assert.equal(d.addBusinessDays('2026-11-06T02:00:00Z',2,['2026-11-09']).slice(0,10),'2026-11-11');let s=submit(await draft());const c=get(s),t=d.currentRound(c).tasks[0];const due=Date.parse(t.dueAt);s=d.reminders(s,new Date(due-1000).toISOString());s=d.reminders(s,new Date(due-1000).toISOString());assert.equal(s.notifications.filter(n=>n.id.startsWith('reminder:')).length,1);s=d.reminders(s,new Date(due+1000).toISOString());s=d.reminders(s,new Date(due+1000).toISOString());assert.equal(s.notifications.filter(n=>n.id.startsWith('overdue:')).length,1);assert.equal(d.getTasks(s,get(s),'u_fin').length,1);
});
test('Valid downloadable PDF fixtures; SHA-256 derives from exact bytes; empty assets rejected',async()=>{
 const text=mockPdf('Demo approval');assert(text.startsWith('%PDF-1.4'));assert(text.endsWith('%%EOF'));const a=await fixtureAsset('fixture-integrity','OTHER','u_it_requester');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(a.fixtureText)))).map(x=>x.toString(16).padStart(2,'0')).join('');assert.equal(a.hash,hash);await assert.rejects(assetFromBlob(new Blob([]),'empty.pdf','OTHER','u_it_requester'));
});


const {translateText,I18nProvider,LanguageSwitcher,Translated}=await import(new URL('i18n.mjs',target));
test('EN/VI UI labels and statuses translate without changing stored workflow values',async()=>{
 const {createElement}=await import('react');
 const {renderToStaticMarkup}=await import('react-dom/server');
 assert.equal(translateText('Create Contract','vi'),'Tạo hợp đồng');
 assert.equal(translateText('SIGNED_ARCHIVED','vi'),'Đã ký và lưu trữ');
 assert.equal(translateText('Save Draft','en'),'Save Draft');
 assert.equal(translateText('Acme Services (fictional)','vi'),'Acme Services (fictional)');
 assert.equal(translateText('2 business days review','vi'),'2 ngày làm việc soát xét');
 const originalStorage=globalThis.localStorage;
 try {
  globalThis.localStorage={getItem:()=> 'vi'};
  const markup=renderToStaticMarkup(createElement(I18nProvider,null,createElement(LanguageSwitcher),createElement(Translated,{value:'Create Contract'})));
  assert(markup.includes('Tạo hợp đồng'));
  assert(markup.includes('Tiếng Việt'));
  assert(markup.includes('value="vi" selected'));
 } finally {globalThis.localStorage=originalStorage;}
 const state=await draft();const before=JSON.stringify(state);
 translateText(get(state).status,'vi');
 assert.equal(JSON.stringify(state),before);
});
