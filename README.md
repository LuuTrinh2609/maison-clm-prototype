# Maison CLM Functional Prototype

Interactive React 19 + TypeScript + Vite + Tailwind prototype implementing `CLM_FUNCTIONAL_PROTOTYPE_SPEC_v1.0.md`. All personas, templates, PDFs, companies and approvals are fictional. Every signature and F01 confirmation is a **demo simulation, not a legally valid signature**.

## Run locally

Use Node.js 22+ (validated here on Node 24) and npm. From PowerShell:

```powershell
cd D:\project\Legal
npm.cmd ci
npm.cmd run dev
```

Open the Local URL printed by Vite (normally `http://127.0.0.1:5173/`). If another server uses that port, Vite prints the next available port. Keep the terminal running; Ctrl+C stops it. Use the same browser and origin to retain your demo state.

```powershell
npm.cmd test
npm.cmd run build
```

`npm test` uses Node's built-in test runner and the installed TypeScript compiler; no test framework or backend is needed. It transpiles the actual UI domain/fixture modules into the ignored `.test-build` directory. `npm run build` checks strict TypeScript and creates `dist/`. Minification is disabled in `vite.config.ts` because the Windows esbuild minifier stalled during final verification; the unminified build completed. The larger bundle is acceptable for this local prototype; production optimization is deferred. There is no separately configured lint command.

## Start a demo

Open **Demo Scenarios** from the sidebar and click **Load / Reset SCxx**. Five ready-to-submit Drafts are also seeded on the first visit. Each scenario shows a walkthrough, a reset button, its actual status, route and version. Loading resets that scenario only and switches to IT Requester. It does not submit, approve, sign or archive on your behalf.

Use **DEMO · Act as** in the top bar throughout a walkthrough. Dashboard **My Tasks** lists only current actions for that person; **My Contracts** lists their accessible cases, including assigned contracts and permitted oversight. Each task opens the same Contract Detail with **Overview / History / Documents**. The **Next suggested action** panel names the next task owner(s). Use **Return to My Tasks / Contracts** or Dashboard navigation to return.

All action guards live in the shared domain transition service as well as UI visibility. An Admin/Legal oversight view does not authorize approving someone else's task. Comments do not complete tasks. Change requests require a reason.

## Seed personas

- `u_it_requester` — IT Requester: owns the five scenarios, submits, revises, finalizes, sends signing, records partner evidence and completes.
- `u_it_manager` — IT Department Manager: department F01 confirmation.
- `u_fin` — FIN / ACC: financial review and F01.
- `u_legal` — Legal Counsel: review, B feedback consolidation, drafting, F01, template management and explicit oversight.
- `u_procurement` — Procurement: goods review/F01, in addition to FIN.
- `u_sd` — Specialized Reviewer: optional specialized review/F01.
- `u_signatory` — Maison Signatory: mock authorized signatory, simulation/offline evidence and return-for-changes.
- `u_acc_readonly` — ACC Archive Viewer: signed archive access after distribution; no active-case access.
- `u_admin` — Demo Administrator: user/groups, signatories, routing threshold, holidays and oversight; no implicit task approval rights.

Admin can add fictional active users and grant multiple functional groups. Reviewer/F01 dropdowns filter to eligible named users; department-manager eligibility includes the requesting department. One person assigned to multiple roles must confirm each distinct task separately.

## Scenario walkthroughs

### SC01 — Legal Template Fast Track, A

1. Load SC01 as IT Requester. Inspect the controlled Legal service template V1, manual total **20,000,000 VND**, approved-principle PDF, FIN review assignment and Requester → Manager → FIN F01 sequence. Click **Save Draft**, then **Submit · Route A**.
2. Switch to **FIN / ACC** and **Approve** the V1 review. No Legal review task exists. Status becomes `PENDING_FINALIZATION`; SLA is two business days.
3. Switch to **IT Requester**, check **Partner agreed**, and click **Finalize Contract & Send F01**. V1 is locked with its SHA-256 hash.
4. Approve F01 sequentially as **IT Requester → IT Department Manager → FIN / ACC**. FIN is last. Status becomes `READY_FOR_SIGNING`.
5. Follow the common signing/completion steps below. The archived package references the same V1.

