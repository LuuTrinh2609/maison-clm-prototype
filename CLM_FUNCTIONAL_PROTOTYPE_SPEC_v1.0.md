# MAISON CLM — FUNCTIONAL PROTOTYPE IMPLEMENTATION SPECIFICATION

**Version:** 1.0 · **Prepared:** 2026-11-09 · **Language:** Vietnamese (UI labels may be Vietnamese/English consistently)  
**Purpose:** Implementation handoff to Codex for a usable interactive CLM prototype, before Legal validation.  
**Business reference:** *Brief cho IT: Số hóa Quy trình soát xét & ký hợp đồng* (Legal, 2026-10-28, 9 pages).  
**Decision authority:** The business decisions below are approved **for prototype design by the project owner**, **NOT** approved as a revised Legal procedure.  
**Primary objective:** Demonstrate the full contract lifecycle, not production integrations. Optimize scope for rapid prototype delivery.

> **IMPORTANT FOR CODEX:** This specification is the latest source of truth for the prototype. Earlier alternatives discussed in conversation are superseded where explicitly indicated. Do not silently rebuild features that were removed for simplicity. If a detail is underspecified, use the safe default stated here, centralize it in configuration, and add a `LEGAL_PENDING` annotation rather than inventing a policy.

---

## 0. Expected deliverable and Definition of Done

Create/extend the existing React + TypeScript + Tailwind project in the current local folder. Before editing, inspect existing `package.json`, routes, components and project conventions; **preserve existing project and demo data where feasible**, do not start a second app unless absolutely necessary. Provide a usable, coherent, responsive CLM prototype with:

1. Navigation from Dashboard → Create → Contract Detail → action handling → Signed & Archived.
2. User / role simulation (visible **DEMO / Not Production** switcher), task assignments, permitted actions and cross-account task updates.
3. Deterministic A/B/C/D routing; guarded state transitions; actionable Reviewer/F01 tasks.
4. Real state changes and visible audit history; no decorative buttons or dead-end screens.
5. Persistent metadata across page refresh and reset-to-demo; files persisted locally where feasible.
6. Five seeded scenarios (SC01–SC05) with walkthrough steps, expected transitions, and a one-click scenario reset/seed mechanism.
7. Clear warnings for simulated signing, pending Legal decisions and non-production access controls.
8. `README.md` documenting install/run commands, demo users, scenarios, design limitations, and tests.
9. Basic tests for routing, guards, review version reset, F01 order, and access decisions.

**Not in scope for prototype:** production authentication, legally binding signature, actual ERP/E-pro APIs, email delivery integration, online Word editor, automated comparison of Word documents, real document certification, production document retention, real access-security guarantees.

**Critical distinction:** A working mock implementation is required, but is **not** equivalent to an approved, production-ready system. Never label a simulated `Approve` as a valid digital signature.

---

## 1. Final business decision register — DO NOT supersede without owner instruction

| Decision | Final agreed behavior for prototype | Caveat |
|---|---|---|
| CLM-001.1 | Separate **document type**, **transaction type**, and **document source** (Legal template / Vendor file / Request Legal draft). | Source drives eligibility but user cannot self-mark arbitrary file as an unmodified Legal template. |
| CLM-001.2 | Save incomplete Draft even without E-pro approval; **Submit** requires a file proving approved principle (E-pro/other approved document). | Different from brief's creation prerequisite; Legal confirmation pending. |
| CLM-001.3 | Shared Counterparty Directory within CLM, search/reuse/autofill/new, legal docs, signed-contract counterparty snapshot. | No ERP supplier master integration. |
| CLM-001.4 | Requester manually enters contract value, VAT/PIT, fees and **total payment**; do not auto-calculate/overwrite total. | Validate obvious input errors, warn on mismatches. |
| CLM-001.4 PIT | Propose **gross, pre-PIT-withholding value** as 23m threshold basis for individual counterparties. | Finance/Legal pending; conservative routing until ratified. |
| CLM-001.4 FX | Requester manually enters foreign-currency total and VND equivalent, plus exchange-rate source/date. | Rate validation/eligibility for Fast Track pending Finance/Legal. |
| CLM-001.4 undefined | Valid variable/unfixed-price framework agreements may Submit if a meaningful value basis is supplied; route B unless C/D. | Legal confirmation pending. Unknown/missing data is NOT same as variable value. |
| CLM-001.4 zero | No-payment agreements may Submit; do not infer A just because value is zero. | Legal must confirm branch and reviewer expectations. |
| CLM-001.5A | **Simplified**: optional start date + free-text term/progress; no dynamic term engine or automatic expiry computation. | Supersedes prior dynamic term form selection. |
| CLM-001.5B | **Simplified**: ONE free-text payment terms field. No schedule builder, installment calculator, triggers, % controls or 6-row cap. | Supersedes prior Dynamic Payment Schedule concept; Legal to confirm F01 representation. |
| CLM-001.6 | One common multi-file upload area; system-created **permission-controlled file links**. Mark E-pro/principle approval document; master contract file versioned separately. | No pasted external SharePoint/OneDrive links in prototype. |
| CLM-001.7 | Automatic routing at Submit using A/B/C/D rules; guard required data and assignments. | No fully configurable workflow designer. |
| CLM-002.1 | For C/D, Requester self-declares exemption reason, confirms compliance, attaches/links original contract; system routes automatically. | Material Legal sign-off pending for bypassing reviewers. |
| CLM-002.2 | **Dynamic reviewers and F01 approvers**: Requester chooses named internal users, roles, order. Same person may hold multiple roles. | Mandatory functional roles still enforced; no organizational manager tree. |
| CLM-002.3 | Review uses Approve, Request Changes, Comment; download-edit-upload Word externally. | No online Word editor/auto-diff (scope deviation). |
| CLM-002.4 | Parallel reviewers finish first; **Legal consolidates B feedback**; FIN handles A feedback. Return to Requester once per round. | Comment alone does not complete a review task. |
| CLM-002.5 | Any new contract file version restarts **all** mandatory review tasks; preserve previous rounds. | No selective re-review of document changes. |
| CLM-002.6 | Requester clicks **Finalize Contract & Send F01** after all reviews Approve and partner agreement confirmation. This locks the reviewed version. | No extra finalization approver. |
| CLM-002.7 | If contract file changes after F01 starts, restart reviews + F01. If only F01/supporting doc changes, no file review automatically; recheck routing and re-confirm necessary F01 approvals. | For prototype, conservatively restart entire F01 on material F01/supporting-document correction; Legal to refine scope. |
| CLM-003.1 | Requester selects signatory from Admin/Legal maintained authorized-signatory list. | No LOA rule engine; actual authorization check pending. |
| CLM-003.2 | Simulate signature in prototype, allow upload offline signed document; integrate real CA/signature provider **before production Go-live**. | Clearly label demo simulation. |
| CLM-003.3 | Requester checks/signs off the completion checklist and clicks **Complete Contract**; archive signed artifacts, notify ACC. | Legal must approve self-confirmation procedure, particularly wet-ink copies. |
| CLM-004.1 | One common Dashboard with **My Tasks** and **My Contracts** tabs. | Data filtered by user's case access. |
| CLM-004.2 | One Contract Detail with **Overview / History / Documents** tabs; one shared event timeline. | Role- and state-dependent action bar. |
| CLM-005 | Support BOTH Legal template creation and Vendor Word/PDF upload, PLUS request Legal draft; library versioned. | Template integrity mandatory for A. |
| CLM-006.1 | Contract access to explicitly assigned people and authorized oversight; not all staff in the same department. | Browser demo visibility is NOT production security. |
| CLM-007 | SLA A 2 business days, B 3 business days, Sign 3 business days; task notifications, deadline, overdue; restart clock each review round. | **No SLA Extension in phase 1.** Deviation from Legal brief pending. |
| CLM-008.1 | Legal drafting request uses same contract flow: Legal receives drafting task, uploads V1, then normal B review. | Upload by Legal is NOT a completed Legal review. |
| CLM-009.1 | Link contracts already in CLM or legacy contracts via reference info + uploaded original file; no historic mass-import. | No auto-rewrite of original contract's data. |

