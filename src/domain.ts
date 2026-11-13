// Prototype policy only. LEGAL_PENDING decisions are deliberately conservative.
export type Group = 'REQUESTER'|'MANAGER'|'FIN_ACC'|'LEGAL'|'PROCUREMENT'|'SPECIALIZED';
export type Route = 'A'|'B'|'C'|'D';
export type Status = 'DRAFT'|'PENDING_LEGAL_DRAFT'|'IN_REVIEW'|'REVIEW_CONSOLIDATION'|'CHANGES_REQUESTED'|'PENDING_FINALIZATION'|'F01_IN_PROGRESS'|'F01_CHANGES_REQUESTED'|'READY_FOR_SIGNING'|'PENDING_SIGNATURE'|'SIGNED_ARCHIVED';
export type Outcome = 'PENDING'|'APPROVED'|'CHANGES_REQUESTED';
export type Source = 'LEGAL_TEMPLATE'|'VENDOR_UPLOAD'|'LEGAL_DRAFT_REQUEST';
export type Category = 'CONTRACT_MAIN'|'APPROVED_PRINCIPLE'|'LEGAL_DOC'|'ORIGINAL_CONTRACT'|'REVIEW_ATTACHMENT'|'SIGNED_COPY'|'OTHER';
export interface User {id:string; name:string; department:string; groups:Group[]; active:boolean; oversight?:boolean; admin?:boolean; signatory?:boolean; acc?:boolean; authorityNote?:string}
export interface Party {id:string; name:string; taxId:string; kind:'ORGANIZATION'|'INDIVIDUAL'; contact:string; representative:string; legalFiles:string[]}
export interface Template {id:string; title:string; version:string; active:boolean; approved:boolean; clauses:string}
export interface Asset {id:string; filename:string; mime:string; size:number; storageKey:string; category:Category; uploadedBy:string; uploadedAt:string; restricted:boolean; hash:string; fixtureText?:string}
export interface Version {id:string; number:number; fileId:string; createdBy:string; createdAt:string; locked:boolean; hash:string; templateId?:string; templateVersion?:string; controlled:boolean}
export interface Assignment {group:Group; userId:string}
export interface Task extends Assignment {id:string; outcome:Outcome; comment:string; completedAt?:string; dueAt?:string}
export interface Round {id:string; number:number; versionId:string; startedAt:string; tasks:Task[]; summary?:string; consolidatedBy?:string}
export interface F01 {id:string; number:number; versionId:string; hash:string; startedAt:string; steps:Task[]; snapshot:Record<string,unknown>}
export interface Audit {id:string; at:string; actorId:string; action:string; from:Status; to:Status; versionId?:string; roundId?:string; runId?:string; comment:string}
export interface Contract {
 id:string; code:string; scenario?:string; title:string; requesterId:string; department:string; project:string;
 documentType:string; transaction:string; source:Source; templateId:string; brief:string; partyId:string;
 valueType:'FIXED'|'ESTIMATED'|'VARIABLE'|'NO_PAYMENT'|'MISSING'; currency:string;
 amount:string; vat:string; pit:string; fees:string; total:string; vnd:string; gross:string; net:string; fxSource:string; fxDate:string; basis:string;
 startDate:string; term:string; payment:string; keyTerms:string; attachments:string[]; originalRef:string; originalTitle:string; originalFileId:string; linkedId:string;
 exemption:''|'QUANTITY'|'RENEWAL'|'UNCHANGED'|'PARTIAL'; affirmed:boolean; reason:string; construction:boolean; unchanged:boolean;
 reviewers:Assignment[]; f01Assignments:Assignment[]; drafterId:string; signatoryId:string; specialized:boolean;
 route?:Route; routingReasons:string[]; status:Status; versions:Version[]; rounds:Round[]; f01Runs:F01[];
 partnerAgreed:boolean; signing?:{versionId:string; hash:string; signatoryId:string; maison:Outcome; partner:Outcome; evidence:string[]; dueAt:string};
 checklist:boolean[]; partySnapshot?:Party; archivedAt?:string; audit:Audit[]; createdAt:string;
}
export interface Notification {id:string; userId:string; contractId:string; text:string; at:string}
export interface State {schema:2; actorId:string; users:User[]; parties:Party[]; templates:Template[]; assets:Asset[]; contracts:Contract[]; notifications:Notification[]; config:{threshold:number; holidays:string[]}}
export const id = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const USERS:User[] = [
 {id:'u_it_requester',name:'IT Requester',department:'IT',groups:['REQUESTER'],active:true},
 {id:'u_it_manager',name:'IT Department Manager',department:'IT',groups:['MANAGER'],active:true},
 {id:'u_fin',name:'FIN / ACC',department:'Finance',groups:['FIN_ACC'],active:true},
 {id:'u_legal',name:'Legal Counsel',department:'Legal',groups:['LEGAL'],active:true,oversight:true},
 {id:'u_procurement',name:'Procurement',department:'Procurement',groups:['PROCUREMENT'],active:true},
 {id:'u_sd',name:'Specialized Reviewer',department:'SD',groups:['SPECIALIZED'],active:true},
 {id:'u_signatory',name:'Maison Signatory',department:'Management',groups:[],active:true,signatory:true,authorityNote:'DEMO authorization only; actual LOA must be verified before production.'},
 {id:'u_acc_readonly',name:'ACC Archive Viewer',department:'Accounting',groups:[],active:true,acc:true},
 {id:'u_admin',name:'Demo Administrator',department:'Admin',groups:[],active:true,admin:true,oversight:true},
];
export const EXEMPTIONS = {
 QUANTITY:'Annex adjusts quantity only; unit price unchanged; NOT construction annex.',
 RENEWAL:'Renewal/extension same counterparty, price and clauses with evidence of approved E-pro.',
 UNCHANGED:'Acceptance/liquidation unchanged content, value and payment terms (scope wording needs Legal confirmation).',
 PARTIAL:'Partial acceptance without changed clauses, not liquidation. Original reference required.',
};
export const DECISIONS = [
 ['LP-01','Draft before E-pro: permitted in demo; approval evidence required at Submit.'],
 ['LP-02','C/D self-attested exemptions and requester/manager confirmation path are provisional.'],
 ['LP-03','Only controlled, pinned mock template generation can qualify A.'],
 ['LP-04','Individual gross/PIT and FX verification: conservative B.'],
 ['LP-05','Estimated, variable and no-payment values: B unless C/D.'],
 ['LP-06','Dynamic F01 roles, order and final-page initials need Legal validation.'],
 ['LP-07','F01-only correction restarts entire F01; unchanged review preserved.'],
 ['LP-08','Signatory list is a mock; real LOA validity requires checking.'],
 ['LP-09','All signatures simulated; licensed provider and certificate checks required.'],
 ['LP-10','Requester completion and wet-ink self-attestation require Legal approval.'],
 ['LP-11','Free-text term/payment representation in F01 requires Legal approval.'],
 ['LP-12','External Word editing only; no automatic diff or SLA extension.'],
 ['LP-13','Date-only business day SLA; no F01 deadline invented.'],
 ['LP-14','Employee/franchise and Cambodia deployment excluded.'],
 ['LP-15','Dummy identity documents; server RBAC, encryption and retention required.'],
 ['LP-16','Approved hash and signed artifact retained; authoritative chain verification pending.'],
 ['LP-17','Procurement required for goods; optional SD separate from manager.'],
];
const assign = (group:Group,userId:string):Assignment => ({group,userId});
export function blankContract(requesterId='u_it_requester'):Contract {
 return {id:id(),code:`CLM-${Date.now().toString().slice(-8)}`,title:'',requesterId,department:'IT',project:'',documentType:'Contract',transaction:'Services',source:'VENDOR_UPLOAD',templateId:'tpl-service',brief:'',partyId:'',valueType:'FIXED',currency:'VND',amount:'',vat:'0',pit:'0',fees:'0',total:'',vnd:'',gross:'',net:'',fxSource:'',fxDate:'',basis:'',startDate:'',term:'',payment:'',keyTerms:'',attachments:[],originalRef:'',originalTitle:'',originalFileId:'',linkedId:'',exemption:'',affirmed:false,reason:'',construction:false,unchanged:false,reviewers:[assign('FIN_ACC','u_fin'),assign('LEGAL','u_legal'),assign('PROCUREMENT','u_procurement'),assign('SPECIALIZED','u_sd')],f01Assignments:[assign('REQUESTER',requesterId),assign('MANAGER','u_it_manager'),assign('FIN_ACC','u_fin'),assign('LEGAL','u_legal')],drafterId:'u_legal',signatoryId:'u_signatory',specialized:false,routingReasons:[],status:'DRAFT',versions:[],rounds:[],f01Runs:[],partnerAgreed:false,checklist:[false,false,false],audit:[],createdAt:now()};
}
export const currentVersion=(c:Contract)=>c.versions.at(-1);
export const currentRound=(c:Contract)=>c.rounds.at(-1);
export const currentF01=(c:Contract)=>c.f01Runs.at(-1);
export const activeF01=(c:Contract)=>currentF01(c)?.steps.find(t=>t.outcome!=='APPROVED');
export const userName=(s:State,userId:string)=>s.users.find(u=>u.id===userId)?.name||userId;
export function eligible(s:State,userId:string,group:Group,c:Contract) {
 const u=s.users.find(u=>u.id===userId);
 return !!u?.active && (group==='REQUESTER'?userId===c.requesterId:group==='MANAGER'?u.groups.includes(group)&&u.department===c.department:u.groups.includes(group));
}
export function canRead(s:State,c:Contract,actor=s.actorId):boolean {
 const u=s.users.find(u=>u.id===actor);
 if(!u?.active)return false;
 if(u.acc)return c.status==='SIGNED_ARCHIVED'&&s.notifications.some(n=>n.userId===actor&&n.contractId===c.id&&n.id.startsWith('archive:'));
 return !!u.oversight||c.requesterId===actor||c.reviewers.some(a=>a.userId===actor&&getRequiredFunctionalGroups(c.route||calculateRoute(c,s).route,c).includes(a.group))||c.f01Assignments.some(a=>a.userId===actor)||c.signatoryId===actor||(c.source==='LEGAL_DRAFT_REQUEST'&&c.drafterId===actor);
}
export function canAccessAsset(s:State,assetId:string,actor=s.actorId):boolean {
 const u=s.users.find(u=>u.id===actor); if(!u?.active)return false;
 const linked=s.contracts.filter(c=>c.attachments.includes(assetId)||c.versions.some(v=>v.fileId===assetId)||c.originalFileId===assetId||c.signing?.evidence.includes(assetId)||(c.partySnapshot?.legalFiles||s.parties.find(p=>p.id===c.partyId)?.legalFiles)?.includes(assetId));
 if(linked.length)return linked.some(c=>canRead(s,c,actor));
 return !!u.oversight||s.assets.some(a=>a.id===assetId&&a.uploadedBy===actor)||(!s.assets.find(a=>a.id===assetId)?.restricted&&s.parties.some(p=>p.legalFiles.includes(assetId)));
}
export function getRequiredFunctionalGroups(route:Route,c:Contract):Group[] {
 if(route==='C'||route==='D')return [];
 if(route==='A')return ['FIN_ACC'];
 return ['FIN_ACC','LEGAL',...(c.transaction==='Goods procurement'?['PROCUREMENT' as Group]:[]),...(c.specialized?['SPECIALIZED' as Group]:[])];
}
export function calculateRoute(c:Contract,s:State):{route:Route; reasons:string[]; flags:string[]} {
 const original=!!((c.originalRef&&c.originalTitle&&s.assets.some(a=>a.id===c.originalFileId&&a.category==='ORIGINAL_CONTRACT'))||(c.linkedId&&s.contracts.some(x=>x.id===c.linkedId&&x.id!==c.id&&x.status==='SIGNED_ARCHIVED'&&canRead(s,x,c.requesterId))));
 const exceptionValid=c.exemption&&c.affirmed&&c.reason.trim()&&original&&c.unchanged&&(
   c.exemption==='QUANTITY'?c.documentType==='Annex'&&!c.construction:
   c.exemption==='PARTIAL'?c.documentType==='Partial acceptance':
   c.exemption==='RENEWAL'?c.documentType==='Renewal':['Acceptance','Liquidation'].includes(c.documentType));
 if(exceptionValid)return {route:c.exemption==='PARTIAL'?'D':'C',reasons:[EXEMPTIONS[c.exemption as keyof typeof EXEMPTIONS],`Requester self-attestation: ${c.reason}`],flags:['LEGAL_PENDING LP-02: exemption and departmental confirmation path are provisional.']};
 const v=currentVersion(c), tpl=s.templates.find(t=>t.id===c.templateId);
 const individual=(c.partySnapshot||s.parties.find(p=>p.id===c.partyId))?.kind==='INDIVIDUAL';
 const templateOK=c.source==='LEGAL_TEMPLATE'&&!!tpl?.approved&&tpl.active&&!!v?.controlled&&v.templateId===tpl.id&&v.templateVersion===tpl.version;
 const amount=Number(c.total);
 if(templateOK&&c.valueType==='FIXED'&&c.currency==='VND'&&!individual&&c.total!==''&&amount>0&&amount<s.config.threshold)return {route:'A',reasons:[`Legal template unchanged AND total <${s.config.threshold.toLocaleString('en-US')} VND`,`${tpl!.title} · pinned ${v!.templateVersion}`],flags:[]};
 const flags:string[]=[];
 if(individual||c.currency!=='VND')flags.push('LEGAL_PENDING LP-04: individual gross/PIT or FX validation; conservative B.');
 if(c.valueType!=='FIXED'||amount===0)flags.push('LEGAL_PENDING LP-05: estimated/variable/zero amounts do not qualify for A.');
 return {route:'B',reasons:[!templateOK?'Vendor, Legal draft, ungenerated/replaced or inactive template requires full review.':'Amount or unresolved value policy requires full review.',...flags],flags};
}
export function defaultF01(c:Contract,route:Route):Assignment[] {
 return [assign('REQUESTER',c.requesterId),assign('MANAGER','u_it_manager'),...getRequiredFunctionalGroups(route,c).filter(g=>g!=='LEGAL').map(g=>c.reviewers.find(a=>a.group===g)!),...(route==='B'?[c.reviewers.find(a=>a.group==='LEGAL')!]:[])].filter(Boolean);
}
export function validateF01(c:Contract,s:State,route:Route):string[] {
 const errors:string[]=[], steps=c.f01Assignments;
 const required:Group[]=['REQUESTER','MANAGER',...getRequiredFunctionalGroups(route,c)];
 for(const group of required)if(!steps.some(t=>t.group===group))errors.push(`F01 cần bước ${group}.`);
 for(const t of steps)if(!eligible(s,t.userId,t.group,c))errors.push(`F01 ${t.group}: người được chọn không có vai trò phù hợp.`);
 if(steps[0]?.group!=='REQUESTER'||steps[1]?.group!=='MANAGER')errors.push('F01 phải bắt đầu Requester → Department Manager.');
 if(route==='A'&&steps.at(-1)?.group!=='FIN_ACC')errors.push('Nhánh A: FIN/ACC phải là bước cuối.');
 if(route==='B'&&steps.at(-1)?.group!=='LEGAL')errors.push('Nhánh B: Legal phải là bước cuối.');
 if((route==='C'||route==='D')&&steps.some(t=>!['REQUESTER','MANAGER'].includes(t.group)))errors.push('C/D chỉ dùng xác nhận trong phòng yêu cầu (LEGAL_PENDING).');
 if(route==='B'){
  const order=['FIN_ACC',...(c.transaction==='Goods procurement'?['PROCUREMENT']:[]),...(c.specialized?['SPECIALIZED']:[]),'LEGAL'];
  if(order.some((g,i)=>i>0&&steps.findIndex(t=>t.group===g)<steps.findIndex(t=>t.group===order[i-1])))errors.push('Thứ tự F01: FIN → Procurement → SD → Legal (nếu áp dụng).');
 }
 return errors;
}
export function validateSubmit(c:Contract,s:State):string[] {
 const e:string[]=[];
 for(const [label,value] of [['Tên hồ sơ',c.title],['Phòng yêu cầu',c.department],['Dự án',c.project],['Dạng văn bản',c.documentType],['Loại giao dịch',c.transaction]])if(!value.trim())e.push(`${label}: bắt buộc.`);
 if(!s.parties.some(p=>p.id===c.partyId))e.push('Chọn đối tác trong danh mục.');
 if(!c.attachments.some(x=>s.assets.some(a=>a.id===x&&a.category==='APPROVED_PRINCIPLE')))e.push('Cần file chứng minh phê duyệt chủ trương (APPROVED_PRINCIPLE).');
 if(c.source==='LEGAL_DRAFT_REQUEST'){
  if(c.brief.trim().length<20)e.push('Nhập yêu cầu Legal soạn thảo (ít nhất 20 ký tự).');
  if(!eligible(s,c.drafterId,'LEGAL',c))e.push('Chọn Legal soạn thảo hợp lệ.');
 }else if(!currentVersion(c)||!s.assets.some(a=>a.id===currentVersion(c)?.fileId&&a.category==='CONTRACT_MAIN'))e.push('Cần file hợp đồng chính hoặc tạo V1 từ mẫu được kiểm soát.');
 if(c.valueType==='MISSING')e.push('Giá trị chưa xác định chỉ được lưu nháp.');
 if(['FIXED','ESTIMATED'].includes(c.valueType)&&(!c.total.trim()||!Number.isFinite(Number(c.total))||Number(c.total)<0))e.push('Nhập tổng thanh toán hợp lệ.');
 if(['VARIABLE','NO_PAYMENT','ESTIMATED'].includes(c.valueType)&&c.basis.trim().length<10)e.push('Nhập cơ sở giá/giải thích không thanh toán (ít nhất 10 ký tự).');
 if(c.valueType==='NO_PAYMENT'&&c.total!=='0')e.push('Không thanh toán: tổng phải bằng 0.');
 for(const k of ['amount','vat','pit','fees','gross','net'] as const)if(c[k]!==''&&(!Number.isFinite(Number(c[k]))||Number(c[k])<0))e.push(`${k}: không được âm hoặc không hợp lệ.`);
 if(c.currency!=='VND'&&(!c.vnd||!Number.isFinite(Number(c.vnd))||Number(c.vnd)<=0||!c.fxSource.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(c.fxDate)||Number.isNaN(Date.parse(c.fxDate))))e.push('Ngoại tệ cần VND tương đương, nguồn và ngày tỷ giá hợp lệ.');
 if(c.startDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(c.startDate)||Number.isNaN(Date.parse(c.startDate))))e.push('Ngày bắt đầu không hợp lệ.');
 const {route}=calculateRoute(c,s);
 if(c.exemption&&route!=='C'&&route!=='D')e.push('Miễn soát xét cần đúng loại văn bản, lý do, xác nhận, điều kiện không đổi và hợp đồng gốc/file. Phụ lục xây dựng không đủ điều kiện C.');
 for(const group of getRequiredFunctionalGroups(route,c))if(c.reviewers.filter(a=>a.group===group).length!==1||!eligible(s,c.reviewers.find(a=>a.group===group)?.userId||'',group,c))e.push(`Chọn đích danh Reviewer ${group} hợp lệ.`);
 e.push(...validateF01(c,s,route));
 return e;
}
export function financialWarning(c:Contract) {
 if(c.amount&&c.total&&Math.abs(Number(c.amount)+Number(c.vat)+Number(c.fees)-Number(c.pit)-Number(c.total))>1)return 'Tổng nhập tay khác giá trị + VAT + phí − PIT. Kiểm tra; hệ thống không thay tổng.';
 return '';
}
export function addBusinessDays(start:string,count:number,holidays:string[]) {
 const d=new Date(start); // Date-only calendar in Vietnam; retain ISO timestamp for ordering.
 let day=new Date(d.getTime()+7*3600000).toISOString().slice(0,10);
 const date=new Date(`${day}T12:00:00Z`);
 while(count>0){date.setUTCDate(date.getUTCDate()+1);day=date.toISOString().slice(0,10);if(![0,6].includes(date.getUTCDay())&&!holidays.includes(day))count--;}
 return `${date.toISOString().slice(0,10)}T16:59:59.000Z`;
}
function notify(s:State,c:Contract,userId:string,text:string,key:string=id()) {if(!s.notifications.some(n=>n.id===key))s.notifications.push({id:key,userId,contractId:c.id,text,at:now()});}
function event(c:Contract,actorId:string,action:string,from:Status,comment='') {c.audit.push({id:id(),at:now(),actorId,action,from,to:c.status,versionId:currentVersion(c)?.id,roundId:currentRound(c)?.id,runId:currentF01(c)?.id,comment});}
function startReview(s:State,c:Contract) {
 const v=currentVersion(c);if(!v)throw Error('Chưa có phiên bản hợp đồng.');
 if(!v.controlled)c.partySnapshot=undefined;
 const route=calculateRoute(c,s);c.route=route.route;c.routingReasons=route.reasons;c.partnerAgreed=false;
 if(c.signing)c.attachments.push(...c.signing.evidence.filter(a=>!c.attachments.includes(a)));
 c.signing=undefined;c.checklist=[false,false,false];
 const groups=getRequiredFunctionalGroups(route.route,c);
 if(!groups.length){c.status='PENDING_FINALIZATION';return;}
 const dueAt=addBusinessDays(now(),c.route==='A'?2:3,s.config.holidays);
 c.rounds.push({id:id(),number:c.rounds.length+1,versionId:v.id,startedAt:now(),tasks:groups.map(group=>{
  const assignment=c.reviewers.find(a=>a.group===group);
  if(!assignment||!eligible(s,assignment.userId,group,c))throw Error(`Thiếu Reviewer ${group}.`);
  return {...assignment,id:id(),outcome:'PENDING',comment:'',dueAt};
 })});c.status='IN_REVIEW';
 for(const t of currentRound(c)!.tasks)notify(s,c,t.userId,`Review ${c.code} · ${t.group} · round ${c.rounds.length}`);
}
function startF01(s:State,c:Contract) {
 const errors=validateF01(c,s,c.route!);if(errors.length)throw Error(errors.join(' '));
 const v=currentVersion(c)!;if(!v?.locked)throw Error('Phiên bản chưa được khóa.');
 c.f01Runs.push({id:id(),number:c.f01Runs.length+1,versionId:v.id,hash:v.hash,startedAt:now(),steps:c.f01Assignments.map(a=>({...a,id:id(),outcome:'PENDING',comment:''})),snapshot:{title:c.title,party:structuredClone(c.partySnapshot||s.parties.find(p=>p.id===c.partyId)),money:{valueType:c.valueType,total:c.total,currency:c.currency,vnd:c.vnd,amount:c.amount,vat:c.vat,pit:c.pit,fees:c.fees},payment:c.payment,term:c.term,keyTerms:c.keyTerms,attachments:[...c.attachments],route:c.route}});
 c.status='F01_IN_PROGRESS';notify(s,c,activeF01(c)!.userId,`F01 ${c.code} · ${activeF01(c)!.group}`);
}
export type Action =
 | {type:'SAVE'; contract:Contract}
 | {type:'SUBMIT'; contractId:string}
 | {type:'ATTACH'; contractId:string; asset:Asset}
 | {type:'VERSION'; contractId:string; asset:Asset; controlled?:boolean}
 | {type:'REVIEW'; contractId:string; taskId:string; outcome:Outcome; comment:string}
 | {type:'CONSOLIDATE'; contractId:string; comment:string}
 | {type:'FINALIZE'; contractId:string; partnerAgreed:boolean}
 | {type:'F01'; contractId:string; taskId:string; outcome:Outcome; comment:string}
 | {type:'CORRECT_F01'; contractId:string; payment:string; total:string; comment:string}
 | {type:'SEND_SIGN'; contractId:string; signatoryId:string}
 | {type:'SIGN'; contractId:string; party:'maison'|'partner'; asset:Asset}
 | {type:'SIGN_RETURN'; contractId:string; comment:string}
 | {type:'COMPLETE'; contractId:string; checklist:boolean[]};