### SC02 — Vendor Goods Full Review, B

1. Load SC02 and Submit the vendor PDF contract for **500,000,000 VND** with goods procurement selected.
2. Approve as **Legal Counsel** and **FIN / ACC**. Leave **Procurement** pending: finalization must remain unavailable. All three tasks belong to one parallel round with a three-business-day SLA.
3. Approve as **Procurement**. As Requester, confirm partner agreement and finalize.
4. F01: **IT Requester → IT Department Manager → FIN / ACC → Procurement → Legal Counsel**. Later steps cannot act early. Legal is last.
5. Finish signing and archive using the common steps.

### SC03 — Revised V2, second review round, F01-only correction, B

1. Load SC03 and Submit. As FIN, approve. As Legal, enter a reason such as “Clarify acceptance criteria” and **Request Changes**. If FIN is still pending, consolidation is blocked until FIN responds.
2. As Legal, enter a consolidated explanation and **Consolidate & Return**. Requester sees `CHANGES_REQUESTED` and all round-one feedback.
3. As Requester, expand **Upload new contract version · restart ALL reviews**. Upload revised Word/PDF, or click **Use revised mock fixture V2**. V1 and its outcomes remain immutable. Both FIN and Legal reset to Pending in round two with a fresh SLA.
4. Approve V2 as FIN and Legal. Requester confirms agreement and finalizes; the locked version is V2.
5. Approve F01 as Requester and Manager. At the FIN step, enter “Clarify payment confirmation” and **Request Changes**.
6. As Requester, edit the **Correct F01 payment / supporting information** field, optionally upload supporting evidence, enter a correction comment and click **Correct F01 only & Restart F01**. Keep the total unchanged for this walkthrough. No V3 or third review round is created; the entire F01 sequence restarts on V2.
7. Approve F01 as Requester → Manager → FIN → Legal; sign and archive. History and Documents retain exactly two main versions and two review rounds, plus both F01 runs.

### SC04 — Quantity-only Annex C, and optional Partial Acceptance D

1. Load SC04 as Requester. Inspect `LEG-2025-008`, its legacy original PDF, declaration, reason and exact exemption conditions. C requires quantity-only change, unchanged unit price and exclusion of construction annexes.
2. Submit. There are no FIN/Legal/Procurement review tasks. Status moves directly to `PENDING_FINALIZATION`, with the requester assertion and provisional `LEGAL_PENDING LP-02` explanation recorded.
3. Confirm partner agreement and finalize. Approve F01 as **Requester → IT Manager**, then sign and archive. Original reference and file stay in the package.
4. To demonstrate D, use **Load D variation · partial acceptance** before submitting, or choose **Load D Variation** in the gallery. Repeat the same steps. The document is partial acceptance without changed clauses, not liquidation; route is **D**. C and D remain distinct, provisional declarations.

Missing original reference/file, affirmation, reason or applicable unchanged conditions blocks exemption submission. Construction annexes cannot use quantity-only C; remove the exemption declaration to proceed through full B review instead.

### SC05 — Request Legal Draft, then B

1. Load SC05 as Requester. Inspect the drafting brief and principle PDF. Submit without a main file: status is `PENDING_LEGAL_DRAFT`.
2. Switch to Legal. **Prepare Contract Draft** by uploading Word/PDF V1, or use the clearly labeled mock draft PDF fixture.
3. The case moves to B `IN_REVIEW`. Legal drafting has not approved Legal review: separately **Approve** Legal's review and then FIN's review.
4. Requester confirms partner agreement and finalizes. F01 is **Requester → Manager → FIN → Legal**.
5. Finish signing and archive. Drafting instructions and pre-V1 history remain available.

### Common signing and archival steps