### Explicitly deprecated designs (do not build)
- Dynamic time-basis selector with automatic end dates.
- Dynamic Payment Schedule / % or fixed installment editor, payment automation.
- SLA extension / approval process, advanced escalation.
- Preconfigured department manager assignment trees; assigning review tasks to a shared-team queue instead of specific users.
- Separate role-specific dashboards, online Word editing, automatic Word diff and AI review.
- Actual e-signing during prototype, E-pro/ERP/SharePoint/OneDrive integrations.

---

## 2. Information architecture and routes

**Use existing router structure; suggested paths if absent:**

| Route | Surface | Actions |
|---|---|---|
| `/` or `/dashboard` | Dashboard | My Tasks / My Contracts, search/filter, open contract, create |
| `/contracts/new` | Create Contract (4 compact sections or wizard) | Draft, choose source, counterparty, details, upload, reviewer/F01 assignments, Submit |
| `/contracts/:id` | Single Contract Detail | Overview / History / Documents; workflow action panel |
| `/templates` | Contract Template Library | Browse, view, create from template; Legal/Admin manage active/version |
| `/counterparties` | Counterparty Directory | Search, add, edit permitted records, view legal documents |
| `/admin` | Compact admin/config | Demo users/roles, authorized signatories, threshold, business calendar |
| `/demo` (optional) | Scenario gallery | Seed/reset SC01–SC05; actor switcher; visible demo disclaimers |

**Create Contract section order:**
1. Basic: project, requesting department, document type, transaction type, document source; source-specific template/file/Legal drafting details.
2. Counterparty + Financials: shared partner lookup; value type; manual contract value, VAT/PIT/fees/total payment/currency/manual VND FX conversion; optional start date; free-text duration/progress; free-text payment terms; key contractual terms (free text).
3. Documents + Assignments: common attachment zone; distinguish `APPROVED_PRINCIPLE` and `CONTRACT_MAIN`; related/original contract; required review roles and named reviewers; dynamic ordered F01 approvers; proposed signatory.
4. Review & Submit: show missing required data, branch preview, access summary, save Draft/Submit.

**Contract Detail must be the actual workbench:**
- Header: contract code, title, partner, current state, route, current version, current owner/action, SLA if relevant.
- **Overview:** metadata + routing explanation + current review matrix / F01 step / signature progress according to state; only eligible user sees actionable controls.
- **History:** one chronological, append-only timeline: actor, timestamp, event, stage, version, round, reason/comment, previous/new status.
- **Documents:** main contract versions, separate supporting attachments, final signed artifacts, F01 confirmation record, file download/view links.
- Support `Return to My Tasks/Contracts` on every screen.

---

## 3. Actors, permissions, and demo users

### 3.1 Functional roles
- **Requester**: manage own Draft and submissions, add counterparty and files, select named reviewers/approvers, replace contract version, finalize, submit signing, complete/archival confirmation.
- **Reviewer**: action assigned review task only; functional group FIN_ACC / LEGAL / PROCUREMENT / SPECIALIZED; can comment, approve, request changes, upload marked-up supporting review file (not silently overwrite main version).
- **F01 Approver**: action assigned F01 step in sequence, can approve/request changes/comment; user can have multiple assigned steps but confirmations are distinct records.
- **Legal**: Reviewer + optional draft author, consolidator of branch B, template owner, appropriate oversight.
- **Signatory**: one of maintained authorized signatories, signs in simulation or returns changes.
- **Admin**: administer users/roles/configurations and troubleshoot demo; not implicitly approve other people's tasks.
- **ACC distribution viewer**: read signed package when authorized; no default edit rights.
- **External counterparty**: no production portal in prototype; agreement/signature may be recorded by Requester via upload/mock.

### 3.2 Permissions (prototype UI + store guards)

| Capability | Requester owner | Assigned Reviewer | Current F01 Approver | Selected Signatory | Legal oversight | Admin |
|---|---:|---:|---:|---:|---:|---:|
| Read assigned contract | Yes | Yes | Yes | Yes | Per oversight permission | Per admin permission |
| Edit Draft fields | Yes | No | No | No | No | Optional support-only |
| Submit Draft | Yes | No | No | No | No | No |
| Review task action | No unless assigned | Yes | No unless assigned | No | Yes if assigned | No |
| F01 step action | Only if current step | Only if current step | Yes | Only if assigned | Only if assigned | No |
| Upload revised main contract | Owner; Legal on drafting task | No (only review attachment) | No | No | Drafting-only | No |
| Finalize | Yes | No | No | No | No | No |
| Sign | No | No | No | Yes | No | No |
| Complete Contract | Yes | No | No | No | No | No |
| Manage templates / signatories | No | No | No | No | Legal permitted | Yes |

