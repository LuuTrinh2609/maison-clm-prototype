import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, Files, Plus, BookOpen, Users, Settings, FlaskConical, ArrowLeft, ShieldCheck, ChevronRight, Search, FileText } from 'lucide-react';
import { type State, type Contract, type Category, type Group, type Action, type Party, type User, blankContract, calculateRoute, getRequiredFunctionalGroups, validateSubmit, defaultF01, currentVersion, currentRound, currentF01, activeF01, canRead, getTasks, transition, userName, eligible, EXEMPTIONS, DECISIONS, financialWarning, templateContent, reminders, id } from './domain';
import { assetFromBlob, fixtureAsset, downloadAsset } from './assets';
import { SCENARIOS, freshDemo, seedScenario, migrateLegacy } from './scenarios';
import './style.css';
import { I18nProvider, LanguageSwitcher, Translated, useTranslate } from './i18n';
const STORAGE = 'maison-clm-functional-v2';
const date = (iso?: string) => iso ? new Date(iso).toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—';
const money = (c: Contract) => c.total !== '' ? `${Number(c.total).toLocaleString('en-US')} ${c.currency}` : c.valueType;
type Run = (work: () => void | Promise<void>) => Promise<void>;
function Field({ label, value, onChange, type = 'text', disabled = false }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    disabled?: boolean;
}) {
    const translate = useTranslate();
    return <label className="field"><Translated value={label}/><input type={type} value={value} disabled={disabled} min={type === 'number' ? 0 : undefined} onChange={e => onChange(e.target.value)}/></label>;
}
function Select({ label, value, onChange, options, disabled = false }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: (string | [
        string,
        string
    ])[];
    disabled?: boolean;
}) {
    const translate = useTranslate();
    return <label className="field"><Translated value={label}/><select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}><Translated value={options.map(o => { const [v, text] = typeof o === 'string' ? [o, o] : o; return <option key={v} value={v}><Translated value={text}/></option>; })}/></select></label>;
}
function Text({ label, value, onChange, disabled = false }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}) {
    const translate = useTranslate();
    return <label className="field"><Translated value={label}/><textarea value={value} onChange={e => onChange(e.target.value)} disabled={disabled}/></label>;
}
function Check({ label, checked, onChange }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    const translate = useTranslate();
    return <label className="check"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}/><Translated value={label}/></label>;
}
function Upload({ label, onFile, disabled = false }: {
    label: string;
    onFile: (file: File) => Promise<void>;
    disabled?: boolean;
}) {
    const translate = useTranslate();
    return <label className="upload"><Translated value={label}/><input type="file" disabled={disabled} accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f)
        await onFile(f); }}/><small>{translate("Word / PDF / image / text · 25 MB maximum · persisted in IndexedDB")}</small></label>;
}
function Deadline({ due, pending }: {
    due?: string;
    pending: boolean;
}) {
    const translate = useTranslate();
    return due ? <small className={pending && Date.parse(due) < Date.now() ? 'overdue' : ''}><Translated value={pending && Date.parse(due) < Date.now() ? 'Overdue · ' : ''}/>{translate("Due") + " "}<Translated value={date(due)}/></small> : null;
}
function Routing({ c, s }: {
    c: Contract;
    s: State;
}) {
    const translate = useTranslate();
    const r = calculateRoute(c, s), groups = getRequiredFunctionalGroups(r.route, c);
    return <><div className="route-badge">{translate("Branch") + " "}<Translated value={r.route}/>{translate("·")}<Translated value={groups.length ? `${r.route === 'A' ? 2 : 3} business days review` : 'Department confirmation · LEGAL_PENDING'}/></div><h3>{translate("Why this route?")}</h3><Translated value={r.reasons.map(x => <p className="reason" key={x}><Translated value={x}/></p>)}/><p className="info">{translate("Required reviewers:") + " "}<Translated value={groups.join(' + ') || 'No cross-functional reviewers (C/D)'}/></p><Translated value={r.flags.map(x => <p className="pending" key={x}><Translated value={x}/></p>)}/></>;
}
function AttachmentInput({ c, onFile, reviewer = false }: {
    c: Contract;
    onFile: (file: File, category: Category) => Promise<void>;
    reviewer?: boolean;
}) {
    const translate = useTranslate();
    const [category, setCategory] = useState<Category>(reviewer ? 'REVIEW_ATTACHMENT' : 'APPROVED_PRINCIPLE');
    return <div className="attachment-zone"><Select label={translate("Common multi-file attachments · category")} value={category} options={reviewer ? ['REVIEW_ATTACHMENT'] : ['APPROVED_PRINCIPLE', 'ORIGINAL_CONTRACT', 'LEGAL_DOC', 'REVIEW_ATTACHMENT', 'OTHER']} onChange={v => setCategory(v as Category)}/><label className="upload">{translate("Attach supporting files")}<input type="file" multiple onChange={async (e) => { const files = Array.from(e.target.files || []); e.target.value = ''; for (const f of files)
        await onFile(f, category); }}/><small><Translated value={c.attachments.length}/>{translate("attachments. Mark principle evidence explicitly.")}</small></label></div>;
}
function DocumentList({ s, c, onDownload }: {
    s: State;
    c: Contract;
    onDownload: (id: string) => Promise<void>;
}) {
    const translate = useTranslate();
    const ids = Array.from(new Set([...c.versions.map(v => v.fileId), ...c.attachments, ...(c.signing?.evidence || []), ...(c.partySnapshot?.legalFiles || s.parties.find(p => p.id === c.partyId)?.legalFiles || [])]));
    return <div><Translated value={ids.map(aid => { const a = s.assets.find(a => a.id === aid), v = c.versions.find(v => v.fileId === aid); return a ? <div className="document" key={aid}><div><b><Translated value={v ? `V${v.number} · ${v.locked ? 'Locked' : 'Working copy'} · ` : ''}/>{a.filename}</b><small><Translated value={a.category}/>{translate("·")}<Translated value={a.size.toLocaleString()}/>{translate("bytes ·")}<Translated value={a.restricted ? 'Restricted · ' : ''}/><Translated value={userName(s, a.uploadedBy)}/>{translate("·")}<Translated value={date(a.uploadedAt)}/></small><small className="hash">{translate("SHA-256")}{a.hash}</small></div><button className="button" onClick={() => void onDownload(aid)}>{translate("Download")}</button></div> : null; })}/><Translated value={!ids.length && <p className="muted">{translate("No documents yet. Save Draft, then attach files.")}</p>}/></div>;
}
function App() {
    const translate = useTranslate();
    const [s, setS] = useState<State | null>(null), ref = useRef<State | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
    const [path, setPath] = useState(location.pathname), [tab, setTab] = useState('Overview'), [dashTab, setDashTab] = useState('My Tasks'), [query, setQuery] = useState(''), [filter, setFilter] = useState('ALL'), [editing, setEditing] = useState<Contract | null>(null);
    function commit(next: State) { localStorage.setItem(STORAGE, JSON.stringify(next)); ref.current = next; setS(next); }
    const run: Run = async (work) => { setError(''); setNotice(''); setBusy(true); try {
        await work();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : String(e));
    }
    finally {
        setBusy(false);
    } };
    function act(action: Action) { commit(transition(ref.current!, action)); setNotice('Saved · audit and assignments updated.'); }
    function go(next: string) { history.pushState(null, '', next); setPath(next); setTab('Overview'); setError(''); setNotice(''); setEditing(null); setQuery(''); }
    useEffect(() => { let live = true; void (async () => { try {
        let state: State;
        const stored = localStorage.getItem(STORAGE);
        if (stored) {
            state = JSON.parse(stored);
            if (state.schema !== 2)
                throw Error('Unknown storage version.');
        }
        else
            state = migrateLegacy(await freshDemo(), localStorage.getItem('maison-clm-v1'));
        if (live)
            commit(reminders(state));
    }
    catch (e) {
        if (live)
            setError(`Không khởi tạo được demo: ${String(e)}. Kiểm tra bộ nhớ trình duyệt.`);
    } })(); const pop = () => { setPath(location.pathname); setEditing(null); }; window.addEventListener('popstate', pop); return () => { live = false; window.removeEventListener('popstate', pop); }; }, []);
    useEffect(() => { if (!s)
        return; const timer = setInterval(() => { try {
        commit(reminders(ref.current!));
    }
    catch (e) {
        setError(String(e));
    } }, 30000); return () => clearInterval(timer); }, [!!s]);
    if (!s)
        return <main><h1>{translate("Maison CLM")}</h1><p role="status">{translate("Preparing demo scenarios…")}</p><Translated value={error && <p role="alert" className="error"><Translated value={error}/></p>}/></main>;
    const state = s, actor = s.users.find(u => u.id === s.actorId)!;
    const detailId = path.match(/^\/contracts\/([^/]+)$/)?.[1], contract = s.contracts.find(c => c.id === detailId), isNew = path === '/contracts/new';
    const form = editing || (isNew ? null : contract?.status === 'DRAFT' && contract.requesterId === s.actorId ? contract : null), visible = s.contracts.filter(c => canRead(s, c));
    const nav = [['/', 'Dashboard', LayoutDashboard], ['/contracts/new', 'Create Contract', Plus], ['/templates', 'Template Library', BookOpen], ['/counterparties', 'Counterparties', Users], ['/demo', 'Demo Scenarios', FlaskConical], ['/admin', 'Administration', Settings]] as const;
    const page = nav.find(n => n[0] === path)?.[1] || (contract ? 'Contract Detail' : 'Dashboard');
    function update<K extends keyof Contract>(key: K, value: Contract[K]) { setEditing({ ...form!, [key]: value }); }
    async function saveForm() { const c = form!; act({ type: 'SAVE', contract: c }); setEditing(null); if (isNew) {
        history.replaceState(null, '', `/contracts/${c.id}`);
        setPath(`/contracts/${c.id}`);
    } return ref.current!.contracts.find(x => x.id === c.id)!; }
    async function loadScenario(sc: string, variation = false) { commit(await seedScenario(ref.current!, sc, variation)); go(`/contracts/demo-${sc}`); setNotice(`${sc} reset to Draft. Act as IT Requester to begin.`); }
    async function addFile(c: Contract, file: File, category: Category, version = false) { const asset = await assetFromBlob(file, file.name, category, ref.current!.actorId); act(version ? { type: 'VERSION', contractId: c.id, asset } : { type: 'ATTACH', contractId: c.id, asset }); setEditing(null); }
    function newDraft() { if (!actor.groups.includes('REQUESTER')) {
        setError('Switch to a Requester demo user to create a contract.');
        return;
    } const c = blankContract(s!.actorId); c.department = actor.department; setEditing(c); history.pushState(null, '', '/contracts/new'); setPath('/contracts/new'); setError(''); }
    function assignments(c: Contract, kind: 'reviewers' | 'f01Assignments') {
        
        const rows = c[kind], route = calculateRoute(c, state).route, required = kind === 'reviewers' ? getRequiredFunctionalGroups(route, c) : ['REQUESTER', 'MANAGER', ...getRequiredFunctionalGroups(route, c)];
        return <div className="assignment-list"><Translated value={rows.map((a, i) => <div className="assignment" key={`${a.group}-${i}`}><span className="pill"><Translated value={i + 1}/>{translate(".")}<Translated value={a.group}/><Translated value={required.includes(a.group) ? ' *' : ''}/></span><Select label={`Named ${a.group} ${kind === 'reviewers' ? 'reviewer' : 'F01 approver'} ${i + 1}`} value={a.userId} options={[["", "Select person"], ...state.users.filter(u => eligible(state, u.id, a.group, c)).map(u => [u.id, u.name] as [
                string,
                string
            ])]} onChange={userId => update(kind, rows.map((v, j) => j === i ? { ...v, userId } : v))}/><Translated value={kind === 'f01Assignments' && <div className="actions"><button className="button" aria-label={`Move step ${i + 1} up`} disabled={!i} onClick={() => { const n = [...rows]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; update(kind, n); }}>{translate("↑")}</button><button className="button" aria-label={`Move step ${i + 1} down`} disabled={i === rows.length - 1} onClick={() => { const n = [...rows]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; update(kind, n); }}>{translate("↓")}</button><button className="button" onClick={() => update(kind, rows.filter((_, j) => j !== i))}>{translate("Remove")}</button></div>}/></div>)}/><Translated value={kind === 'f01Assignments' && <div className="actions"><button className="button" onClick={() => update(kind, defaultF01(c, route))}>{translate("Use branch defaults")}</button><button className="button" onClick={() => update(kind, [...rows, { group: 'SPECIALIZED', userId: 'u_sd' }])}>{translate("Add optional SD step")}</button><button className="button" onClick={() => update(kind, [...rows, { group: 'MANAGER', userId: 'u_it_manager' }])}>{translate("Add optional manager step")}</button></div>}/><small>{translate("Submit enforces mandatory roles and order. Multiple roles per person require distinct actions.")}</small></div>;
    }
    function renderForm(c: Contract) {
        
        const preview = calculateRoute(c, state), missing = validateSubmit(c, state), locked = !!currentVersion(c)?.controlled;
        const f = (label: string, key: keyof Contract, type = 'text') => <Field label={label} type={type} value={String(c[key])} disabled={locked} onChange={v => update(key, v as never)}/>;
        return <div className="form-layout"><div className="fields"><section className="card form-card"><h2>{translate("1 · Basic information")}</h2><div className="field-grid"><Translated value={f('Contract title *', 'title')}/><Translated value={f('Project / subject *', 'project')}/><Translated value={f('Requesting department *', 'department')}/><Select label={translate("Document type *")} value={c.documentType} disabled={locked} options={['Contract', 'Framework', 'Annex', 'MOU', 'Liquidation', 'Acceptance', 'Partial acceptance', 'Renewal']} onChange={v => update('documentType', v)}/><Select label={translate("Transaction type *")} value={c.transaction} disabled={locked} options={['Services', 'Goods procurement', 'Sales', 'Lease', 'Wholesale', 'Consignment', 'Cooperation', 'Other']} onChange={v => update('transaction', v)}/><Select label={translate("Document source *")} value={c.source} disabled={locked} options={[["LEGAL_TEMPLATE", "Legal template · controlled fields"], ["VENDOR_UPLOAD", "Vendor Word / PDF"], ["LEGAL_DRAFT_REQUEST", "Request Legal Draft"]]} onChange={v => update('source', v as Contract['source'])}/></div>
   <Translated value={c.source === 'LEGAL_TEMPLATE' && <><Select label={translate("Version-pinned Legal template")} value={c.templateId} disabled={locked} options={state.templates.filter(t => t.active && t.approved).map(t => [t.id, `${t.title} / ${t.version}`])} onChange={v => update('templateId', v)}/><p className="info">{translate("Protected mock clauses:") + " "}{state.templates.find(t => t.id === c.templateId)?.clauses}{translate("· Complete fields before generating V1.")}</p></>}/>
   <Translated value={c.source === 'LEGAL_DRAFT_REQUEST' && <><Text label={translate("Drafting instructions *")} value={c.brief} onChange={v => update('brief', v)}/><Select label={translate("Named Legal drafter")} value={c.drafterId} options={state.users.filter(u => eligible(state, u.id, 'LEGAL', c)).map(u => [u.id, u.name])} onChange={v => update('drafterId', v)}/></>}/>
  </section><section className="card form-card"><h2>{translate("2 · Counterparty & financials")}</h2><Select label={translate("Shared counterparty *")} value={c.partyId} disabled={locked} options={[["", "Select counterparty"], ...state.parties.map(p => [p.id, `${p.name} · ${p.taxId}`] as [
                string,
                string
            ])]} onChange={v => update('partyId', v)}/><p className="muted">{translate("Directory supports search / add / reuse / legal documents. Advisory checklist: registration, tax record, representative authority.")}<Translated value={state.parties.find(p => p.id === c.partyId)?.legalFiles.length || 0}/>{translate("documents available.")}</p>
   <div className="field-grid"><Select label={translate("Value type *")} value={c.valueType} disabled={locked} options={['FIXED', 'ESTIMATED', 'VARIABLE', 'NO_PAYMENT', 'MISSING']} onChange={v => update('valueType', v as Contract['valueType'])}/><Select label={translate("Currency")} value={c.currency} disabled={locked} options={['VND', 'USD', 'EUR', 'KHR']} onChange={v => update('currency', v)}/><Translated value={f('Contract value (manual)', 'amount', 'number')}/><Translated value={f('VAT amount (manual)', 'vat', 'number')}/><Translated value={f('PIT withholding (manual)', 'pit', 'number')}/><Translated value={f('Other fees (manual)', 'fees', 'number')}/><Translated value={f('Total payment * (manual)', 'total', 'number')}/><Translated value={f('Individual gross pre-PIT', 'gross', 'number')}/><Translated value={f('Individual net payment', 'net', 'number')}/></div>
   <Translated value={financialWarning(c) && <p className="pending"><Translated value={financialWarning(c)}/></p>}/><Translated value={c.currency !== 'VND' && <div className="field-grid"><Translated value={f('Manual VND equivalent *', 'vnd', 'number')}/><Translated value={f('FX source *', 'fxSource')}/><Translated value={f('FX date *', 'fxDate', 'date')}/><p className="pending">{translate("LEGAL_PENDING: FX defaults to B.")}</p></div>}/>
   <Text label={translate("Value basis / no-payment justification")} value={c.basis} disabled={locked} onChange={v => update('basis', v)}/><Translated value={f('Optional start date', 'startDate', 'date')}/><Text label={translate("Term / progress · free text")} value={c.term} disabled={locked} onChange={v => update('term', v)}/><Text label={translate("Payment terms · one free-text field")} value={c.payment} disabled={locked} onChange={v => update('payment', v)}/><Text label={translate("Key contractual terms / allowed field")} value={c.keyTerms} disabled={locked} onChange={v => update('keyTerms', v)}/>
  </section><section className="card form-card"><h2>{translate("3 · Documents & assignments")}</h2><p>{translate("Save Draft before attaching files. Submit requires actual principle evidence.")}</p><button className="button" disabled={busy} onClick={() => void run(async () => { await saveForm(); })}>{translate("Save Draft")}</button>
   <Translated value={state.contracts.some(x => x.id === c.id) && <><AttachmentInput c={c} onFile={(file, category) => run(async () => { await saveForm(); await addFile(c, file, category); })}/><DocumentList s={state} c={c} onDownload={a => run(() => downloadAsset(ref.current!, a))}/>
    <Translated value={c.source === 'LEGAL_TEMPLATE' && !currentVersion(c) && <button className="button primary" disabled={busy} onClick={() => void run(async () => { const saved = await saveForm(); const content = templateContent(saved, ref.current!); act({ type: 'VERSION', contractId: saved.id, controlled: true, asset: await assetFromBlob(new Blob([content], { type: 'text/plain' }), 'controlled-template-DEMO.txt', 'CONTRACT_MAIN', ref.current!.actorId, content) }); const next = ref.current!.contracts.find(x => x.id === saved.id)!; act({ type: 'SAVE', contract: { ...next, f01Assignments: defaultF01(next, calculateRoute(next, ref.current!).route) } }); })}>{translate("Generate Controlled V1 · MOCK text artifact")}</button>}/>
    <Translated value={c.source !== 'LEGAL_DRAFT_REQUEST' && <Upload label={currentVersion(c) ? 'Upload replacement main version · routes B' : 'Upload Vendor main Word / PDF'} onFile={file => run(async () => { await saveForm(); await addFile(c, file, 'CONTRACT_MAIN', true); })} disabled={busy}/>}/></>}/>
   <Translated value={locked && <p className="info">{translate("Generated fields frozen to match V1. A replacement file creates a new version and routes B.")}</p>}/>
   <h3>{translate("Original contract & exception")}</h3><Select label={translate("Link existing archived CLM contract")} value={c.linkedId} options={[["", "Use legacy original or no link"], ...visible.filter(x => x.id !== c.id && x.status === 'SIGNED_ARCHIVED').map(x => [x.id, `${x.code} · ${x.title}`] as [
                string,
                string
            ])]} onChange={v => update('linkedId', v)}/><div className="field-grid"><Field label={translate("Legacy original number")} value={c.originalRef} onChange={v => update('originalRef', v)}/><Field label={translate("Legacy original title")} value={c.originalTitle} onChange={v => update('originalTitle', v)}/></div><Select label={translate("C/D exemption declaration")} value={c.exemption} options={[["", "No exemption · automatic A/B"], ...Object.entries(EXEMPTIONS)]} onChange={v => update('exemption', v as Contract['exemption'])}/>
   <Translated value={c.exemption && <><p className="pending">{translate("LEGAL_PENDING LP-02 · Self-attestation, not a verified finding.")}<Translated value={EXEMPTIONS[c.exemption]}/></p><Check label={translate("I affirm compliance with the complete exemption conditions")} checked={c.affirmed} onChange={v => update('affirmed', v)}/><Check label={translate("Clauses / price / payment unchanged as declared")} checked={c.unchanged} onChange={v => update('unchanged', v)}/><Check label={translate("Construction annex (excludes quantity-only C)")} checked={c.construction} onChange={v => update('construction', v)}/><Text label={translate("Exemption reason *")} value={c.reason} onChange={v => update('reason', v)}/></>}/>
   <Check label={translate("Specialized review required")} checked={c.specialized} onChange={v => update('specialized', v)}/><h3>{translate("Named reviewers · mandatory functional roles enforced")}</h3><Translated value={assignments(c, 'reviewers')}/><h3>{translate("Ordered F01 approvers · demo confirmations")}</h3><Translated value={assignments(c, 'f01Assignments')}/>
   <Select label={translate("Proposed authorized signatory")} value={c.signatoryId} options={[["", "Select later"], ...state.users.filter(u => u.active && u.signatory).map(u => [u.id, u.name] as [
                string,
                string
            ])]} onChange={v => update('signatoryId', v)}/>
  </section></div><aside className="right-column"><section className="card form-card sticky"><h2>{translate("4 · Review & Submit")}</h2><Routing c={c} s={state}/><h3><Translated value={missing.length ? `${missing.length} required corrections` : 'Ready to Submit'}/></h3><ul className="validation"><Translated value={missing.map((e, i) => <li key={i}><Translated value={e}/></li>)}/></ul><p className="muted">{translate("Access: owner, named assignees, selected signer and authorized oversight; ACC archive only.")}</p><div className="actions"><button className="button" disabled={busy} onClick={() => void run(async () => { await saveForm(); })}>{translate("Save Draft")}</button><button className="button primary" disabled={busy} onClick={() => void run(async () => { const saved = await saveForm(); act({ type: 'SUBMIT', contractId: saved.id }); })}>{translate("Submit · Route") + " "}<Translated value={preview.route}/></button></div></section></aside></div>;
    }
    function renderDetail(c: Contract) {
        
        if (!canRead(state, c))
            return <section className="card empty"><ShieldCheck /><h2>{translate("Access denied")}</h2><p>{translate("Contract access requires assignment or authorized oversight.")}</p></section>;
        const v = currentVersion(c), sc = SCENARIOS.find(x => x.id === c.scenario);
        return <><div className="contract-header card"><div><small>{c.code}{translate("·")}{state.parties.find(p => p.id === c.partyId)?.name}</small><h2><Translated value={c.title || 'Untitled Draft'}/></h2><div className="actions"><span className="pill"><Translated value={c.status}/></span><span className="pill">{translate("Route") + " "}<Translated value={c.route || calculateRoute(c, state).route}/></span><span className="pill"><Translated value={v ? `V${v.number} · ${v.locked ? 'Locked' : 'Working copy'}` : 'No main version'}/></span></div></div><div><b><Translated value={money(c)}/></b><small><Translated value={getTasks(state, c).map(t => t.label).join(' · ') || 'No action assigned to this actor'}/></small></div></div>
   <Translated value={sc && <details className="scenario-guide" open><summary>{sc.id}{translate("walkthrough ·") + " "}{translate(sc.title)}</summary><p>{translate(sc.steps)}</p><div className="actions"><button className="button" disabled={busy} onClick={() => void run(() => loadScenario(sc.id))}>{translate("Reset this scenario")}</button><Translated value={sc.id === 'SC04' && c.status === 'DRAFT' && <button className="button" onClick={() => void run(() => loadScenario('SC04', true))}>{translate("Load D variation · partial acceptance")}</button>}/></div></details>}/>
   <div className="tabs"><Translated value={['Overview', 'History', 'Documents'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}><Translated value={t}/><Translated value={t === 'History' ? ` (${c.audit.length})` : ''}/></button>)}/></div>
   <Translated value={tab === 'Overview' ? c.status === 'DRAFT' && c.requesterId === state.actorId ? renderForm(form || c) : <div className="form-layout"><div className="fields"><section className="card form-card"><h2>{translate("Contract overview")}</h2><dl className="summary"><Translated value={[['Project', c.project], ['Document / transaction', `${c.documentType} / ${c.transaction}`], ['Source', c.source], ['Term / progress', c.term], ['Payment terms', c.payment], ['Key terms', c.keyTerms], ['Draft instructions', c.source === 'LEGAL_DRAFT_REQUEST' ? c.brief : ''], ['Original', c.originalRef ? `${c.originalRef} · ${c.originalTitle}` : ''], ['Counterparty', c.partySnapshot ? `${c.partySnapshot.name} · ${c.partySnapshot.taxId} (frozen snapshot)` : state.parties.find(p => p.id === c.partyId)?.name || ''], ['SHA-256', v?.hash || '']].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt><Translated value={label}/></dt><dd><Translated value={value}/></dd></div>)}/></dl><Translated value={c.linkedId && <button className="button" onClick={() => go(`/contracts/${c.linkedId}`)}>{translate("Open linked original")}</button>}/><Translated value={c.exemption && <p className="pending">{translate("Self-attested:")}<Translated value={EXEMPTIONS[c.exemption]}/>{translate("·")}{c.reason}{translate("· LEGAL_PENDING LP-02.")}</p>}/></section>
   <Translated value={c.rounds.map(r => <section key={r.id} className="card form-card"><h2>{translate("Review round") + " "}<Translated value={r.number}/>{translate("· V")}<Translated value={c.versions.find(v => v.id === r.versionId)?.number}/></h2><small><Translated value={date(r.startedAt)}/>{translate("·")}{r.id}</small><Translated value={r.tasks.map(t => <div className="task-row" key={t.id}><div><b><Translated value={t.group}/>{translate("·")}<Translated value={userName(state, t.userId)}/></b><small><Translated value={t.comment || 'No feedback'}/></small><Deadline due={t.dueAt} pending={t.outcome === 'PENDING' && r.id === currentRound(c)?.id && c.status === 'IN_REVIEW'}/></div><span className="pill"><Translated value={t.outcome}/></span></div>)}/><Translated value={r.summary && <p className="info">{translate("Consolidated:")}{r.summary}</p>}/></section>)}/>
   <Translated value={c.f01Runs.map(r => <section className="card form-card" key={r.id}><h2>{translate("F01 run") + " "}<Translated value={r.number}/>{translate("· V")}<Translated value={c.versions.find(v => v.id === r.versionId)?.number}/></h2><small>{translate("Frozen SHA-256:")}{r.hash}{translate("· No F01 SLA")}</small><Translated value={r.steps.map((t, i) => <div className="task-row" key={t.id}><div><b><Translated value={i + 1}/>{translate(".")}<Translated value={t.group}/>{translate("·")}<Translated value={userName(state, t.userId)}/></b><small><Translated value={t.comment || date(t.completedAt)}/></small></div><span className="pill"><Translated value={t.outcome}/></span></div>)}/><details><summary>{translate("Frozen metadata snapshot")}</summary><pre><Translated value={JSON.stringify(r.snapshot, null, 2)}/></pre></details></section>)}/>
   <Translated value={c.signing && <section className="card form-card"><h2>{translate("Signature progress · SIMULATION")}</h2><p>{translate("Maison:")}<Translated value={c.signing.maison}/>{translate("·")}<Translated value={userName(state, c.signing.signatoryId)}/></p><p>{translate("Partner:")}<Translated value={c.signing.partner}/>{translate("·")}<Translated value={c.signing.evidence.length}/>{translate("evidence files")}</p><small>{translate("Version") + " "}<Translated value={c.signing.versionId}/>{translate("· SHA-256")}{c.signing.hash}</small><Deadline due={c.signing.dueAt} pending={c.status === 'PENDING_SIGNATURE'}/><p className="pending">{translate("No legally effective signature/certificate validation. LP-08/09/10/16.")}</p></section>}/>
   <Translated value={c.status === 'SIGNED_ARCHIVED' && <section className="card form-card"><h2>{translate("Signed & Archived")}</h2><p>{translate("Archived") + " "}<Translated value={date(c.archivedAt)}/>{translate(". Approved version and signed evidence retained. ACC notified.")}</p><p>{translate("Signatures received ✓ · Version matched ✓ · Originals checked ✓")}</p><p>{translate("Signed counterparty snapshot:") + " "}{c.partySnapshot?.name}{translate("·")}{c.partySnapshot?.taxId}{translate("·")}{c.partySnapshot?.representative}</p></section>}/>
   </div><aside className="fields"><section className="card form-card"><Routing c={c} s={state}/></section><Workbench key={`${c.id}:${c.status}:${state.actorId}`} s={state} c={c} busy={busy} run={run} act={act} onFile={addFile}/></aside></div> : tab === 'History' ? <section className="card form-card"><h2>{translate("Shared append-only timeline")}</h2><Translated value={c.audit.map(e => <article className="timeline-event" key={e.id}><span className="pill"><Translated value={e.action}/></span><p><Translated value={userName(state, e.actorId)}/>{translate("·")}<Translated value={date(e.at)}/></p><small><Translated value={e.from}/>{translate("→")}<Translated value={e.to}/>{translate("· Version")}<Translated value={e.versionId || 'not created'}/>{translate("· Round")}<Translated value={e.roundId || '—'}/>{translate("· F01")}<Translated value={e.runId || '—'}/></small><p>{e.comment}</p></article>)}/></section> : <section className="card form-card"><h2>{translate("Documents & immutable versions")}</h2><DocumentList s={state} c={c} onDownload={a => run(() => downloadAsset(ref.current!, a))}/><Translated value={c.f01Runs.map(f => <details key={f.id}><summary>{translate("F01 confirmation record · run")}<Translated value={f.number}/></summary><pre><Translated value={JSON.stringify(f, null, 2)}/></pre></details>)}/><Translated value={c.status !== 'SIGNED_ARCHIVED' && (c.requesterId === state.actorId || c.status === 'IN_REVIEW' && currentRound(c)?.tasks.some(t => t.userId === state.actorId)) && <AttachmentInput c={c} reviewer={c.requesterId !== state.actorId} onFile={(file, category) => run(() => addFile(c, file, category))}/>}/></section>}/>
  </>;
    }
    return <div className="shell"><aside className="sidebar"><div className="brand">{translate("MAISON")}<span>{translate("CONTRACT MANAGEMENT")}</span></div><div className="workspace"><ShieldCheck size={27}/><div>{translate("Functional Prototype")}<small>{translate("DEMO / Not Production")}</small></div></div><nav><Translated value={nav.map(([url, title, Icon]) => <button key={url} className={url === path ? 'active' : ''} onClick={() => url === '/contracts/new' ? newDraft() : go(url)}><Icon size={18}/><Translated value={title}/></button>)}/></nav><div className="sidebar-bottom"><p className="muted">{translate("Fictional data only.")}<br />{translate("Browser access is a simulation; production requires server controls.")}</p><small>{translate("Spec v1.0 · LEGAL_PENDING")}</small></div></aside><div className="main"><header><LanguageSwitcher /><span>{translate("Maison Legal")}<ChevronRight size={14}/><b><Translated value={page}/></b></span><label className="actor-switch">{translate("DEMO · Act as")}<select aria-label={translate("Act as demo user")} value={s.actorId} onChange={e => void run(() => { commit({ ...ref.current!, actorId: e.target.value }); setEditing(null); })}><Translated value={s.users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}/></select></label></header><main><div className="heading"><div><div className="eyebrow">{translate("MAISON LEGAL WORKSPACE · DEMO / NOT PRODUCTION")}</div><h1><Translated value={page}/></h1><p>{translate("Review, confirmation and archive · Simulated signatures")}</p></div><div className="actions"><Translated value={detailId && <button className="button" onClick={() => go('/')}><ArrowLeft size={16}/>{translate("Return to My Tasks / Contracts")}</button>}/><button className="button primary" onClick={newDraft}><Plus size={16}/>{translate("Create Contract")}</button></div></div>
  <Translated value={error && <div className="error" role="alert"><Translated value={error}/></div>}/><Translated value={notice && <div className="success" role="status"><Translated value={notice}/></div>}/><Translated value={busy && <p role="status">{translate("Saving…")}</p>}/>
  <Translated value={isNew ? (form ? renderForm(form) : <button className="button primary" onClick={newDraft}>{translate("Start new Draft")}</button>) : detailId ? contract ? renderDetail(contract) : <section className="card empty"><h2>{translate("Contract not found")}</h2><button className="button" onClick={() => go('/')}>{translate("Return to Dashboard")}</button></section> : path === '/demo' ? <div className="scenario-grid"><Translated value={SCENARIOS.map(sc => <section className="card form-card" key={sc.id}><span className="pill">{sc.id}{translate("· Route")}<Translated value={sc.route}/></span><h2>{translate(sc.title)}</h2><p>{sc.steps}</p><button className="button primary" disabled={busy} onClick={() => void run(() => loadScenario(sc.id))}>{translate("Load / Reset") + " "}{sc.id}</button><Translated value={sc.id === 'SC04' && <button className="button" onClick={() => void run(() => loadScenario(sc.id, true))}>{translate("Load D Variation")}</button>}/><small>{translate("Resets this scenario only; previous assets retained.")}</small></section>)}/></div> : path === '/templates' ? <TemplateLibrary s={s} run={run} commit={commit} create={templateId => { if (!actor.groups.includes('REQUESTER')) {
        setError('Switch to IT Requester to create from a template.');
        return;
    } newDraft(); setEditing({ ...blankContract(s.actorId), department: actor.department, source: 'LEGAL_TEMPLATE', templateId }); }}/> : path === '/counterparties' ? <Directory s={s} busy={busy} run={run} commit={commit}/> : path === '/admin' ? <Admin s={s} run={run} commit={commit}/> : <><section className="demo-banner"><FlaskConical /><div><b>{translate("Five complete lifecycle demos")}</b><p>{translate("Load a Draft, switch actors, review, confirm F01 and simulate signing through archive.")}</p></div><button className="button" onClick={() => go('/demo')}>{translate("Scenario Gallery")}</button></section><div className="stats"><div className="card"><small>{translate("Accessible contracts")}</small><b><Translated value={visible.length}/></b></div><div className="card"><small>{translate("My actionable tasks")}</small><b><Translated value={visible.flatMap(c => getTasks(s, c)).length}/></b></div><div className="card"><small>{translate("Signed & archived")}</small><b><Translated value={visible.filter(c => c.status === 'SIGNED_ARCHIVED').length}/></b></div></div><section className="card list-card"><div className="tabs"><Translated value={['My Tasks', 'My Contracts'].map(t => <button className={dashTab === t ? 'active' : ''} key={t} onClick={() => setDashTab(t)}><Translated value={t}/></button>)}/></div><div className="filters"><div className="search"><Search size={18}/><input aria-label={translate("Search contracts")} placeholder={translate("Search code, title or counterparty…")} value={query} onChange={e => setQuery(e.target.value)}/></div><Select label={translate("Status filter")} value={filter} onChange={setFilter} options={['ALL', ...Array.from(new Set(visible.map(c => c.status)))]}/></div><Translated value={visible.filter(c => (filter === 'ALL' || c.status === filter) && `${c.code} ${c.title} ${c.partySnapshot?.name || s.parties.find(p => p.id === c.partyId)?.name}`.toLowerCase().includes(query.toLowerCase())).flatMap(c => dashTab === 'My Contracts' ? [{ c, label: c.status, dueAt: undefined as string | undefined, id: c.id, userId: c.requesterId }] : getTasks(s, c).map(t => ({ c, ...t }))).map(({ c, label, dueAt, id: taskId }) => <button key={`${c.id}-${taskId}`} className="record" onClick={() => go(`/contracts/${c.id}`)}><span className="type-icon"><FileText size={20}/></span><div><b><Translated value={c.title || 'Untitled Draft'}/></b><small>{c.code}{translate("·")}<Translated value={c.partySnapshot?.name || s.parties.find(p => p.id === c.partyId)?.name}/></small><Deadline due={dueAt} pending/></div><span className="pill"><Translated value={label}/></span><ChevronRight size={18}/></button>)}/><Translated value={!(dashTab === 'My Tasks' ? visible.some(c => getTasks(s, c).length) : visible.length) && <p className="empty">{translate("No actionable tasks or contracts for")}{actor.name}{translate(". Switch demo actor or load a scenario.")}</p>}/></section><section className="card form-card notifications"><h2>{translate("In-app notifications")}</h2><Translated value={s.notifications.filter(n => n.userId === s.actorId && visible.some(c => c.id === n.contractId)).slice(-12).reverse().map(n => <button className="record" key={n.id} onClick={() => go(`/contracts/${n.contractId}`)}><span><Translated value={n.text}/><small><Translated value={date(n.at)}/></small></span><ChevronRight size={16}/></button>)}/><small>{translate("In-app assignments, reminders and overdue alerts; no email delivery.")}</small></section></>}/>
  <details className="open-decisions"><summary>{translate("Legal Review / Open Decisions · 17 LEGAL_PENDING items")}</summary><Translated value={DECISIONS.map(([key, text]) => <p key={key}><b><Translated value={key}/></b>{translate("·")}<Translated value={text}/></p>)}/></details><footer>{translate("MAISON CONTRACT MANAGEMENT")}<span>{translate("Demo · No ERP / E-pro / real e-signature")}</span></footer>
 </main></div></div>;
}
function Workbench({ s, c, busy, run, act, onFile }: {
    s: State;
    c: Contract;
    busy: boolean;
    run: Run;
    act: (a: Action) => void;
    onFile: (c: Contract, file: File, category: Category, version?: boolean) => Promise<void>;
}) {
    const translate = useTranslate();
    const [comment, setComment] = useState(''), [partner, setPartner] = useState(false), [payment, setPayment] = useState(c.payment), [total, setTotal] = useState(c.total), [signatory, setSignatory] = useState(c.signatoryId), [checks, setChecks] = useState([false, false, false]);
    const owner = c.requesterId === s.actorId, tasks = getTasks(s, c), review = currentRound(c)?.tasks.filter(t => t.userId === s.actorId && t.outcome === 'PENDING') || [], f01 = activeF01(c);
    const button = (text: string, action: Action, primary = false) => <button className={'button ' + (primary ? 'primary' : '')} disabled={busy} onClick={() => void run(() => act(action))}><Translated value={text}/></button>;
    const response = (kind: 'REVIEW' | 'F01', taskId: string) => <div className="actions"><Translated value={button('Approve', { type: kind, contractId: c.id, taskId, outcome: 'APPROVED', comment }, true)}/><Translated value={button('Request Changes', { type: kind, contractId: c.id, taskId, outcome: 'CHANGES_REQUESTED', comment })}/><Translated value={button('Comment only', { type: kind, contractId: c.id, taskId, outcome: 'PENDING', comment })}/></div>;
    const signature = async (party: 'maison' | 'partner', file?: File) => { const asset = file ? await assetFromBlob(file, file.name, 'SIGNED_COPY', s.actorId) : await fixtureAsset(`${c.scenario || c.code}-${party}-V${currentVersion(c)?.number}-SIMULATED-SIGNATURE`, 'SIGNED_COPY', s.actorId); act({ type: 'SIGN', contractId: c.id, party, asset }); };
    return <section className="card form-card sticky workbench"><h2>{translate("Next suggested action")}</h2><p><b><Translated value={userName(s, s.actorId)}/></b></p><Translated value={tasks.length ? tasks.map(t => <p className="info" key={t.id}><Translated value={t.label}/><Deadline due={t.dueAt} pending/></p>) : <p className="muted">{translate("No action for this actor. Current owner(s):")}<Translated value={s.users.flatMap(u => getTasks(s, c, u.id).map(t => `${u.name}: ${t.label}`)).join(' · ') || 'Archived; read-only.'}/></p>}/>
  <Translated value={tasks.length > 0 && <Text label={translate("Comment / required reason for changes")} value={comment} onChange={setComment}/>}/>
  <Translated value={c.status === 'PENDING_LEGAL_DRAFT' && c.drafterId === s.actorId && <><Upload label={translate("Prepare Contract Draft · upload main V1")} disabled={busy} onFile={file => run(() => onFile(c, file, 'CONTRACT_MAIN', true))}/><button className="button" disabled={busy} onClick={() => void run(async () => { act({ type: 'VERSION', contractId: c.id, asset: await fixtureAsset(`${c.code}-Legal-draft-V1-DEMO`, 'CONTRACT_MAIN', s.actorId) }); })}>{translate("Use mock draft PDF fixture")}</button><small>{translate("Drafting creates separate Legal and FIN review tasks.")}</small></>}/>
  <Translated value={c.status === 'IN_REVIEW' && review.map(t => <div key={t.id}><h3>{translate("Review")}<Translated value={t.group}/>{translate("· V")}<Translated value={currentVersion(c)?.number}/></h3><Translated value={response('REVIEW', t.id)}/></div>)}/>
  <Translated value={c.status === 'REVIEW_CONSOLIDATION' && tasks.length > 0 && button('Consolidate & Return', { type: 'CONSOLIDATE', contractId: c.id, comment }, true)}/>
  <Translated value={c.status === 'PENDING_FINALIZATION' && owner && <><Check label={translate("Partner agreed to this reviewed contract version")} checked={partner} onChange={setPartner}/><Translated value={button('Finalize Contract & Send F01', { type: 'FINALIZE', contractId: c.id, partnerAgreed: partner }, true)}/></>}/>
  <Translated value={c.status === 'F01_IN_PROGRESS' && f01?.userId === s.actorId && <><h3>{translate("F01 current step ·")}<Translated value={f01.group}/></h3><Translated value={response('F01', f01.id)}/><small>{translate("Internal demo confirmation; not a digital signature.")}</small></>}/>
  <Translated value={c.status === 'F01_CHANGES_REQUESTED' && owner && <><Text label={translate("Correct F01 payment / supporting information")} value={payment} onChange={setPayment}/><Field label={translate("Correct F01 total (route rechecked)")} type="number" value={total} onChange={setTotal}/><AttachmentInput c={c} onFile={(file, category) => run(() => onFile(c, file, category))}/><Translated value={button('Correct F01 only & Restart F01', { type: 'CORRECT_F01', contractId: c.id, payment, total, comment }, true)}/><small>{translate("Main version unchanged. Entire F01 restarts; a changed route forces reviews.")}</small></>}/>
  <Translated value={owner && ['CHANGES_REQUESTED', 'F01_CHANGES_REQUESTED', 'IN_REVIEW', 'REVIEW_CONSOLIDATION', 'PENDING_FINALIZATION', 'F01_IN_PROGRESS', 'READY_FOR_SIGNING'].includes(c.status) && <details><summary>{translate("Upload new contract version · restart ALL reviews")}</summary><Upload label={translate("Upload revised main Word / PDF")} disabled={busy} onFile={file => run(() => onFile(c, file, 'CONTRACT_MAIN', true))}/><button className="button" disabled={busy} onClick={() => void run(async () => act({ type: 'VERSION', contractId: c.id, asset: await fixtureAsset(`${c.code}-main-V${c.versions.length + 1}-revised-DEMO`, 'CONTRACT_MAIN', s.actorId) }))}>{translate("Use revised mock fixture V") + " "}<Translated value={c.versions.length + 1}/></button><small>{translate("Old versions, review rounds and F01 runs are retained.")}</small></details>}/>
  <Translated value={c.status === 'READY_FOR_SIGNING' && owner && <><Select label={translate("Authorized Maison signatory")} value={signatory} options={[["", "Select authorized signer"], ...s.users.filter(u => u.active && u.signatory).map(u => [u.id, `${u.name} · ${u.authorityNote}`] as [
            string,
            string
        ])]} onChange={setSignatory}/><Translated value={button('Send for Signature · SIMULATED', { type: 'SEND_SIGN', contractId: c.id, signatoryId: signatory }, true)}/></>}/>
  <Translated value={c.status === 'PENDING_SIGNATURE' && c.signing?.signatoryId === s.actorId && <><Translated value={c.signing.maison === 'PENDING' && <><button className="button primary" disabled={busy} onClick={() => void run(() => signature('maison'))}>{translate("Simulate Maison Signature")}</button><Upload label={translate("Or record Maison offline signed copy")} onFile={file => run(() => signature('maison', file))}/></>}/><Translated value={button('Signatory Request Changes', { type: 'SIGN_RETURN', contractId: c.id, comment })}/></>}/>
  <Translated value={c.status === 'PENDING_SIGNATURE' && owner && <><Translated value={c.signing?.partner === 'PENDING' && <><Upload label={translate("Record Partner Signed Copy · upload evidence")} onFile={file => run(() => signature('partner', file))}/><button className="button" disabled={busy} onClick={() => void run(() => signature('partner'))}>{translate("Record Partner Signed Copy · mock fixture")}</button></>}/><div className="fields"><Translated value={['Required signatures & signed evidence received', 'Approved version / content matches signed copy', 'Originals / wet-ink handling checked (LEGAL_PENDING)'].map((label, i) => <Check key={i} label={label} checked={checks[i]} onChange={v => setChecks(checks.map((x, j) => j === i ? v : x))}/>)}/></div><Translated value={button('Complete Contract & Archive', { type: 'COMPLETE', contractId: c.id, checklist: checks }, true)}/></>}/>
 </section>;
}
function Directory({ s, busy, run, commit }: {
    s: State;
    busy: boolean;
    run: Run;
    commit: (s: State) => void;
}) {
    const translate = useTranslate();
    const fresh = (): Party => ({ id: id(), name: '', taxId: '', kind: 'ORGANIZATION', contact: '', representative: '', legalFiles: [] });
    const [query, setQuery] = useState(''), [draft, setDraft] = useState<Party>(fresh), [editing, setEditing] = useState(false);
    const canEdit = s.users.find(u => u.id === s.actorId)?.groups.includes('REQUESTER') || s.users.find(u => u.id === s.actorId)?.oversight;
    const save = () => { if (!canEdit)
        throw Error('Chỉ Requester/Legal/Admin quản lý danh mục.'); if (!draft.name.trim())
        throw Error('Nhập tên pháp lý đối tác.'); if (draft.taxId && s.parties.some(p => p.id !== draft.id && p.taxId.toLowerCase() === draft.taxId.toLowerCase()))
        throw Error('Trùng mã số thuế; hãy dùng lại đối tác hiện có.'); commit({ ...s, parties: s.parties.some(p => p.id === draft.id) ? s.parties.map(p => p.id === draft.id ? draft : p) : [...s.parties, draft] }); setEditing(true); };
    return <div className="form-layout"><section className="card form-card"><Field label={translate("Search counterparty / tax ID")} value={query} onChange={setQuery}/><Translated value={s.parties.filter(p => `${p.name} ${p.taxId}`.toLowerCase().includes(query.toLowerCase())).map(p => <div className="document" key={p.id}><div><b>{p.name}</b><small><Translated value={p.kind}/>{translate("·")}{p.taxId}{translate("·")}{p.contact}{translate("·")}{p.representative}</small><Translated value={p.legalFiles.map(a => <button className="button" key={a} onClick={() => void run(() => downloadAsset(s, a))}>{translate("Download legal document")}</button>)}/></div><Translated value={canEdit && <button className="button" onClick={() => { setDraft(structuredClone(p)); setEditing(true); }}>{translate("Edit / legal docs")}</button>}/></div>)}/></section><Translated value={canEdit && <section className="card form-card"><h2><Translated value={editing ? 'Edit counterparty' : 'Add counterparty'}/></h2><Field label={translate("Legal name *")} value={draft.name} onChange={v => setDraft({ ...draft, name: v })}/><Select label={translate("Kind")} value={draft.kind} options={['ORGANIZATION', 'INDIVIDUAL']} onChange={v => setDraft({ ...draft, kind: v as Party['kind'] })}/><Translated value={draft.kind === 'INDIVIDUAL' && <p className="pending">{translate("Restricted identity documents. Dummy placeholders only; no real PII.")}</p>}/><Field label={translate("Tax ID · duplicate check")} value={draft.taxId} onChange={v => setDraft({ ...draft, taxId: v })}/><Field label={translate("Contact")} value={draft.contact} onChange={v => setDraft({ ...draft, contact: v })}/><Field label={translate("Representative")} value={draft.representative} onChange={v => setDraft({ ...draft, representative: v })}/><Upload label={translate("Legal documents · save party first")} disabled={!editing || busy} onFile={file => run(async () => { const a = await assetFromBlob(file, file.name, 'LEGAL_DOC', s.actorId); const next = { ...draft, legalFiles: [...draft.legalFiles, a.id] }; commit({ ...s, assets: [...s.assets, a], parties: s.parties.map(p => p.id === draft.id ? next : p) }); setDraft(next); })}/><div className="actions"><button className="button primary" disabled={busy} onClick={() => void run(save)}>{translate("Save Counterparty")}</button><button className="button" onClick={() => { setEditing(false); setDraft(fresh()); }}>{translate("New counterparty")}</button></div><p className="muted">{translate("Signed archives keep a separate snapshot after directory changes.")}</p></section>}/></div>;
}
function TemplateLibrary({ s, run, commit, create }: {
    s: State;
    run: Run;
    commit: (s: State) => void;
    create: (id: string) => void;
}) {
    const translate = useTranslate();
    const actor = s.users.find(u => u.id === s.actorId)!, allowed = actor.admin || actor.groups.includes('LEGAL');
    return <div className="scenario-grid"><Translated value={s.templates.map(t => <section className="card form-card" key={t.id}><BookOpen /><h2>{t.title}</h2><span className="pill"><Translated value={t.version}/>{translate("·")}<Translated value={t.active ? 'Active' : 'Inactive'}/>{translate("·")}<Translated value={t.approved ? 'Demo Legal approved' : 'Unapproved'}/></span><p>{t.clauses}</p><p className="muted">{translate("Pinned immutable version. Allowed commercial fields only. Generated mock text is not DOCX or a genuine Legal template.")}</p><button className="button primary" disabled={!t.active || !t.approved} onClick={() => create(t.id)}>{translate("Create from Template")}</button><Translated value={allowed && <div className="actions"><button className="button" onClick={() => void run(() => commit({ ...s, templates: s.templates.map(x => x.id === t.id ? { ...x, active: !x.active } : x) }))}><Translated value={t.active ? 'Deactivate' : 'Activate'}/></button><button className="button" onClick={() => void run(() => commit({ ...s, templates: [...s.templates, { ...t, id: id(), version: `DEMO-${Date.now()}`, active: false, approved: false }] }))}>{translate("Clone new version")}</button><Translated value={!t.approved && <button className="button" onClick={() => void run(() => commit({ ...s, templates: s.templates.map(x => x.id === t.id ? { ...x, approved: true } : x) }))}>{translate("Mark Demo Legal Approved")}</button>}/></div>}/></section>)}/></div>;
}
function Admin({ s, run, commit }: {
    s: State;
    run: Run;
    commit: (s: State) => void;
}) {
    const translate = useTranslate();
    const actor = s.users.find(u => u.id === s.actorId)!, allowed = actor.admin || actor.groups.includes('LEGAL'), [threshold, setThreshold] = useState(String(s.config.threshold)), [holidays, setHolidays] = useState(s.config.holidays.join('\n'));
    const [newUser, setNewUser] = useState({ name: '', department: 'IT', group: 'MANAGER' as Group });
    function changeUser(u: User, patch: Partial<User>) { if (!actor.admin)
        throw Error('Admin only.'); commit({ ...s, users: s.users.map(x => x.id === u.id ? { ...x, ...patch } : x) }); }
    return <div className="fields"><section className="card form-card"><h2>{translate("Demo users & functional groups")}</h2><p>{translate("Admin manages users; cannot approve other people’s tasks.")}</p><Translated value={s.users.map(u => <div className="task-row" key={u.id}><div><b>{u.name}</b><small>{u.id}{translate("·")}<Translated value={u.department}/>{translate("·")}<Translated value={u.groups.join(', ')}/>{translate("·")}<Translated value={u.active ? 'Active' : 'Inactive'}/></small></div><Translated value={actor.admin && <div className="actions"><button className="button" disabled={u.id === s.actorId} onClick={() => void run(() => changeUser(u, { active: !u.active }))}><Translated value={u.active ? 'Deactivate' : 'Activate'}/></button><select aria-label={`Add role to ${u.name}`} value="" onChange={e => { const g = e.target.value as Group; void run(() => changeUser(u, { groups: [...new Set([...u.groups, g])] })); }}><option value="">{translate("Add role…")}</option><Translated value={['REQUESTER', 'MANAGER', 'FIN_ACC', 'LEGAL', 'PROCUREMENT', 'SPECIALIZED'].map(g => <option key={g}><Translated value={g}/></option>)}/></select></div>}/></div>)}/><Translated value={actor.admin && <div className="field-grid"><Field label={translate("New fictional user name")} value={newUser.name} onChange={v => setNewUser({ ...newUser, name: v })}/><Field label={translate("Department")} value={newUser.department} onChange={v => setNewUser({ ...newUser, department: v })}/><Select label={translate("Functional group")} value={newUser.group} options={['REQUESTER', 'MANAGER', 'FIN_ACC', 'LEGAL', 'PROCUREMENT', 'SPECIALIZED']} onChange={v => setNewUser({ ...newUser, group: v as Group })}/><button className="button" onClick={() => void run(() => { if (!newUser.name.trim() || !newUser.department.trim())
        throw Error('Name / department required.'); commit({ ...s, users: [...s.users, { id: id(), name: newUser.name, department: newUser.department, groups: [newUser.group], active: true }] }); setNewUser({ ...newUser, name: '' }); })}>{translate("Add User")}</button></div>}/></section>
  <section className="card form-card"><h2>{translate("Authorized signatories · no LOA engine")}</h2><Translated value={s.users.filter(u => u.signatory).map(u => <div className="task-row" key={u.id}><div><b>{u.name}</b><p><Translated value={u.authorityNote}/></p></div><Translated value={allowed && <button className="button" onClick={() => void run(() => commit({ ...s, users: s.users.map(x => x.id === u.id ? { ...x, signatory: false } : x) }))}>{translate("Remove authorization")}</button>}/></div>)}/><Translated value={allowed && <Select label={translate("Add authorized signatory (demo only)")} value="" options={[["", "Choose active person"], ...s.users.filter(u => u.active && !u.signatory).map(u => [u.id, u.name] as [
            string,
            string
        ])]} onChange={v => void run(() => commit({ ...s, users: s.users.map(u => u.id === v ? { ...u, signatory: true, authorityNote: 'DEMO authority; real LOA validity pending.' } : u) }))}/>}/></section>
  <section className="card form-card"><h2>{translate("Business calendar & routing policy")}</h2><Field label={translate("Branch A threshold VND · strict less-than")} type="number" value={threshold} disabled={!actor.admin} onChange={setThreshold}/><Text label={translate("Holiday dates · YYYY-MM-DD, one per line")} value={holidays} disabled={!actor.admin} onChange={setHolidays}/><Translated value={actor.admin && <button className="button primary" onClick={() => void run(() => { const dates = holidays.split('\n').map(x => x.trim()).filter(Boolean); if (!Number.isFinite(Number(threshold)) || Number(threshold) <= 0 || dates.some(x => !/^\d{4}-\d{2}-\d{2}$/.test(x) || Number.isNaN(Date.parse(x))))
        throw Error('Invalid threshold / holiday date.'); if (s.contracts.some(c => !['DRAFT', 'SIGNED_ARCHIVED'].includes(c.status)))
        throw Error('Đổi policy chỉ khi không có hồ sơ đang xử lý; hoàn tất hoặc reset scenario về Draft.'); commit({ ...s, config: { threshold: Number(threshold), holidays: dates } }); })}>{translate("Save Configuration")}</button>}/><p className="muted">{translate("Review A: 2 business days · B: 3 · Signing: 3. Vietnam date-only calendar, weekends/holidays excluded. No F01 SLA or SLA extension.")}</p></section>
 </div>;
}
createRoot(document.getElementById('root')!).render(<I18nProvider><App /></I18nProvider>);