1. After the last F01 approval, switch to Requester, select an active authorized signer and **Send for Signature · SIMULATED**. Signing SLA is three business days.
2. Switch to Maison Signatory and **Simulate Maison Signature**, or upload an offline Maison signed-copy evidence file. This creates an immutable artifact, not a real digital signature. The signatory can return the case with a mandatory reason.
3. Switch to Requester. **Record Partner Signed Copy** by uploading evidence or choosing the labeled mock fixture. Partner-first signing is supported after internal F01 is complete.
4. Check all three declarations: signatures/evidence received, approved version/content matches, and originals/wet-ink handling verified. **Complete Contract & Archive** is guarded until both parties have evidence and all declarations are checked.
5. Status is `SIGNED_ARCHIVED`. Switch to ACC Archive Viewer and open its archive notification. Main version, hashes, supporting files, F01 records, signed evidence and frozen counterparty snapshot remain available. Signed cases cannot be edited or overwritten.

## Creating your own contract

As a Requester, choose **Create Contract**, or **Create from Template** in the library. The form retains the original document types (Contract, Framework, Annex, MOU, Liquidation, Acceptance) and adds explicit Renewal/Partial Acceptance. Source and transaction type remain separate fields.

1. Enter basic fields, select a directory counterparty, manual amounts, optional start date, free-text term/progress and one payment-terms field. There is no auto tax/total calculation. Obvious mismatches produce a warning without changing the entered total.
2. Save incomplete Draft. Upload supporting documents in the common area, explicitly selecting `APPROVED_PRINCIPLE` for E-pro/other principle evidence. For legacy originals also choose `ORIGINAL_CONTRACT` and enter reference/title. Files cannot be replaced with pasted external links.
3. For a Legal template, complete commercial fields then **Generate Controlled V1**. This pins a template version and freezes the generated fields. The downloadable artifact is honest mock text, not a genuine DOCX. Protected wording cannot be edited. External replacement creates a new immutable version and makes it ineligible for A. For Vendor source, upload Word/PDF. A Legal draft request needs detailed instructions and an eligible named Legal drafter instead of an initial file.
4. Choose named reviewers, eligible ordered F01 people and optional signatory. **Use branch defaults** restores a valid branch sequence after source/transaction/exemption changes. Optional steps can be added, moved or removed; Submit enforces mandatory functions, Requester/Manager first, final FIN for A or Legal for B, and FIN before Procurement/SD for B.
5. Inspect the routing explanation and validation summary, Save/Submit, and use the same lifecycle controls as the seeded scenarios.

Routing is one shared deterministic service. A requires an active approved controlled template, VND fixed positive total strictly below the configured 23m threshold, and no individual/FX ambiguity. Exactly 23m, vendor files, externally replaced templates, Legal drafting, estimated/variable/no-payment and ambiguous cases use B unless a complete C/D declaration applies. VARIABLE and NO_PAYMENT may submit with a meaningful basis; MISSING may only save as Draft. FX requires original amount, manual VND equivalent, source and date; it does not gain A through a checkbox. Individual gross/pre-PIT and net values are separate, with conservative B.

## Persistence, preservation and implementation