**Demo personas (fictional):**
- `u_it_requester` — IT Requester.
- `u_it_manager` — IT Department Manager / F01 approver.
- `u_fin` — FIN/ACC reviewer & F01 approver.
- `u_legal` — Legal reviewer, draft author, consolidator, F01 approver.
- `u_procurement` — Procurement reviewer/F01.
- `u_sd` — specialized subject reviewer/F01 (optional).
- `u_signatory` — authorized Maison signatory.
- `u_acc_readonly` — signed archive read-only.
- `u_admin` — Admin.

Add persistent **“Act as …”** demo selector (top bar). Switching users immediately changes My Tasks, permitted actions and contract access. Do not simulate production security/authentication; label explicitly.

### 3.3 Reviewer assignment requirements
- Branch A: exactly required functional **FIN/ACC** (additional F01 people allowed within rules).
- Branch B: **LEGAL + FIN/ACC**, and **PROCUREMENT** when procurement of goods; optional SPECIALIZED when needed. Procurement never replaces FIN/ACC.
- Branch C/D: no cross-department review tasks; requesting department handles its own confirmation path, pending Legal confirmation.
- Requester selects **named people** for required functional roles; validation must reject an absent required role or a person not eligible for that role.
- One person may carry multiple roles, but each approval task retains its role, step, version and audit entry.
- Reviewer and F01 assignee may be different people in the same function.

---

## 4. Routing policy A/B/C/D (single deterministic function)

### 4.1 Decision order and rules

1. **Check C/D exception** ONLY when Requester has selected an allowed exception, confirmed compliance, entered reason, and linked/uploaded original contract. For partial acceptance = D if compliant; other allowed exemptions = C. Conditions must be shown verbatim, not hidden. Ambiguity between C and D -> flag `LEGAL_PENDING`; no silent exemption.
2. Otherwise **A** only if ALL are true:
   - Created through an active, version-pinned **Legal approved template** in controlled field-fill mode; protected legal wording cannot be changed.
   - Document content has not been externally replaced or edited outside controlled allowed fields.
   - Total payment eligible routing amount is strictly **< 23,000,000 VND** (configurable threshold).
   - No unresolved ambiguity affecting the threshold (foreign-exchange validation, PIT rule, zero/unfixed amount, etc.).
3. **B** for everything else, including Vendor uploads, Legal drafting, externally modified templates, value unknown / variable (unless C/D), and policy-ambiguous cases. Show routing explanation.

**Exception choices for C:**
- Annex adjusts quantity only; unit price unchanged; NOT construction annex.
- Renewal/extension same counterparty, price and clauses with evidence of approved E-pro.
- Acceptance/liquidation unchanged content, value and payment terms (scope wording needs Legal confirmation).

**D:** Partial acceptance without changed clauses, not liquidation. Original reference required.

**Risk rule:** A Requester checkbox is an assertion, not machine-verified proof of unchanged contract wording. C/D policy must be signed off by Legal; demo must display the asserted basis and a warning.

### 4.2 Financial routing defaults
- `FIXED`: requester manually enters total and taxes. Don't auto-edit totals.
- `ESTIMATED`: store estimated value/basis; no automatic A until Legal defines if estimated amount qualifies.
- `VARIABLE`: require pricing basis, allow Submit; no automatic A.
- `NO_PAYMENT`: allow Submit, total is 0; no automatic A solely due to 0; conservative B unless C/D.
- `MISSING`: Draft only; cannot Submit until changed to a legitimate value type with necessary information.
- `INDIVIDUAL`: record gross pre-PIT value and actual net separately if entered; proposed threshold uses gross. Until Finance/Legal confirms, never grant A solely from an ambiguous individual amount.
- `FX`: manually enter original amount, VND equivalent, FX source and date. Unless VND amount is formally verified under an approved procedure, conservative B; no magic conversion and no invented rate. Confirmation process must be agreed before production.
- Amount exactly **23,000,000** is NOT branch A.
- A positive amount less than threshold does NOT override source/template checks.

### 4.3 User-facing routing preview
Show `Branch`, `Required Reviewers`, `SLA`, and concise `Why?` bullet(s) on Submit. Never let Requester manually select A/B. Exception selection is a **declaration of factual criteria** only.

---

## 5. Data model (TypeScript interfaces, recommended baseline)

Adapt names to existing code, but preserve the semantics and references. String IDs immutable. All timestamps stored in ISO format; display in `Asia/Ho_Chi_Minh`. Do not store real identity documents in seed data.

