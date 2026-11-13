import {type State,type Contract,blankContract,initialState,calculateRoute,defaultF01,templateContent,transition} from './domain';
import {fixtureAsset,assetFromBlob} from './assets';
export const SCENARIOS = [
 {id:'SC01',title:'Legal Template Fast Track',route:'A',steps:'Requester Submit → FIN review → Requester partner agreement & Finalize → F01 Requester / Manager / FIN → Requester send signing → Signatory simulate → Requester record partner & complete.'},
 {id:'SC02',title:'Vendor Goods · Full Review',route:'B',steps:'Submit → Legal & FIN approve; Procurement pending must block finalization → Procurement approve → Finalize → F01 Requester / Manager / FIN / Procurement / Legal → signing → archive.'},
 {id:'SC03',title:'Version V2 & F01 Correction',route:'B',steps:'Submit → FIN approve + Legal request changes → Legal consolidate → Requester upload revised V2 → FIN & Legal reapprove → Finalize → F01 Requester / Manager approve, FIN requests changes → Requester correct F01 only → whole F01 reruns on V2 → signing → archive.'},
 {id:'SC04',title:'Annex Exemption · C / D',route:'C',steps:'Inspect legacy original + self-attestation → Submit → no cross-functional review → Finalize → Requester / Manager F01 → signing → archive. Use D variation before submitting for partial acceptance.'},
 {id:'SC05',title:'Request Legal Draft',route:'B',steps:'Submit without main file → Legal Prepare Contract Draft (upload V1) → distinct Legal & FIN review approvals → Finalize → Requester / Manager / FIN / Legal F01 → signing → archive.'},
];
export async function seedScenario(state:State,scenario:string,variationD=false):Promise<State> {
 if(!SCENARIOS.some(x=>x.id===scenario))throw Error('Scenario không hợp lệ.');
 let s=structuredClone(state);const old=s.contracts.find(c=>c.scenario===scenario);
 const c=blankContract();c.id=`demo-${scenario}`;c.code=`CLM-2026-${scenario}`;c.scenario=scenario;
 c.project='Maison IT · Demo';c.partyId=scenario==='SC02'?'xyz':'acme';c.title=SCENARIOS.find(x=>x.id===scenario)!.title;
 c.amount=c.total=scenario==='SC01'?'20000000':scenario==='SC02'?'500000000':'85000000';
 c.term='12 months from acceptance; progress by mutual agreement.';c.payment='Bank transfer within 30 days of acceptance and valid invoice.';c.keyTerms='DEMO ONLY: scope, confidentiality and acceptance per attached mock.';
 c.brief='Please draft a consulting agreement covering service scope, deliverables, confidentiality, fees and acceptance.';
 c.source=scenario==='SC01'?'LEGAL_TEMPLATE':scenario==='SC05'?'LEGAL_DRAFT_REQUEST':'VENDOR_UPLOAD';
 if(scenario==='SC02')c.transaction='Goods procurement';
 if(scenario==='SC04'){
  c.documentType=variationD?'Partial acceptance':'Annex';c.exemption=variationD?'PARTIAL':'QUANTITY';c.affirmed=true;c.unchanged=true;c.reason=variationD?'Partial acceptance of delivered goods; no changed clauses; not liquidation.':'Quantity only; unit price unchanged; this is not a construction annex.';c.originalRef='LEG-2025-008';c.originalTitle='Legacy supply agreement (fictional)';
 }
 // Only this scenario and its notifications reset. Historical assets remain immutable.
 if(old)s.contracts=s.contracts.filter(x=>x.id!==old.id);
 s.notifications=s.notifications.filter(n=>n.contractId!==c.id);s.actorId=c.requesterId;
 c.f01Assignments=defaultF01(c,scenario==='SC01'?'A':scenario==='SC04'?(variationD?'D':'C'):'B');
 s=transition(s,{type:'SAVE',contract:c});
 s=transition(s,{type:'ATTACH',contractId:c.id,asset:await fixtureAsset(`${scenario}-approved-principle-DEMO`,'APPROVED_PRINCIPLE',c.requesterId)});
 if(scenario==='SC04')s=transition(s,{type:'ATTACH',contractId:c.id,asset:await fixtureAsset('LEG-2025-008-original-DEMO','ORIGINAL_CONTRACT',c.requesterId)});
 const saved=s.contracts.find(x=>x.id===c.id)!;
 if(scenario==='SC01'){
  const text=templateContent(saved,s);s=transition(s,{type:'VERSION',contractId:c.id,controlled:true,asset:await assetFromBlob(new Blob([text],{type:'text/plain'}),'controlled-service-DEMO-v1.txt','CONTRACT_MAIN',c.requesterId,text)});
 }else if(scenario!=='SC05')s=transition(s,{type:'VERSION',contractId:c.id,asset:await fixtureAsset(`${scenario}-vendor-main-V1-DEMO`,'CONTRACT_MAIN',c.requesterId)});
 return s;
}
export async function freshDemo() {let s=initialState();for(const scenario of SCENARIOS)s=await seedScenario(s,scenario.id);return s;}
export function migrateLegacy(s:State,raw:string|null):State {
 if(!raw)return s;
 try {
  const records=JSON.parse(raw) as {id:string;form:Record<string,string>;status:string}[];
  for(const r of records){if(!r.form||s.contracts.some(c=>c.id===r.id))continue;const f=r.form,c=blankContract();
   c.id=r.id;c.code=r.id;c.title=f.title||'Imported legacy draft';c.amount=c.total=f.amount||'';c.project='Legacy import';c.payment=f.payment||'';c.term=f.terms||'';c.brief=f.purpose||'';c.keyTerms=`Imported legacy metadata. Original file name: ${f.file||'none'}; bytes were not retained in CLM-001. Reattach evidence before Submit. ${f.changes||''}`;
   const names:Record<string,string>={'Hợp đồng':'Contract','Hợp đồng khung/nguyên tắc':'Framework','Phụ lục hợp đồng':'Annex','Bản ghi nhớ (MOU)':'MOU','Biên bản thanh lý':'Liquidation','Biên bản nghiệm thu':'Acceptance'};c.documentType=names[f.kind]||'Contract';c.transaction=f.transaction==='Mua hàng'?'Goods procurement':'Services';
   let party=s.parties.find(p=>p.name===f.partner);if(!party&&f.partner){party={id:`legacy-party-${r.id}`,name:f.partner,taxId:'',kind:'ORGANIZATION',contact:'',representative:'',legalFiles:[]};s.parties.push(party);}c.partyId=party?.id||'';
   c.source=f.source==='Yêu cầu Legal soạn mới'?'LEGAL_DRAFT_REQUEST':'VENDOR_UPLOAD';c.originalRef=f.original||'';c.f01Assignments=defaultF01(c,calculateRoute(c,s).route);s=transition(s,{type:'SAVE',contract:c},c.requesterId);
  }
 }catch{/* Old key stays untouched, even if malformed. */}
 return s;
}