- Contract metadata/audit/assignments/personas/config use `maison-clm-functional-v2` in localStorage. Actual uploaded bytes use IndexedDB `maison-clm-assets-v2`, object store `files`; localStorage never holds uploaded binary data. Small generated mock text/PDF fixture sources are reproducible metadata. File assets carry size, category, actor, timestamp, storage key and SHA-256; downloads check access and checksum.
- Uploads create new assets and main version IDs; older bytes are never overwritten. New main versions restart every mandatory review task and invalidate the previous F01 for future signing. Old rounds/runs remain visible. Material F01-only corrections re-evaluate routing and restart all F01 steps; route changes force fresh required reviews.
- Counterparty details are frozen for controlled template generation and F01 finalization, then retained in archive. Later directory edits do not rewrite signed package metadata. Legal documents are advisory and files marked `LEGAL_DOC` are restricted in app.
- The existing React/TypeScript/Tailwind project, dependencies, palette, original mock counterparties/templates and reference documents are retained. The original CLM-001 source is preserved in `docs/legacy-prototype.tsx` as an unmounted historical reference. The prior `maison-clm-v1` storage key is left intact; old records migrate once into Drafts. Old file names remain noted, but CLM-001 never stored their bytes, so evidence must be reattached. Its earlier tentative routing rules are superseded by the binding v1.0 spec.
- Domain: `src/domain.ts`. File adapter: `src/assets.ts`. Seed gallery/legacy migration: `src/scenarios.ts`. React screens/workbench: `src/main.tsx`. No second application, external service or production authentication was introduced.
- Review SLA: A 2/B 3 business days; signing 3, excluding weekends and configured holidays. Date-only Vietnam calendar, inclusive end-of-due-day cutoff, no invented F01 due date. Notifications are deduplicated in-app on load/every 30 seconds while the app is open. Overdue tasks remain actionable. There is no SLA extension.
- Reset is per scenario; other contracts remain intact. Old unreferenced asset bytes are retained to avoid destructive overwrites and may eventually consume browser quota. File limit is 25 MB each. Clearing browser site data removes local demo persistence. No multi-tab concurrency or production retention guarantees.

## Verification and limits

`npm.cmd test` covers all five actual domain lifecycles through `SIGNED_ARCHIVED`, including the D variation, V2 re-review, F01 correction, threshold boundary, role eligibility, unauthorized/replayed actions, parallel review, sequential F01, evidence/checklist guards, original declarations, archive access, legacy migration, scenario isolation, persistence serialization, business days, reminders and fixture checksums.

Build and automated domain tests were run. Browser UI verification was attempted but could not complete: the browser access host was unavailable and native-app access timed out. No claim is made that a browser click-through or responsive visual QA passed. User-upload IndexedDB persistence is implemented but was not validated by a browser test in this environment.

Implemented: creation/Draft validation, directory CRUD/reuse/duplicate-tax warning, template versions/activation, all five workflow paths, actor switching/access filtering, file uploads/downloads, version/audit history, ordered dynamic F01, mock signing/offline evidence, guarded archive, ACC notifications, calendar/SLA and per-scenario reset.

Simulated: personas/authentication/permissions, Legal template approval status, template text artifacts, E-pro approval fixtures, signatory authority, Maison signature, partner signature evidence and in-app notifications. Uploaded documents are stored, not semantically verified. F01 approvals are internal mock confirmations. Browser storage is inspectable and is **not production security or immutable audit storage**.

Intentionally not implemented: real e-signature/CA/certificates/stamps, ERP/E-pro/email/SharePoint/OneDrive integrations, real authentication/server RBAC, online Word editor or automatic diff, LOA engine, SLA extensions, payment schedules/calculation, automated expiry, historic mass import, retention/encryption and legally binding verification. External Word editing followed by new-version upload is supported.

All **LP-01–LP-17** remain open. Every screen includes **Legal Review / Open Decisions** with the complete decision register. Conservative prototype behavior is not Legal, Finance or Security approval; C/D bypass, requester self-completion, individual/FX thresholds, simplified F01 fields and the stated production gaps require validation before go-live.

## English / Tiếng Việt

Chọn **Language / Ngôn ngữ** ở thanh trên cùng để đổi giữa English và Tiếng Việt. Lựa chọn được lưu riêng trong `maison-clm-language` và áp dụng khi mở lại ứng dụng. Các màn hình chính, trường nhập, nút thao tác, trạng thái, hướng dẫn kịch bản và danh sách quyết định Legal có bản dịch. Mã trạng thái lưu trong dữ liệu và mã nhánh A/B/C/D vẫn dùng mã nghiệp vụ gốc. Nội dung người dùng nhập, tên file, bản chụp F01 và sự kiện lịch sử giữ nguyên ngôn ngữ lúc tạo để đối chiếu. Một số thông báo nghiệp vụ cũ vẫn hiển thị ngôn ngữ nguồn. Bộ kiểm tra bổ sung kiểm tra nhãn EN/VI, hiển thị bộ chọn và việc đổi nhãn không sửa dữ liệu quy trình.