```ts
type Role = 'REQUESTER'|'REVIEWER'|'F01_APPROVER'|'LEGAL'|'SIGNATORY'|'ADMIN'|'ACC_VIEWER';
type FunctionalGroup = 'FIN_ACC'|'LEGAL'|'PROCUREMENT'|'SPECIALIZED'|'REQUESTING_DEPT';
type DocSource = 'LEGAL_TEMPLATE'|'VENDOR_UPLOAD'|'LEGAL_DRAFT_REQUEST';
type ValueType = 'FIXED'|'ESTIMATED'|'VARIABLE'|'NO_PAYMENT'|'MISSING';
type Route = 'A'|'B'|'C'|'D';
type ContractStatus =
  | 'DRAFT' | 'PENDING_LEGAL_DRAFT'
  | 'IN_REVIEW' | 'REVIEW_CONSOLIDATION' | 'CHANGES_REQUESTED'
  | 'PENDING_FINALIZATION'
  | 'F01_IN_PROGRESS' | 'F01_CHANGES_REQUESTED'
  | 'READY_FOR_SIGNING' | 'PENDING_SIGNATURE' | 'SIGNED_ARCHIVED';
type TaskOutcome = 'PENDING'|'APPROVED'|'CHANGES_REQUESTED';

type User = { id:string; name:string; email:string; department:string; roles:Role[];
  groups:FunctionalGroup[]; active:boolean; isAuthorizedSignatory?:boolean;
  authorityNote?:string; };
type Counterparty = { id:string; kind:'ORGANIZATION'|'INDIVIDUAL'; legalName:string;
  taxId?:string; registrationNo?:string; contact?:string;
  representativeName?:string; legalFileIds:string[]; updatedAt:string; };
type Template = { id:string; title:string; documentType:string; version:string;
  isLegalApproved:boolean; isActive:boolean; allowedFieldKeys:string[];
  originalFileId?:string; lockedClauseDigest?:string; };
type FileAsset = { id:string; filename:string; mime:string; size:number;
  storageKey:string; category:'CONTRACT_MAIN'|'APPROVED_PRINCIPLE'|'LEGAL_DOC'|
   'ORIGINAL_CONTRACT'|'REVIEW_ATTACHMENT'|'SIGNED_COPY'|'OTHER';
  uploadedBy:string; uploadedAt:string; restricted:boolean; }; 
type ContractVersion = { id:string; contractId:string; number:number; fileId:string;
  sourceTemplateId?:string; sourceTemplateVersion?:string; createdAt:string;
  createdBy:string; fileHash?:string; isLocked:boolean; lockedAt?:string; };
type MoneyDetails = { valueType:ValueType; currency:string;
  contractValue?:number; vat?:number; pit?:number; otherFees?:number;
  totalPayment?:number; vndEquivalent?:number;
  individualGrossValue?:number; individualNetPayment?:number;
  fxRateSource?:string; fxRateDate?:string;
  valueBasisText?:string; financialNote?:string; };
type ReviewTask = { id:string; contractId:string; roundId:string;
  functionalGroup:FunctionalGroup; assignedUserId:string;
  outcome:TaskOutcome; comment?:string; completedAt?:string;
  dueAt?:string; };
type ReviewRound = { id:string; contractId:string; number:number;
  contractVersionId:string; tasks:ReviewTask[]; startedAt:string;
  consolidatedBy?:string; consolidatedAt?:string; summary?:string; };
type F01Step = { id:string; contractId:string; runId:string; order:number;
  label:string; group?:FunctionalGroup; assignedUserId:string;
  status:TaskOutcome; completedAt?:string; comment?:string;
  contractVersionId:string; };
type F01Run = { id:string; contractId:string; number:number;
  contractVersionId:string; startedAt:string; steps:F01Step[];
  approvalMetadataSnapshot:Record<string,unknown>; };
type SigningRecord = { id:string; contractId:string; contractVersionId:string;
  maisonSignatoryId:string; maisonStatus:'PENDING'|'SIMULATED_SIGNED'|'OFFLINE_RECORDED';
  partnerStatus:'PENDING'|'SIMULATED_SIGNED'|'OFFLINE_RECORDED';
  evidenceFileIds:string[]; signedCompletedAt?:string; completedBy?:string; };
type AuditEvent = { id:string; contractId:string; at:string; actorId:string;
  action:string; fromStatus?:ContractStatus; toStatus?:ContractStatus;
  contractVersionId?:string; reviewRoundId?:string; f01RunId?:string;
  comment?:string; metadata?:Record<string,unknown>; };
type Contract = { id:string; code:string; title:string; requesterId:string;
  department:string; project?:string; documentType:string; transactionType:string;
  documentSource:DocSource; templateId?:string; templateVersion?:string;
  legalDraftRequestText?:string; counterpartyId:string;
  counterpartySnapshot?:Record<string,unknown>;
  money:MoneyDetails; startDate?:string; termText?:string;
  paymentTermsText?:string; keyTermsText?:string;
  principleApprovalFileId?:string; attachmentFileIds:string[];
  linkedContractId?:string; legacyContractRef?:{number:string;title:string;fileId:string};
  exemption?:{kind:string;confirmed:boolean;reason:string};
  route?:Route; routingReasons:string[]; status:ContractStatus;
  reviewRounds:ReviewRound[]; f01Runs:F01Run[];
  versions:ContractVersion[]; signing?:SigningRecord;
  createdAt:string; submittedAt?:string; updatedAt:string; completedAt?:string;
  authorizedAccessUserIds:string[]; };
```

**Implementation note:** Normalize entities and tasks in store if easier; above is a semantic schema, not a requirement to nest everything. Never store duplicate current versions that disagree with the audit record.

### 5.1 Files & persistence
- Metadata may use `localStorage` (or existing store persistence). For actual binary uploads/downloads, use **IndexedDB** or a project-supported local file-store abstraction. `localStorage` is not a safe place for large Word/PDF binary data.
- A file is an asset with `storageKey`; a version references the immutable asset. `Upload New Contract Version` **creates a new asset and version**, never overwrites prior bytes.
- Creating permissions-controlled document links in prototype means an internal app route/asset resolver after permission checks, **not a public URL**. Browser-only demo cannot enforce real server-side access security; mark for production.
- Generated template files must be explicitly labeled mock if not genuine DOCX. Avoid promising Word content editing if unsupported. Prefer small bundled sample DOCX or a stable HTML preview + downloadable generated artifact implemented with an appropriate library after inspecting dependencies.
- File metadata, actor/time and checksum for locked contract version should remain consistent across reloads when supported.

---

## 6. Contract state machine and transition guards

| Current | Action (actor) | Guard | Next | Side effects |
|---|---|---|---|---|
| DRAFT | Save Draft (Requester) | requester owns draft | DRAFT | persist fields, audit SAVE_DRAFT |
| DRAFT | Submit (Requester) | section 7 validation + named assignees + principle approval | PENDING_LEGAL_DRAFT / IN_REVIEW / PENDING_FINALIZATION | route, tasks, SLA, event |
| PENDING_LEGAL_DRAFT | Upload first V1 (assigned Legal) | first draft file present | IN_REVIEW | create V1 and branch B review tasks; Legal review still required |
| IN_REVIEW | Comment (assigned Reviewer) | correct current round/version | IN_REVIEW | audit comment; task stays pending |
| IN_REVIEW | Approve / Request Changes (assigned Reviewer) | one outcome per current round | IN_REVIEW or REVIEW_CONSOLIDATION | update task; all completed -> consolidation/next |
| REVIEW_CONSOLIDATION | Consolidate & Return (Legal B / FIN A) | all reviewers responded; >=1 needs changes | CHANGES_REQUESTED | create consolidated feedback event |
| IN_REVIEW / REVIEW_CONSOLIDATION | All approved | every required reviewer APPROVED | PENDING_FINALIZATION | notify Requester |
| CHANGES_REQUESTED | Upload revised main file (Requester) | new file differs/new asset | IN_REVIEW | create V+1; all mandatory reviewer tasks reset; new SLA round |
| PENDING_FINALIZATION | Finalize & Send F01 (Requester) | all current reviews approved (or C/D bypass); partner agreed | F01_IN_PROGRESS | lock file/hash; create ordered F01 steps; first task active |
| F01_IN_PROGRESS | Approve (current F01 assignee) | correct step & locked version | F01_IN_PROGRESS / READY_FOR_SIGNING | append approval; activate next |
| F01_IN_PROGRESS | Request Changes (current approver) | reason required | F01_CHANGES_REQUESTED | stop remaining sequence, return to Requester |
| F01_CHANGES_REQUESTED | Correct F01 / supporting docs | contract file unchanged, re-evaluate routing | F01_IN_PROGRESS or IN_REVIEW | restart F01 for material change; if route changes, reroute/review |
| F01_CHANGES_REQUESTED | Upload new contract main file | new version | IN_REVIEW | reset ALL mandatory review tasks and F01 for later |
| READY_FOR_SIGNING | Send for signature (Requester) | signatory in authorized list; version hash matches F01 | PENDING_SIGNATURE | create signing tasks and SLA |
| PENDING_SIGNATURE | Simulate sign / upload signed copy | authorized actor, file evidence | PENDING_SIGNATURE | record Maison / partner status independently |
| PENDING_SIGNATURE | Signatory Request Changes | reason required | F01_CHANGES_REQUESTED or IN_REVIEW | changes to signed version cause document revision and re-review |
| PENDING_SIGNATURE | Complete Contract (Requester) | required signing parties/evidence verified and user attestation | SIGNED_ARCHIVED | lock signed files; signed snapshot; ACC notification; audit |
| SIGNED_ARCHIVED | View/download authorized | permission | SIGNED_ARCHIVED | no edits to signed original |