function assert(condition:unknown,message:string):asserts condition {if(!condition)throw Error(message);}
function addAsset(s:State,a:Asset,actorId:string) {assert(!s.assets.some(x=>x.id===a.id),'File đã tồn tại; không được ghi đè.');assert(a.uploadedBy===actorId&&a.hash&&a.size>0,'File/actor/hash không hợp lệ.');s.assets.push(a);}
export function transition(state:State,action:Action,actor=state.actorId):State {
 const s=structuredClone(state);const actorUser=s.users.find(u=>u.id===actor);assert(actorUser?.active,'Tài khoản không hoạt động.');
 if(action.type==='SAVE'){
  const old=s.contracts.find(c=>c.id===action.contract.id);
  assert(actorUser.groups.includes('REQUESTER')&&action.contract.requesterId===actor&&(!old||old.requesterId===actor&&old.status==='DRAFT'),'Chỉ Requester chủ hồ sơ được lưu Draft.');
  const c=structuredClone(action.contract);
  // Editable metadata is separate from immutable workflow, assets and approvals.
  const fresh=blankContract(actor);
  c.status='DRAFT';c.route=undefined;c.routingReasons=[];c.audit=old?.audit||[];c.rounds=old?.rounds||[];c.f01Runs=old?.f01Runs||[];c.versions=old?.versions||[];c.attachments=old?.attachments||[];c.originalFileId=old?.originalFileId||'';c.signing=undefined;c.partnerAgreed=false;c.partySnapshot=currentVersion(c)?.controlled?old?.partySnapshot:undefined;c.archivedAt=undefined;c.checklist=fresh.checklist;
  if(currentVersion(c)?.controlled&&['templateId','source','title','partyId','total','amount','payment','term','keyTerms','startDate','currency','vat','pit','fees','project','documentType','transaction'].some(k=>old?.[k as keyof Contract]!==c[k as keyof Contract]))assert(false,'Thông tin đã thay đổi sau khi tạo mẫu. Xóa phiên bản bằng Reset Scenario hoặc tạo hồ sơ mới để tạo lại mẫu; không dùng sai nội dung V1.');
  event(c,actor,'SAVE_DRAFT','DRAFT');s.contracts=old?s.contracts.map(x=>x.id===c.id?c:x):[c,...s.contracts];return s;
 }
 const c=s.contracts.find(c=>c.id===action.contractId);assert(c&&canRead(s,c,actor),'Không có quyền truy cập hồ sơ.');
 const from=c.status,owner=c.requesterId===actor,v=currentVersion(c);
 switch(action.type){
  case 'SUBMIT': {
   assert(owner&&c.status==='DRAFT','Chỉ chủ hồ sơ được Submit Draft.');const errors=validateSubmit(c,s);assert(!errors.length,errors.join('\n'));
   const r=calculateRoute(c,s);c.route=r.route;c.routingReasons=r.reasons;
   if(c.source==='LEGAL_DRAFT_REQUEST'&&!v){c.status='PENDING_LEGAL_DRAFT';notify(s,c,c.drafterId,`Prepare Contract Draft · ${c.code}`);}else startReview(s,c);
   event(c,actor,'SUBMIT',from,[...r.reasons,...r.flags].join(' '));break;
  }
  case 'ATTACH': {
   const review=c.status==='IN_REVIEW'&&currentRound(c)?.tasks.some(t=>t.userId===actor);
   assert(c.status!=='SIGNED_ARCHIVED'&&(owner||review),'Không được đính kèm hồ sơ này.');
   assert(!['CONTRACT_MAIN','SIGNED_COPY'].includes(action.asset.category),'Dùng thao tác phiên bản/ký cho loại file này.');
   if(review&&!owner)assert(action.asset.category==='REVIEW_ATTACHMENT','Reviewer chỉ tải file nhận xét.');
   assert(c.status!=='F01_IN_PROGRESS'&&c.status!=='READY_FOR_SIGNING'&&c.status!=='PENDING_SIGNATURE','Hồ sơ đang khóa; cần yêu cầu sửa F01 trước.');
   addAsset(s,action.asset,actor);c.attachments.push(action.asset.id);if(action.asset.category==='ORIGINAL_CONTRACT')c.originalFileId=action.asset.id;
   event(c,actor,'ATTACH_FILE',from,action.asset.filename);break;
  }
  case 'VERSION': {
   const drafting=c.status==='PENDING_LEGAL_DRAFT'&&actor===c.drafterId&&eligible(s,actor,'LEGAL',c);
   assert(drafting||owner&&['DRAFT','CHANGES_REQUESTED','F01_CHANGES_REQUESTED','IN_REVIEW','REVIEW_CONSOLIDATION','PENDING_FINALIZATION','F01_IN_PROGRESS','READY_FOR_SIGNING'].includes(c.status),'Không được thay phiên bản ở trạng thái này.');
   assert(action.asset.category==='CONTRACT_MAIN','Cần CONTRACT_MAIN.');assert(!c.versions.some(x=>x.hash===action.asset.hash),'File không đổi; hãy tải nội dung mới.');
   const controlled=!!action.controlled;const tpl=s.templates.find(t=>t.id===c.templateId);
   if(controlled)assert(owner&&c.status==='DRAFT'&&!v&&c.source==='LEGAL_TEMPLATE'&&tpl?.active&&tpl.approved&&action.asset.fixtureText===templateContent(c,s),'Chỉ hệ thống tạo mẫu được kiểm soát từ thư viện hoạt động.');
   addAsset(s,action.asset,actor);c.versions.push({id:id(),number:c.versions.length+1,fileId:action.asset.id,createdBy:actor,createdAt:now(),locked:false,hash:action.asset.hash,controlled,templateId:controlled?tpl?.id:undefined,templateVersion:controlled?tpl?.version:undefined});
   if(controlled)c.partySnapshot=structuredClone(s.parties.find(p=>p.id===c.partyId)!);
   else c.partySnapshot=undefined;
   if(from!=='DRAFT'){
    const r=calculateRoute(c,s);const errors=getRequiredFunctionalGroups(r.route,c).filter(g=>!eligible(s,c.reviewers.find(a=>a.group===g)?.userId||'',g,c));assert(!errors.length,'Thiếu Reviewer bắt buộc cho phiên bản mới.');
    c.f01Assignments=validAssignmentsForRoute(c,s,r.route);startReview(s,c);
   }
   event(c,actor,drafting?'LEGAL_DRAFT_V1':'NEW_CONTRACT_VERSION',from,`${action.asset.filename}; route ${c.route||calculateRoute(c,s).route}; assigned reviewers ${c.reviewers.map(a=>`${a.group}:${a.userId}`).join(', ')}; F01 ${c.f01Assignments.map(a=>`${a.group}:${a.userId}`).join(' → ')}`);break;
  }
  case 'REVIEW': {
   assert(c.status==='IN_REVIEW','Không có vòng review đang mở.');const round=currentRound(c)!;assert(round.versionId===v?.id,'Sai phiên bản review.');
   const t=round.tasks.find(t=>t.id===action.taskId);assert(t&&t.userId===actor&&t.outcome==='PENDING'&&eligible(s,actor,t.group,c),'Không phải task review của bạn.');
   if(action.outcome==='CHANGES_REQUESTED')assert(action.comment.trim(),'Cần lý do yêu cầu sửa.');
   if(action.outcome!=='PENDING'){t.outcome=action.outcome;t.completedAt=now();t.comment=action.comment;}
   else assert(action.comment.trim(),'Nhập nội dung nhận xét.');
   if(round.tasks.every(t=>t.outcome!=='PENDING')){
    if(round.tasks.every(t=>t.outcome==='APPROVED')){c.status='PENDING_FINALIZATION';notify(s,c,c.requesterId,`All reviews approved · ${c.code}`);}else{c.status='REVIEW_CONSOLIDATION';const group=c.route==='A'?'FIN_ACC':'LEGAL';notify(s,c,round.tasks.find(t=>t.group===group)!.userId,`Consolidate feedback · ${c.code}`);}
   }
   event(c,actor,action.outcome==='PENDING'?'REVIEW_COMMENT':`REVIEW_${action.outcome}`,from,`${t.group}: ${action.comment}`);break;
  }
  case 'CONSOLIDATE': {
   const round=currentRound(c);assert(c.status==='REVIEW_CONSOLIDATION'&&round&&round.tasks.every(t=>t.outcome!=='PENDING')&&round.tasks.some(t=>t.outcome==='CHANGES_REQUESTED'),'Chờ tất cả Reviewer phản hồi.');
   assert(round.tasks.find(t=>t.group===(c.route==='A'?'FIN_ACC':'LEGAL'))?.userId===actor,'Chỉ Legal (B) hoặc FIN (A) tổng hợp.');assert(action.comment.trim(),'Cần nội dung tổng hợp.');
   round.summary=action.comment;round.consolidatedBy=actor;c.status='CHANGES_REQUESTED';notify(s,c,c.requesterId,`Changes requested · ${c.code}`);event(c,actor,'CONSOLIDATE_RETURN',from,action.comment);break;
  }
  case 'FINALIZE': {
   assert(owner&&c.status==='PENDING_FINALIZATION'&&v,'Chỉ chủ hồ sơ được chốt phiên bản sau review.');
   const r=calculateRoute(c,s);assert(r.route===c.route,'Nhánh đã thay đổi; cần xét lại hồ sơ.');
   assert(c.route==='C'||c.route==='D'||currentRound(c)?.versionId===v.id&&currentRound(c)?.tasks.every(t=>t.outcome==='APPROVED'),'Review chưa hoàn tất.');
   assert(action.partnerAgreed,'Cần xác nhận đối tác đồng ý.');v.locked=true;c.partnerAgreed=true;c.partySnapshot||=structuredClone(s.parties.find(p=>p.id===c.partyId)!);startF01(s,c);event(c,actor,'FINALIZE_LOCK_SEND_F01',from,`SHA-256 ${v.hash}; partner agreement confirmed; counterparty snapshot frozen`);break;
  }
  case 'F01': {
   const run=currentF01(c),t=activeF01(c);assert(c.status==='F01_IN_PROGRESS'&&run&&v?.locked&&run.versionId===v.id&&run.hash===v.hash,'F01 phải đúng phiên bản đã khóa.');
   assert(t?.id===action.taskId&&t.userId===actor&&t.outcome==='PENDING'&&eligible(s,actor,t.group,c),'Chỉ người được giao bước F01 hiện tại được thao tác.');
   if(action.outcome==='PENDING')assert(action.comment.trim(),'Nhập nhận xét.');
   else {if(action.outcome==='CHANGES_REQUESTED')assert(action.comment.trim(),'Cần lý do yêu cầu sửa.');t.outcome=action.outcome;t.comment=action.comment;t.completedAt=now();
    if(action.outcome==='CHANGES_REQUESTED'){c.status='F01_CHANGES_REQUESTED';notify(s,c,c.requesterId,`F01 correction requested · ${c.code}`);}else if(!activeF01(c))c.status='READY_FOR_SIGNING';else notify(s,c,activeF01(c)!.userId,`F01 ${c.code} · ${activeF01(c)!.group}`);
   }
   event(c,actor,action.outcome==='PENDING'?'F01_COMMENT':`F01_${action.outcome}`,from,`${t.group}: ${action.comment}`);break;
  }
  case 'CORRECT_F01': {
   assert(owner&&c.status==='F01_CHANGES_REQUESTED'&&v,'Chỉ chủ hồ sơ sửa F01 bị trả về.');assert(action.comment.trim(),'Nêu nội dung sửa F01.');
   c.payment=action.payment;c.total=action.total;const r=calculateRoute(c,s);c.f01Assignments=validAssignmentsForRoute(c,s,r.route);const errors=validateSubmit(c,s);assert(!errors.length,errors.join('\n'));
   if(r.route!==c.route){startReview(s,c);}else startF01(s,c);
   event(c,actor,'F01_CORRECTION_REVALIDATED',from,action.comment);break;
  }
  case 'SEND_SIGN': {
   const run=currentF01(c);assert(owner&&c.status==='READY_FOR_SIGNING'&&run&&v?.locked&&run.versionId===v.id&&run.hash===v.hash&&run.steps.every(t=>t.outcome==='APPROVED'),'Cần hoàn tất F01 đúng phiên bản.');
   assert(s.users.some(u=>u.id===action.signatoryId&&u.active&&u.signatory),'Chọn người ký được ủy quyền trong danh sách.');
   c.signatoryId=action.signatoryId;c.signing={versionId:v.id,hash:v.hash,signatoryId:action.signatoryId,maison:'PENDING',partner:'PENDING',evidence:[],dueAt:addBusinessDays(now(),3,s.config.holidays)};c.status='PENDING_SIGNATURE';notify(s,c,c.signatoryId,`Simulated signing · ${c.code}`);event(c,actor,'SEND_FOR_SIGNATURE',from);break;
  }
  case 'SIGN': {
   const sign=c.signing;assert(c.status==='PENDING_SIGNATURE'&&sign&&sign.versionId===v?.id&&sign.hash===v.hash,'Sai phiên bản ký.');
   assert(action.party==='maison'?actor===sign.signatoryId&&s.users.some(u=>u.id===actor&&u.active&&u.signatory):owner,'Không được ghi nhận chữ ký bên này.');
   assert(sign[action.party]==='PENDING','Chữ ký/evidence đã ghi nhận; không được ghi đè.');assert(action.asset.category==='SIGNED_COPY','Cần bằng chứng ký.');addAsset(s,action.asset,actor);sign.evidence.push(action.asset.id);sign[action.party]='APPROVED';event(c,actor,action.party==='maison'?'SIMULATE_OR_RECORD_MAISON_SIGNATURE':'RECORD_PARTNER_SIGNED_COPY',from,`${action.asset.filename} · DEMO, no legal signature validation`);break;
  }
  case 'SIGN_RETURN': {
   assert(c.status==='PENDING_SIGNATURE'&&c.signing?.signatoryId===actor&&actorUser.signatory&&action.comment.trim(),'Chỉ người ký được trả về với lý do.');c.status='F01_CHANGES_REQUESTED';c.attachments.push(...c.signing.evidence.filter(a=>!c.attachments.includes(a)));c.signing=undefined;notify(s,c,c.requesterId,`Signatory requested changes · ${c.code}`);event(c,actor,'SIGNATORY_RETURN',from,action.comment);break;
  }
  case 'COMPLETE': {
   const sign=c.signing;assert(owner&&c.status==='PENDING_SIGNATURE'&&sign?.maison==='APPROVED'&&sign.partner==='APPROVED'&&sign.evidence.length>=2&&sign.versionId===v?.id&&sign.hash===v.hash,'Cần đủ chữ ký/bằng chứng hai bên đúng phiên bản.');
   assert(action.checklist.length===3&&action.checklist.every(Boolean),'Cần xác nhận đủ checklist: chữ ký, đúng phiên bản, bản gốc.');
   c.checklist=action.checklist;c.partySnapshot||=structuredClone(s.parties.find(p=>p.id===c.partyId)!);c.status='SIGNED_ARCHIVED';c.archivedAt=now();
   for(const u of s.users.filter(u=>u.active&&(u.acc||u.oversight||u.id===c.requesterId)))notify(s,c,u.id,`Signed package archived · ${c.code}`,`archive:${c.id}:${u.id}`);
   event(c,actor,'COMPLETE_ARCHIVE_NOTIFY_ACC',from,'Requester attests signatures, approved version match and original handling. LEGAL_PENDING LP-10.');break;
  }
 }
 return s;
}
function validAssignmentsForRoute(c:Contract,s:State,route:Route) {return validateF01(c,s,route).length?defaultF01(c,route):c.f01Assignments;}
export function getTasks(s:State,c:Contract,actor=s.actorId):{id:string; label:string; userId:string; dueAt?:string}[] {
 if(!canRead(s,c,actor))return [];
 let tasks:{id:string;label:string;userId:string;dueAt?:string}[]=[];
 if(c.status==='DRAFT')tasks=[{id:'submit',label:'Complete Draft & Submit',userId:c.requesterId}];
 if(c.status==='PENDING_LEGAL_DRAFT')tasks=[{id:'draft',label:'Prepare Contract Draft',userId:c.drafterId}];
 if(c.status==='IN_REVIEW')tasks=currentRound(c)!.tasks.filter(t=>t.outcome==='PENDING').map(t=>({...t,label:`Review · ${t.group}`}));
 if(c.status==='REVIEW_CONSOLIDATION')tasks=[{id:'consolidate',label:'Consolidate & Return',userId:currentRound(c)!.tasks.find(t=>t.group===(c.route==='A'?'FIN_ACC':'LEGAL'))!.userId}];
 if(['CHANGES_REQUESTED','F01_CHANGES_REQUESTED','PENDING_FINALIZATION','READY_FOR_SIGNING'].includes(c.status))tasks=[{id:'owner',label:({CHANGES_REQUESTED:'Upload Revised Version',F01_CHANGES_REQUESTED:'Correct F01 or Main Version',PENDING_FINALIZATION:'Finalize Contract & Send F01',READY_FOR_SIGNING:'Send for Signature'} as Record<string,string>)[c.status],userId:c.requesterId}];
 if(c.status==='F01_IN_PROGRESS'){const t=activeF01(c)!;tasks=[{id:t.id,label:`F01 · ${t.group}`,userId:t.userId}];}
 if(c.status==='PENDING_SIGNATURE'){
  if(c.signing?.maison==='PENDING')tasks.push({id:'sign',label:'Simulate Maison Signature / Offline Copy',userId:c.signing.signatoryId,dueAt:c.signing.dueAt});
  tasks.push({id:'complete',label:c.signing?.partner==='PENDING'?'Record Partner Signed Copy':'Verify Checklist & Complete Contract',userId:c.requesterId,dueAt:c.signing?.dueAt});
 }
 return tasks.filter(t=>t.userId===actor);
}
export function reminders(state:State,at=now()):State {
 const s=structuredClone(state),date=new Date(at).getTime();
 for(const c of s.contracts)for(const u of s.users)for(const t of getTasks(s,c,u.id)){
  if(!t.dueAt)continue;const delta=Date.parse(t.dueAt)-date;
  if(delta<0)notify(s,c,u.id,`Overdue: ${t.label} · ${c.code}`,`overdue:${c.id}:${currentRound(c)?.id}:${t.id}`);
  else if(delta<=86400000)notify(s,c,u.id,`Due soon: ${t.label} · ${c.code}`,`reminder:${c.id}:${currentRound(c)?.id}:${t.id}`);
 }
 return s;
}
export function templateContent(c:Contract,s:State) {
 const tpl=s.templates.find(t=>t.id===c.templateId);assert(tpl?.active&&tpl.approved,'Mẫu chưa được Legal duyệt/không hoạt động.');
 return `MAISON CLM — MOCK TEMPLATE, NOT A LEGAL DOCUMENT\n${tpl.title} / ${tpl.version}\nPROTECTED CLAUSES\n${tpl.clauses}\nCONTROLLED FIELDS\n${JSON.stringify({code:c.code,title:c.title,party:c.partySnapshot||s.parties.find(p=>p.id===c.partyId),project:c.project,documentType:c.documentType,transaction:c.transaction,amount:c.amount,vat:c.vat,pit:c.pit,fees:c.fees,total:c.total,currency:c.currency,startDate:c.startDate,term:c.term,payment:c.payment,keyTerms:c.keyTerms},null,2)}`;
}
export function initialState():State {
 return {schema:2,actorId:'u_it_requester',users:structuredClone(USERS),parties:[
  {id:'acme',name:'Acme Services (fictional)',taxId:'DEMO-ACME',kind:'ORGANIZATION',contact:'contact@acme.example',representative:'Demo Representative',legalFiles:[]},
  {id:'xyz',name:'XYZ Vendor (fictional)',taxId:'DEMO-XYZ',kind:'ORGANIZATION',contact:'vendor@xyz.example',representative:'Demo Representative',legalFiles:[]},
  ...[['HD-2026-018','Công ty An Phát (mock)'],['HD-2026-042','Công ty Minh Long (mock)'],['HD-2026-067','Công ty Build Studio (mock)']].map(([key,name])=>({id:key,name,taxId:key,kind:'ORGANIZATION' as const,contact:'',representative:'Demo',legalFiles:[]})),
 ],templates:[{id:'tpl-service',title:'Service Agreement · MOCK',version:'DEMO-v1',active:true,approved:true,clauses:'Services shall be performed as agreed. Amendments require written agreement. This mock wording is not an approved legal instrument.'},{id:'tpl-goods',title:'Goods Agreement · MOCK',version:'DEMO-v1',active:true,approved:true,clauses:'Goods shall meet agreed specifications. This document is a demonstration placeholder.'},{id:'tpl-framework',title:'Framework Agreement · MOCK',version:'DEMO-v1',active:true,approved:true,clauses:'Orders are subject to separate agreed terms. Demonstration only.'}],assets:[],contracts:[],notifications:[],config:{threshold:23000000,holidays:['2026-01-01','2026-04-30','2026-05-01','2026-09-02']}};
}