**Branch C/D prototype path:** after Submit, skip cross-functional review tasks, move to PENDING_FINALIZATION with Requester / Dept Manager F01 path as a conservative demo approximation (or chosen internal confirmation path). Explicit `LEGAL_PENDING`: the Legal brief suggests direct initials/presentation for C and separate departmental D; final routing steps require Legal confirmation. Do **not** force Legal/FIN approval for C/D as if they were branch B.

**Important subtleties:**
- `REVIEW_CONSOLIDATION` only when feedback needs consolidation; if all approve, go directly to PENDING_FINALIZATION.
- “Wait all feedback” means all current reviewers have a final outcome; a Comment is not a final outcome. Overdue tasks remain actionable; no silent timeout approval.
- For branch B, Legal consolidates mixed feedback. For A, FIN returns comments. If every task approves, no consolidation action is needed.
- Assignment changes after Submit must be logged and must not bypass a required role.
- Audit events always include round/version IDs where applicable.
- Submit must not create duplicate tasks if clicked twice; events should be idempotent in the store reducer.
- An actor cannot approve on behalf of a different user by clicking an item not assigned to them (except explicit demo actor-switcher, which must be visible).

---

## 7. Minimal form and validation

### 7.1 Create/Submit fields
- Requester and department (demo user), project/subject, document type, transaction type, source.
- Counterparty chosen/created from shared directory (organization or individual; keep reference and later signed snapshot).
- Financial: contract value, VAT, PIT, fees, manually entered total, currency, value type and basis if non-fixed. FX requires manual VND equivalent/source/date. No auto tax computation.
- Date/terms: optional start date; free-text term/progress; free-text payment terms; key contractual clauses free text.
- **Upload common supporting files:** mark approved-principle file explicitly. `CONTRACT_MAIN` managed separately as a versioned main file; LEGAL_DRAFT_REQUEST needs no initial contract file.
- Related contract: existing CLM ID or legacy original number/title/uploaded file.
- Named reviewers and ordered F01 approvers with functionality labels; signatory chosen from allowed list.

### 7.2 Required before Submit
- Basic identification, document type, transaction type, source, counterparty.
- Approved-principle E-pro/document file exists and is tagged appropriately (Draft may omit).
- Main contract file or controlled Legal template generated V1; **or** source = LEGAL_DRAFT_REQUEST with sufficient draft instructions.
- Money type complete: FIXED/ESTIMATED totals if required, VARIABLE meaningful price basis, NO_PAYMENT justification. MISSING not Submittable.
- C/D: exception reason + confirmation + existing/legacy reference file; enforce construction annex exclusion, partial acceptance distinctions where possible from declared fields.
- Named assignees eligible for required branch review roles; valid F01 steps consistent with branch; select signatory from list (may defer signatory selection until ready for signing).
- Legal documents for counterparty displayed as a **simple advisory checklist** in Phase 1; no AI document verification. Do not discard mandatory principle-approval validation.
- No free-text external SharePoint/OneDrive links as attachment substitutes.

### 7.3 Error/warning behavior
- Inline validation on field + short Submit summary; no modal flood.
- Warning if financial total doesn't align with plainly entered amounts (do not overwrite). Warning is not automatic proof of incorrect taxes.
- If a field change after initial Submit affects routing, recompute route and required participants; create fresh approvals as required. Never retain approval from a now-invalid route.
- Missing approver, same approver occupying separate sequential roles, and invalid dates should be handled explicitly (same-person multi-role allowed, but distinct approvals required).

---

## 8. F01 rules and ordered confirmation

**Dynamic people, controlled mandatory roles.** Requester can add/remove/reorder optional people and select named authorized users; cannot remove required functional steps or move Legal/FIN last contrary to branch rules.

- **Branch B default sequence**: Requester → Requesting Department Manager → FIN/ACC → Procurement (if required) → specialized reviewer (if required) → Legal **last**. Optional extra steps may be inserted while preserving required ordering and final Legal.
- **Branch A default sequence**: Requester → Requesting Department Manager → FIN/ACC **last**.
- **Branch C/D default demo sequence**: Requester → Requesting Department Manager; mark `LEGAL_PENDING` because the final internal sign-off steps and exemptions are not fully specified in brief.
- Only the current F01 step's assignee can perform `Approve` or `Request Changes`. Comments don't advance.
- Request Changes reason mandatory; sequence stops immediately; Requester notified.
- Only edit F01/supporting documents (not main contract file): preserve main version; recheck route; prototype safe default = re-run **whole F01 sequence** rather than calculate partial approver impact. This matches principle of re-confirming necessary actors, but final exact subset requires Legal confirmation.
- Main file edited/replaced: new version; all parallel reviewers re-review and **all F01 steps reset**.
- Every F01 approval stores actor, time, frozen main version ID/hash and F01 metadata snapshot.
- Internal F01 Approve is **not** a digital signature; special final-page initials treatment remains Legal pending.

---

## 9. Signing and archival

### 9.1 Signing (simulated in prototype)
- Select authorized Maison signer from Admin/Legal list (no automated LOA engine).
- `Send for Signature` only after F01 complete and locked version matches.
- Track two distinct signature parties: Maison and counterparty, each Pending / Simulated Signed / Offline Recorded.
- Support counterparty signs first; Maison internal review/F01 requirements remain.
- Offline signing: Requester uploads signed copy to `SIGNED_COPY`; track whether original physical document must be checked (`LEGAL_PENDING`).
- Demo buttons must read **“Simulate Maison Signature”** / **“Record Partner Signed Copy”**, not assert legally valid signature.
- If signing provider integration later changes bytes, retain both approved pre-sign copy and signed artifact; check signature package chain in production.

### 9.2 Completion and archive
- Requester checks explicit confirmation: required signatures/evidence received, version/content matches approved copy, original handling if wet ink. Cannot Complete on unchecked box or absent evidence.
- On `Complete Contract`: status SIGNED_ARCHIVED, lock signed artifacts, counterparty snapshot, audit event, in-app notification for authorized ACC/Requester/Legal.
- Search signed contracts by contract code/title/counterparty; original contract linked to annex/acceptance/liquidation; no hidden update to original amount/end date.
- Legal approval needed for Requester self-completion and real signature verification.

---

## 10. SLA, notifications, privacy and administration

### 10.1 SLA
- Branch A review: 2 business days; Branch B review: 3 business days; Signing: 3 business days.
- Monday–Friday excluding configurable holidays/closed days; don't assume weekend count. For prototype, seed sample holiday calendar and document simplification for receipt-time cutoffs.
- SLA starts when task is **assigned/notified**, not when user first opens it. On a new review round restart SLA; preserve old round's status.
- Show due date and Overdue badge; overdue task is still actionable. No auto-approve or auto-cancel.
- One in-app reminder before deadline and one overdue alert, de-duplicated (no real email delivery required). Real email may be an interface stub.
- **DO NOT implement SLA Extension** or escalation workflow in this version.
- F01 time limit not specified; no invented F01 SLA.

### 10.2 Access control and privacy
- User sees contracts if owner, assigned reviewer, assigned F01 approver, signatory, explicit case assignee, or authorized oversight; ACC only authorized signed archive.
- Secure-by-design demo: in-app data filtered for each user, route guards for unauthorized screens, attachment access checks. No same-department blanket view.
- Individual CCCD/passport data marked restricted; seed dummy placeholder only, not real PII.
- **Production requires server-side RBAC, authenticated asset access, encryption, retention policy, audit immutability and legal data handling**. Client-only mock is not a secure deployment.

### 10.3 Lightweight admin
- Active users, departments/functional groups, multiple roles.
- Authorized signatory list + human-readable authority note (no LOA rule engine).
- Legal approved templates + versions, activation.
- Configurable branch A VND threshold (default 23m) and holiday dates.
- Optional see-all rights scoped to Legal/Admin, but don't infer access for all employees.

---

## 11. Seed data and five END-TO-END demo scenarios

**Scenario runner:** `/demo` or Dashboard banner allows `Load SCxx`, `Reset Scenario`, `Act as`. Each scenario has a realistic sample document, counterparties, assigned role users and clear progress steps. Seed state should not be erroneously displayed as already Signed on load; demo user must be able to click through lifecycle.

### SC01 — Legal Template Fast Track (Route A)
**Fixture:** `Service Contract – 20,000,000 VND`, active controlled Legal-approved service template; no edits to protected clauses; IT requester; counterparty Acme Services (fictional); E-pro approved PDF fixture; FIN reviewer. No Procurement required; F01 Requester → IT Manager → FIN; authorized signer.

**Walkthrough:**
1. Act as IT Requester, choose Legal template, fill allowed fields, manually enter total 20m, attach approved principle, assign FIN and F01 people, Save Draft then Submit.
2. Assert route **A** and reason “Legal template unchanged AND total <23m”; FIN receives review task; Legal receives **no review task**.
3. Act as FIN, open My Tasks, Approve main V1. Assert PENDING_FINALIZATION.
4. Act as Requester, check partner agreement, click Finalize & Send F01. Assert V1 Locked + hash.
5. Act as Requester → IT Manager → FIN, approve F01 sequentially (FIN last).
6. Act as Requester, select allowed Signatory, send signing; act as Signatory, simulate Maison signed; record partner signed and upload fixture.
7. Act as Requester, complete signed checklist and click Complete Contract. Assert SIGNED_ARCHIVED; ACC gets authorized archive notification; audit timeline complete.

**Assertions:** `route=A`, only FIN review, SLA 2 business days, no review after one complete round, same V1 ID in F01 and signing, no signed overwrite.

### SC02 — Vendor Contract Full Review (Route B)
**Fixture:** Vendor Word/PDF file for 500,000,000 VND goods procurement contract; vendor XYZ (fictional), E-pro approval; assigned Legal, FIN and Procurement reviewers; F01 includes Requester, dept manager, FIN, Procurement, Legal last.

**Walkthrough:**
1. Create from Vendor upload, manually enter 500m, select goods procurement, upload principle, select named Legal/FIN/Procurement and F01 assignees; Submit.
2. Assert **B**, all 3 parallel tasks created simultaneously, SLA 3 business days.
3. Switch Legal and FIN to Approve; leave Procurement Pending. Assert NOT ready to finalize.
4. Switch Procurement to Approve. Assert PENDING_FINALIZATION, no extra review required.
5. Requester confirms partner agreement and finalizes. F01 sequentially through requester → manager → FIN → Procurement → Legal.
6. Select Signatory; simulate signatures and/or offline upload; requester completes; archive and ACC notification.

**Assertions:** Procurement adds rather than replaces FIN; partner documents and file accessible only to assigned users; any non-current F01 action denied; signed package links to current V1.

### SC03 — Changed Contract, Second Review Round and F01 Correction (Route B)
**Fixture:** Initial Vendor service contract V1, Legal + FIN assigned; E-pro approval; seeded request starts DRAFT or first review round.

**Walkthrough:**
1. Submit Vendor V1. FIN Approve; Legal Request Changes with concrete comment. Must **wait all reviewers** before Legal consolidates (if FIN responded already, consolidation available).
2. Legal clicks Consolidate & Return (same round); Requester sees Changes Requested + all feedback.
3. Requester uploads revised main V2. Assert V1 immutable, new review round 2, FIN and Legal reset to Pending even if previously approved. SLA restarts.
4. FIN and Legal both approve V2; Requester finalizes; hash locked V2; sequential F01 begins.
5. During F01, FIN Request Changes for **F01-only field/document correction**. Requester updates F01/supporting doc **without changing main V2**; route revalidated; only F01 steps restart under prototype conservative rule, no parallel contract re-review.
6. Finish F01 sequence → signing → Complete Contract.

**Assertions:** exactly 2 contract versions; review outcomes tied to their own round; V1 approval does not count for V2; timeline includes all events; F01-only correction never automatically creates V3; all signatures on V2; full archive.

### SC04 — Annex Exemption C + Optional D Variation
**Fixture C:** Quantity-only annex with **unchanged unit price**, not construction annex; source original = legacy contract `LEG-2025-008` with uploaded original PDF; Requester affirmation and reason; principle evidence present; suitable manager and signatory.

**Walkthrough C:**
1. Create Annex; choose legacy original (number/title/file); declare C with exact condition; check affirmation and write reason; Submit.
2. Assert **C** selected, NO Legal/FIN/Procurement cross-department review tasks; exemption basis recorded in audit.
3. Requester finalizes contract; demo's minimal requester/manager confirmation path; signing simulated; complete signed copy, archive.
4. In archived contract, show link/reference to legacy original.

**Optional D variation (same seeded screen, not a sixth mandatory scenario):** switch fixture to partial acceptance, non-liquidation, no clause change; declare D and original. Assert route D and requester-department-only path, not branch C or full B. Show `LEGAL_PENDING` for final required confirmations.

**Assertions:** cannot submit C/D without original reference and explicit affirmation; construction annex must not qualify C; declaration visible as a self-attestation, not a verified legal finding.

### SC05 — Legal Draft Request (then B Review)
**Fixture:** New consulting agreement, no template and no Vendor draft; detailed drafting instructions; principle approval file, counterparty, manually declared finances, Legal drafter and FIN reviewer.

**Walkthrough:**
1. Requester selects “Request Legal Draft”, fills brief/party/value, attaches approved principle; Submit without a main contract file.
2. Assert `PENDING_LEGAL_DRAFT`, one Legal `Prepare Contract Draft` task, NOT signed or reviewed.
3. Switch to Legal; upload first Word V1 into main contract version. Assert move to route **B IN_REVIEW** and create **separate** Legal + FIN Review tasks (Legal drafting alone does not count as review approval).
4. Approve Legal + FIN; Requester finalizes after partner agreement; F01 Requester → Manager → FIN → Legal last.
5. Signing simulation or offline evidence; Requester Completes; archive with drafting instructions and V1.

**Assertions:** no contract file required at initial Legal Draft Submit; complete audit trail starting before V1; Legal has both distinct Draft and Review actions; no accidental route A even if value <23m.

### 11.1 Additional invariant tests (automated if feasible)
- 22,999,999 VND eligible A only for controlled template; exactly 23,000,000 VND route B.
- User uploading an externally modified template must not get route A.
- Missing principle approval → Save Draft allowed, Submit blocked.
- New version resets every required reviewer; old rounds retained.
- Review is parallel; F01 sequential; no one may approve a later F01 step early.
- `Comment` does not mark Reviewer complete; incomplete parallel task blocks finalize.
- Same assignee in multiple distinct F01 roles requires separate actions.
- Changing routing-critical F01 data triggers route re-evaluation; if branch changes, cannot keep invalid approvals.
- `Complete Contract` blocked when missing signature proof or unchecked verification.
- Past signed files immutable; unauthorized user cannot open their asset in app.
- Drafting task completion creates V1 but never automatically approves Legal review.
- C/D requires stated reason, signed declaration, original contract reference.
- Loading/resetting one seeded scenario is deterministic and does not corrupt others.

---

## 12. Acceptance Criteria by surface

| Surface | Minimum acceptance |
|---|---|
| Dashboard | “My Tasks” includes only currently actionable tasks for active demo user; “My Contracts” contains owned or appropriately scoped contracts; search/filter works. |
| Create Contract | All 3 sources available; save incomplete Draft; submit validation & route preview; choose counterparties, named reviewers, dynamic F01 and signatory; create/version files. |
| Counterparty | Add, search, select, reuse legal docs; duplicate warning for same tax ID; signed contract snapshot preserved even after directory edit. |
| Template Library | Active Legal templates with immutable version ID; controlled template source only can qualify A; upload source cannot falsely qualify. |
| Contract Detail | Overview/History/Documents work for every status, with accurate owner, branch, current version, active actions. |
| Review | Tasks parallel; approve/request changes/comment; all responses needed; Legal B consolidation; upload new version opens fresh full round. |
| F01 | Ordered dynamic people; current step only; last Legal for B/FIN for A; F01 run ties to locked version; returning to requester works. |
| Signing | Authorized signer selection; mock signing and offline signed-upload; track both parties; no legal-signature claims. |
| Archive | Requester signed-checklist complete; immutable signed artifact; ACC notification; original/annex linking; audit record. |
| Admin | User/role group setup, list of signatories, templates, threshold, holiday sample. |
| Demo | User switcher; seed/reset SC01–SC05; predictable finishing steps; stored state survives refresh. |

### Demo quality checklist
- No action buttons that claim to save, assign or complete but don't update state.
- No false progress badges; every status derives from actual store state.
- All actionable cards link to a detail screen and the user can return.
- Errors readable in Vietnamese, not console-only failures.
- Every scenario has a visible clear `Next suggested action` and active demo user.
- Desktop responsive layout first, mobile usable (no overflowing tables or invisible buttons).
- Reset to seeded data easy; no external login/API credentials necessary.

---

## 13. Production gap / Legal decision log (do not mark resolved)

| ID | Decision pending with Legal / Finance / Security | Recommended prototype handling |
|---|---|---|
| LP-01 | Draft permitted before E-pro vs original prohibition on creating request | Allow Draft, enforce approval at Submit; show policy warning. |
| LP-02 | Self-declared C/D waiver, C/D overlap, direct-to-sign vs departmental F01 path | Show declaration, route C/D, minimal requester/manager confirmations clearly provisional. |
| LP-03 | Unmodified template validation, locked clauses, template inventory/approved versions, Word editing scope | Only controlled generated template can A; external file routes B. |
| LP-04 | Detailed 23m threshold for individual gross value, PIT deduction, foreign currency FX basis and verification | Show proposed fields; default ambiguous cases to B pending approval. |
| LP-05 | Fixed/estimated/variable/no-payment routing and whether estimated amount can qualify A | Variable and no-payment → B unless C/D. |
| LP-06 | F01 dynamic people, cross-role identity, required order, final-page initials vs simple online approval | Enforce required roles and final Legal/FIN; demo e-approval only. |
| LP-07 | Which F01 roles must reapprove when only metadata/attachments change | Prototype restarts all F01, preserves review if main file unchanged and route unchanged. |
| LP-08 | Signatory rights verified against valid LOA/time/amount/legal entity | Choose from maintained list; validate real LOA before production. |
| LP-09 | Signature provider, valid legal electronic signature, corporate stamp, timestamp, certificate checks, hybrid originals | Simulate only; real licensed provider and validation before production. |
| LP-10 | Requester allowed to declare fully signed / inspect wet-ink originals | Require explicit attestation; Legal confirmation pending. |
| LP-11 | Replacing 6 F01 payment installment fields with one free-text field; optional start date/term text | Use simplified form; confirm Legal accepts mapping. |
| LP-12 | Word editor + version comparison & SLA-extension removed from initial prototype although brief calls them mandatory | Record explicit scope deviation; Legal must approve pre-production. |
| LP-13 | Exact SLA time cutoff, holiday calendar, F01 due date, C/D deadlines | Use date-only business day counting and no invented F01 due date in demo. |
| LP-14 | Employee/franchise contracts and Cambodia inclusion | Not in prototype; Legal must confirm deployment scope. |
| LP-15 | Documents of individual counterparties, production data security and retention, external access | Dummy files only; production privacy and security review required. |
| LP-16 | Whether a corporate-style signed Word/PDF is authoritative, contract hash and post-sign PDF package handling | Keep approved version and signed package; production needs verification workflow. |
| LP-17 | Exact roles of specialized SD vs requesting department manager, and Procurement trigger | Retain optional named SD review, manager F01, Procurement when goods procurement; confirm exceptions. |

**Source fidelity:** The Legal brief explicitly asks for parallel review, sequential F01, signed-version matching, real e-signing, template/Word version controls and SLA extensions; the scope-reduced Prototype is an intentionally staged implementation, NOT a declaration of full Legal compliance.

---

## 14. Implementation plan / execution order for Codex

**Build in coherent vertical slices, not disconnected screens.** Recommended milestones:

1. **Audit existing project**: inspect build, routing, state and UI. Identify reuse points. Add typed domain models, small sample seed data and reset mechanism. Ensure local `npm run dev` works.
2. **Dashboard → Create → Detail**: one unified Shell, 3 Detail tabs, counterparty directory, form, approved-principle upload, file asset persistence, activity log.
3. **Routing + review tasks**: pure `calculateRoute` and `getRequiredFunctionalGroups`; request submission and named user task creation; user switcher; B/A parallel review; consolidated feedback.
4. **Versioning + F01**: revision rounds, Requester finalization, version lock/hash, sequential steps, Request Changes and correction rules.
5. **Signing + archive**: signatory list, simulation/offline signed copy, completion checklist, archive/ACC read view.
6. **C/D + Legal drafting**: exemption assertions, original/legacy linkage; drafting queue → Legal V1 → B review.
7. **SLA/notifications + tests**: business day deadlines, reminders/overdue and audit, demo scenario runner, scripted walkthroughs, polish.

**Suggested pure services / hooks:**
- `calculateRoute(contract, config): {route, reasons, requiredGroups, pendingPolicyFlags}`
- `validateSubmit(contract, users, files): ValidationResult`
- `canPerformAction(actor, contract, task, action): boolean`
- `transitionContract(state, action, actor): NextState` (guarded reducer)
- `createReviewRound(contract, version, assignedUsers, now)`
- `buildF01Sequence(contract, chosenAssignees, policy)`
- `addBusinessDays(start, count, holidays)` and `isOverdue(task, now)`
- `appendAuditEvent(event)` (centralized)
- `getVisibleContracts(user, contracts)`
- `seedScenario(id)` / `resetDemo()`

**Suggested tests:** route table boundary/exception cases, task access, review round reset, F01 ordering, status guards, signed artifact lock. Prefer existing test framework; add a lightweight one only if absent.

**Implementation hygiene:**
- No silent use of real customer or employee records; all demo fixture users/companies are fake.
- Avoid adding heavy backend dependencies merely to mock operations.
- Retain all data and route-derived UI in shared state; never hardcode scenario-specific outcomes in components.
- Ensure a refresh doesn't wipe completed demo actions, or clearly expose Reset if browser persistence is unavailable.
- Keep statuses and permissions consistent between Dashboard, Contract Detail and audit timeline.
- Run available lint/build/tests; fix errors before claiming done.
- In README distinguish implemented / simulated / not implemented / pending Legal; note limitations of browser-only permissions and signing.

---

## 15. Codex handoff acceptance gate

The prototype is acceptable for **Legal demonstration** only when:

- [ ] SC01, SC02, SC03, SC04 (including optional D variation), SC05 can all reach SIGNED_ARCHIVED through actual UI actions.
- [ ] User switcher changes task ownership and authorization; no unauthorized actor can perform others' approvals.
- [ ] A/B/C/D routing is explainable, data-driven and conservative for ambiguous values.
- [ ] New main contract version forces every reviewer to review again; earlier rounds remain auditable.
- [ ] F01 never approves an unlocked/different contract version, and its steps process strictly in order.
- [ ] Each submitted/actioned task logs actor/time/action/version.
- [ ] Attachments and signed documents appear in Contract Detail and survive refresh where feasible.
- [ ] Demo signing is unmistakably simulated and does not assert legal effectiveness.
- [ ] Simplified term/payment fields replace earlier detailed wizard/schedule ideas.
- [ ] No SLA extension UI in Phase 1; deadlines and overdue remain visible.
- [ ] Every pending Legal/Finance decision appears in a `Legal Review / Open Decisions` summary.
- [ ] README contains scenario walkthroughs and exact local startup instructions for the existing repository.

**Final note:** First get the 5 end-to-end functional flows stable; defer UX embellishments, BI charts, advanced routing configurators and all nonessential integrations.
