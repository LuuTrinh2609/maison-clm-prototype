import {SCENARIOS} from './scenarios';
import {DECISIONS, EXEMPTIONS} from './domain';
import React, {createContext, useContext, useEffect, useState} from 'react';

export type Language = 'en' | 'vi';
const LANGUAGE_KEY = 'maison-clm-language';
const vocabulary = `Dashboard|Tổng quan
Create Contract|Tạo hợp đồng
Contract Detail|Chi tiết hợp đồng
Template Library|Thư viện mẫu
Counterparties|Danh mục đối tác
Administration|Quản trị
Demo Scenarios|Kịch bản demo
Overview|Thông tin chung
History|Lịch sử
Documents|Tài liệu
My Tasks|Công việc của tôi
My Contracts|Hợp đồng của tôi
Save Draft|Lưu nháp
Submit|Gửi xử lý
Approve|Phê duyệt
Request Changes|Yêu cầu chỉnh sửa
Comment only|Chỉ nhận xét
Download|Tải xuống
Remove|Xóa bước
Due|Hạn xử lý
Overdue ·|Quá hạn ·
Branch|Nhánh
Route|Nhánh
Why this route?|Vì sao chọn nhánh này?
Required reviewers:|Vai trò soát xét bắt buộc
Common multi-file attachments · category|Tài liệu đính kèm · phân loại
Attach supporting files|Đính kèm tài liệu bổ trợ
attachments. Mark principle evidence explicitly.|tài liệu. Cần phân loại rõ chứng từ phê duyệt chủ trương.
Word / PDF / image / text · 25 MB maximum · persisted in IndexedDB|Word / PDF / ảnh / văn bản · tối đa 25 MB · lưu trên trình duyệt
No documents yet. Save Draft, then attach files.|Chưa có tài liệu. Lưu nháp rồi đính kèm file.
Preparing demo scenarios…|Đang chuẩn bị kịch bản demo…
Use branch defaults|Dùng thứ tự mặc định của nhánh
Add optional SD step|Thêm bước chuyên môn
Add optional manager step|Thêm bước quản lý
Submit enforces mandatory roles and order. Multiple roles per person require distinct actions.|Khi gửi, hệ thống kiểm tra vai trò và thứ tự bắt buộc. Một người giữ nhiều vai trò cần xác nhận riêng từng bước.
1 · Basic information|1 · Thông tin cơ bản
Contract title *|Tên hồ sơ *
Project / subject *|Dự án / nội dung *
Requesting department *|Phòng yêu cầu *
Document type *|Dạng văn bản *
Transaction type *|Loại giao dịch *
Document source *|Nguồn tài liệu *
Version-pinned Legal template|Mẫu Legal theo phiên bản cố định
Protected mock clauses:|Điều khoản mẫu được bảo vệ
· Complete fields before generating V1.|· Điền đầy đủ thông tin trước khi tạo V1.
Drafting instructions *|Yêu cầu soạn thảo *
Named Legal drafter|Nhân sự Legal soạn thảo
2 · Counterparty & financials|2 · Đối tác và tài chính
Shared counterparty *|Đối tác trong danh mục chung *
Directory supports search / add / reuse / legal documents. Advisory checklist: registration, tax record, representative authority.|Danh mục hỗ trợ tìm kiếm, thêm, sử dụng lại và hồ sơ pháp lý. Cần kiểm tra đăng ký, mã số thuế và thẩm quyền đại diện.
documents available.|tài liệu hiện có.
Value type *|Loại giá trị *
Currency|Loại tiền
Contract value (manual)|Giá trị hợp đồng (nhập tay)
VAT amount (manual)|Tiền VAT (nhập tay)
PIT withholding (manual)|Thuế TNCN khấu trừ (nhập tay)
Other fees (manual)|Phí khác (nhập tay)
Total payment * (manual)|Tổng thanh toán * (nhập tay)
Individual gross pre-PIT|Giá trị cá nhân trước khấu trừ TNCN
Individual net payment|Thực trả cho cá nhân
Manual VND equivalent *|Giá trị quy đổi VND nhập tay *
FX source *|Nguồn tỷ giá *
FX date *|Ngày tỷ giá *
Optional start date|Ngày bắt đầu (không bắt buộc)
LEGAL_PENDING: FX defaults to B.|LEGAL_PENDING · Ngoại tệ mặc định đi nhánh B.
Value basis / no-payment justification|Cơ sở xác định giá / lý do không thanh toán
Term / progress · free text|Thời hạn / tiến độ · nhập tự do
Payment terms · one free-text field|Điều khoản thanh toán · một trường nhập tự do
Key contractual terms / allowed field|Điều khoản chính / trường được phép điền
3 · Documents & assignments|3 · Tài liệu và phân công
Save Draft before attaching files. Submit requires actual principle evidence.|Lưu nháp trước khi đính kèm. Khi gửi cần có file phê duyệt chủ trương.
Generate Controlled V1 · MOCK text artifact|Tạo V1 từ mẫu được kiểm soát · văn bản DEMO
Generated fields frozen to match V1. A replacement file creates a new version and routes B.|Thông tin đã khóa theo V1. Thay file sẽ tạo phiên bản mới và chuyển nhánh B.
Original contract & exception|Hợp đồng gốc và ngoại lệ
Link existing archived CLM contract|Liên kết hợp đồng CLM đã lưu trữ
Legacy original number|Số hợp đồng gốc ngoài CLM
Legacy original title|Tên hợp đồng gốc ngoài CLM
C/D exemption declaration|Khai báo miễn soát xét C/D
LEGAL_PENDING LP-02 · Self-attestation, not a verified finding.|LEGAL_PENDING LP-02 · Khai báo do người yêu cầu tự xác nhận, cần Legal thẩm định.
I affirm compliance with the complete exemption conditions|Tôi xác nhận đáp ứng đầy đủ điều kiện miễn soát xét
Clauses / price / payment unchanged as declared|Điều khoản / giá / thanh toán giữ nguyên theo khai báo
Construction annex (excludes quantity-only C)|Phụ lục thi công xây dựng (không thuộc C chỉ đổi khối lượng)
Exemption reason *|Lý do miễn soát xét *
Specialized review required|Cần soát xét chuyên môn
Named reviewers · mandatory functional roles enforced|Chọn đích danh người soát xét · kiểm tra vai trò bắt buộc
Ordered F01 approvers · demo confirmations|Người xác nhận F01 theo thứ tự · xác nhận demo
Proposed authorized signatory|Người ký được ủy quyền đề xuất
4 · Review & Submit|4 · Kiểm tra và gửi
Access: owner, named assignees, selected signer and authorized oversight; ACC archive only.|Quyền xem dành cho chủ hồ sơ, người được phân công, người ký và giám sát có quyền. ACC xem hồ sơ đã lưu trữ.
Submit · Route|Gửi xử lý · Nhánh
Access denied|Không có quyền truy cập
Contract access requires assignment or authorized oversight.|Cần được phân công hoặc có quyền giám sát để truy cập hồ sơ.
walkthrough ·|hướng dẫn ·
Reset this scenario|Đặt lại kịch bản này
Load D variation · partial acceptance|Nạp biến thể D · nghiệm thu từng phần
Contract overview|Thông tin hợp đồng
Open linked original|Mở hợp đồng gốc liên kết
Self-attested:|Tự xác nhận
Review round|Vòng soát xét
Consolidated:|Ý kiến tổng hợp
F01 run|Lượt xác nhận F01
Frozen SHA-256:|SHA-256 đã khóa
· No F01 SLA|· Chưa quy định SLA cho F01
Frozen metadata snapshot|Thông tin được chốt tại thời điểm xác nhận
Signature progress · SIMULATION|Tiến độ ký · MÔ PHỎNG
Partner:|Đối tác
Version|Phiên bản
Signed & Archived|Đã ký và lưu trữ
Signed & archived|Đã ký và lưu trữ
Archived|Đã lưu trữ
. Approved version and signed evidence retained. ACC notified.|. Đã lưu phiên bản được duyệt và bằng chứng ký. Đã thông báo ACC.
Signatures received ✓ · Version matched ✓ · Originals checked ✓|Đủ chữ ký ✓ · Khớp phiên bản ✓ · Đã kiểm tra bản gốc ✓
Signed counterparty snapshot:|Thông tin đối tác chốt khi ký
Shared append-only timeline|Lịch sử sự kiện chung
Documents & immutable versions|Tài liệu và phiên bản được bảo toàn
F01 confirmation record · run|Biên bản xác nhận F01 · lượt
Functional Prototype|Bản mẫu chức năng
DEMO / Not Production|DEMO / Chưa vận hành chính thức
Fictional data only.|Dữ liệu giả lập.
Browser access is a simulation; production requires server controls.|Quyền truy cập được mô phỏng trên trình duyệt. Khi triển khai cần kiểm soát từ máy chủ.
DEMO · Act as|DEMO · Vai trò hiện tại
Act as demo user|Chọn người dùng demo
MAISON LEGAL WORKSPACE · DEMO / NOT PRODUCTION|KHÔNG GIAN LEGAL MAISON · BẢN DEMO
Review, confirmation and archive · Simulated signatures|Soát xét, xác nhận và lưu trữ · Ký mô phỏng
Return to My Tasks / Contracts|Về công việc / hợp đồng của tôi
Saving…|Đang lưu…
Start new Draft|Tạo bản nháp mới
Contract not found|Không tìm thấy hợp đồng
Return to Dashboard|Về tổng quan
Load / Reset|Nạp / Đặt lại
Load D Variation|Nạp biến thể D
Resets this scenario only; previous assets retained.|Đặt lại riêng kịch bản này. Các tài liệu trước đó vẫn được giữ.
Five complete lifecycle demos|Năm kịch bản xuyên suốt vòng đời hợp đồng
Load a Draft, switch actors, review, confirm F01 and simulate signing through archive.|Nạp bản nháp, đổi vai trò, soát xét, xác nhận F01 và mô phỏng ký đến lưu trữ.
Scenario Gallery|Danh sách kịch bản
Accessible contracts|Hồ sơ được phép xem
My actionable tasks|Công việc cần xử lý
Search contracts|Tìm hợp đồng
Search code, title or counterparty…|Tìm mã, tên hồ sơ hoặc đối tác…
Status filter|Lọc trạng thái
No actionable tasks or contracts for|Chưa có công việc hoặc hợp đồng dành cho
. Switch demo actor or load a scenario.|. Hãy đổi người dùng demo hoặc nạp kịch bản.
In-app notifications|Thông báo trong ứng dụng
In-app assignments, reminders and overdue alerts; no email delivery.|Thông báo phân công, nhắc hạn và quá hạn trong ứng dụng. Chưa gửi email.
Legal Review / Open Decisions · 17 LEGAL_PENDING items|Nội dung cần Legal xác nhận · 17 mục LEGAL_PENDING
Demo · No ERP / E-pro / real e-signature|Demo · Chưa tích hợp ERP / E-pro / ký điện tử thật
Next suggested action|Bước xử lý tiếp theo
No action for this actor. Current owner(s):|Người dùng này chưa có thao tác cần xử lý. Người đang phụ trách
Comment / required reason for changes|Nhận xét / lý do yêu cầu sửa (bắt buộc khi trả về)
Prepare Contract Draft · upload main V1|Soạn thảo hợp đồng · tải lên bản chính V1
Use mock draft PDF fixture|Dùng file PDF soạn thảo demo
Drafting creates separate Legal and FIN review tasks.|Sau soạn thảo, hệ thống tạo công việc soát xét riêng cho Legal và FIN.
Review|Soát xét
Partner agreed to this reviewed contract version|Đối tác đã đồng ý với phiên bản đã soát xét này
F01 current step ·|Bước F01 hiện tại ·
Internal demo confirmation; not a digital signature.|Xác nhận nội bộ trong demo, chưa phải chữ ký điện tử.
Correct F01 payment / supporting information|Sửa thông tin thanh toán / bổ trợ trên F01
Correct F01 total (route rechecked)|Sửa tổng tiền F01 (kiểm tra lại nhánh)
Main version unchanged. Entire F01 restarts; a changed route forces reviews.|Giữ phiên bản hợp đồng chính và chạy lại toàn bộ F01. Nếu đổi nhánh, phải soát xét lại.
Upload new contract version · restart ALL reviews|Tải phiên bản hợp đồng mới · soát xét lại TẤT CẢ
Upload revised main Word / PDF|Tải bản chính Word / PDF đã chỉnh sửa
Use revised mock fixture V|Dùng file chỉnh sửa demo V
Old versions, review rounds and F01 runs are retained.|Giữ lại phiên bản cũ, các vòng soát xét và lượt F01.
Authorized Maison signatory|Người ký Maison được ủy quyền
Simulate Maison Signature|Mô phỏng chữ ký Maison
Or record Maison offline signed copy|Hoặc tải bản Maison đã ký ngoài hệ thống
Record Partner Signed Copy · upload evidence|Ghi nhận bản đối tác đã ký · tải bằng chứng
Record Partner Signed Copy · mock fixture|Ghi nhận bản đối tác đã ký · file demo
Search counterparty / tax ID|Tìm đối tác / mã số thuế
Download legal document|Tải hồ sơ pháp lý
Edit / legal docs|Sửa / hồ sơ pháp lý
Legal name *|Tên pháp lý *
Kind|Loại đối tác
Tax ID · duplicate check|Mã số thuế · kiểm tra trùng
Contact|Liên hệ
Representative|Người đại diện
Legal documents · save party first|Hồ sơ pháp lý · lưu đối tác trước
Save Counterparty|Lưu đối tác
New counterparty|Đối tác mới
Edit counterparty|Sửa đối tác
Add counterparty|Thêm đối tác
Signed archives keep a separate snapshot after directory changes.|Thông tin đối tác trong hồ sơ đã ký được giữ riêng sau khi danh mục thay đổi.
Create from Template|Tạo từ mẫu
Clone new version|Tạo bản sao phiên bản mới
Mark Demo Legal Approved|Đánh dấu Legal duyệt (demo)
Demo users & functional groups|Người dùng demo và nhóm chức năng
Admin manages users; cannot approve other people’s tasks.|Admin quản lý người dùng. Quyền phê duyệt được kiểm tra theo phân công.
Add role…|Thêm vai trò…
New fictional user name|Tên người dùng giả lập mới
Department|Phòng ban
Functional group|Nhóm chức năng
Add User|Thêm người dùng
Authorized signatories · no LOA engine|Danh sách người ký được ủy quyền · chưa có bộ quy tắc LOA
Remove authorization|Bỏ quyền ký
Add authorized signatory (demo only)|Thêm người ký được ủy quyền (demo)
Business calendar & routing policy|Lịch làm việc và chính sách định tuyến
Branch A threshold VND · strict less-than|Ngưỡng nhánh A (VND) · phải nhỏ hơn ngưỡng
Holiday dates · YYYY-MM-DD, one per line|Ngày nghỉ · YYYY-MM-DD, mỗi dòng một ngày
Save Configuration|Lưu cấu hình
Active|Đang hoạt động
Inactive|Ngừng hoạt động
Activate|Kích hoạt
Deactivate|Ngừng hoạt động
Select person|Chọn người
Select counterparty|Chọn đối tác
Select later|Chọn sau
Select authorized signer|Chọn người ký được ủy quyền
Choose active person|Chọn người đang hoạt động
Contract|Hợp đồng
Framework|Hợp đồng khung / nguyên tắc
Annex|Phụ lục
MOU|Biên bản ghi nhớ
Liquidation|Thanh lý
Acceptance|Nghiệm thu
Partial acceptance|Nghiệm thu từng phần
Renewal|Gia hạn
Services|Dịch vụ
Goods procurement|Mua hàng
Sales|Bán hàng
Lease|Thuê mặt bằng
Wholesale|Bán sỉ
Consignment|Ký gửi
Cooperation|Hợp tác
Other|Khác
FIXED|Cố định
ESTIMATED|Ước tính
VARIABLE|Biến đổi / chưa ấn định
NO_PAYMENT|Không thanh toán
MISSING|Chưa xác định
ORGANIZATION|Tổ chức
INDIVIDUAL|Cá nhân
ALL|Tất cả
DRAFT|Bản nháp
PENDING_LEGAL_DRAFT|Chờ Legal soạn thảo
IN_REVIEW|Đang soát xét
REVIEW_CONSOLIDATION|Chờ tổng hợp ý kiến
CHANGES_REQUESTED|Yêu cầu chỉnh sửa
PENDING_FINALIZATION|Chờ chốt hợp đồng
F01_IN_PROGRESS|Đang xác nhận F01
F01_CHANGES_REQUESTED|F01 cần chỉnh sửa
READY_FOR_SIGNING|Sẵn sàng ký
PENDING_SIGNATURE|Chờ ký
SIGNED_ARCHIVED|Đã ký và lưu trữ
PENDING|Chờ xử lý
APPROVED|Đã phê duyệt
REQUESTER|Người yêu cầu
MANAGER|Quản lý phòng yêu cầu
FIN_ACC|Tài chính / Kế toán
LEGAL|Pháp chế
PROCUREMENT|Mua hàng
SPECIALIZED|Chuyên môn
APPROVED_PRINCIPLE|Phê duyệt chủ trương
ORIGINAL_CONTRACT|Hợp đồng gốc
LEGAL_DOC|Hồ sơ pháp lý
REVIEW_ATTACHMENT|Tài liệu nhận xét
OTHER|Tài liệu khác
CONTRACT_MAIN|Hợp đồng chính
SIGNED_COPY|Bản đã ký
Legal template · controlled fields|Mẫu Legal · điền trường được phép
Vendor Word / PDF|File Word / PDF từ đối tác
Request Legal Draft|Yêu cầu Legal soạn thảo
Legal Template Fast Track|Mẫu Legal · Luồng rút gọn
Vendor Goods · Full Review|Hợp đồng mua hàng từ đối tác · Soát xét đầy đủ
Version V2 & F01 Correction|Phiên bản V2 và chỉnh sửa F01
Annex Exemption · C / D|Phụ lục miễn soát xét · C / D
Consolidate & Return|Tổng hợp và trả về
Finalize Contract & Send F01|Chốt hợp đồng và gửi F01
Correct F01 only & Restart F01|Chỉ sửa F01 và chạy lại F01
Send for Signature · SIMULATED|Gửi ký · MÔ PHỎNG
Signatory Request Changes|Người ký yêu cầu chỉnh sửa
Complete Contract & Archive|Hoàn tất hợp đồng và lưu trữ
Complete Draft & Submit|Hoàn thiện bản nháp và gửi
Prepare Contract Draft|Soạn thảo hợp đồng
Upload Revised Version|Tải phiên bản chỉnh sửa
Correct F01 or Main Version|Sửa F01 hoặc phiên bản hợp đồng chính
Send for Signature|Gửi ký
Record Partner Signed Copy|Ghi nhận bản đối tác đã ký
Verify Checklist & Complete Contract|Kiểm tra danh sách và hoàn tất hợp đồng
Ready to Submit|Đủ điều kiện gửi
Untitled Draft|Bản nháp chưa đặt tên
No feedback|Chưa có ý kiến
Working copy|Bản đang xử lý
Locked|Đã khóa
No main version|Chưa có bản chính
Required signatures & signed evidence received|Đã nhận đủ chữ ký và bằng chứng ký
Approved version / content matches signed copy|Bản đã ký khớp phiên bản / nội dung được duyệt
Originals / wet-ink handling checked (LEGAL_PENDING)|Đã kiểm tra bản gốc / bản ký tay (LEGAL_PENDING)
Saved · audit and assignments updated.|Đã lưu · đã cập nhật lịch sử và phân công`;
const additional = {
 'No cross-functional reviewers (C/D)': 'Không có soát xét liên phòng ban (C/D)',
 'Department confirmation · LEGAL_PENDING': 'Xác nhận trong phòng yêu cầu · LEGAL_PENDING',
 'Vendor, Legal draft, ungenerated/replaced or inactive template requires full review.': 'File từ đối tác, Legal soạn thảo, mẫu chưa tạo / đã thay hoặc ngừng hoạt động phải soát xét đầy đủ.',
 'Amount or unresolved value policy requires full review.': 'Giá trị hoặc chính sách giá trị chưa được xác nhận cần soát xét đầy đủ.',
 'LEGAL_PENDING LP-04: individual gross/PIT or FX validation; conservative B.': 'LEGAL_PENDING LP-04 · Chờ xác nhận giá trị cá nhân / thuế TNCN hoặc tỷ giá. Tạm áp dụng nhánh B.',
 'LEGAL_PENDING LP-05: estimated/variable/zero amounts do not qualify for A.': 'LEGAL_PENDING LP-05 · Giá trị ước tính / biến đổi / bằng 0 chưa đủ điều kiện nhánh A.',
 'LEGAL_PENDING LP-02: exemption and departmental confirmation path are provisional.': 'LEGAL_PENDING LP-02 · Miễn soát xét và lộ trình xác nhận trong phòng yêu cầu đang chờ Legal duyệt.',
 'Required signatures & signed evidence received': 'Đã nhận đủ chữ ký và bằng chứng ký',
 'Review A: 2 business days · B: 3 · Signing: 3. Vietnam date-only calendar, weekends/holidays excluded. No F01 SLA or SLA extension.': 'SLA theo ngày làm việc Việt Nam, trừ cuối tuần và ngày nghỉ. Nhánh A 2 ngày, B 3 ngày, ký 3 ngày. Chưa quy định SLA F01 hoặc gia hạn SLA.',
 'No legally effective signature/certificate validation. LP-08/09/10/16.': 'Chưa xác thực hiệu lực chữ ký hoặc chứng thư. LP-08/09/10/16.',
 'Use legacy original or no link': 'Dùng hợp đồng gốc ngoài CLM hoặc không liên kết',
 'No exemption · automatic A/B': 'Không miễn soát xét · tự động chọn A/B',
 'Upload replacement main version · routes B': 'Tải file thay bản chính · chuyển nhánh B',
 'Upload Vendor main Word / PDF': 'Tải bản chính Word / PDF từ đối tác',
 'Simulate Maison Signature / Offline Copy': 'Mô phỏng chữ ký Maison / bản ký ngoài hệ thống',
 'Project': 'Dự án', 'Document / transaction': 'Văn bản / giao dịch', 'Source': 'Nguồn',
 'Term / progress': 'Thời hạn / tiến độ', 'Payment terms': 'Điều khoản thanh toán', 'Key terms': 'Điều khoản chính',
 'Draft instructions': 'Yêu cầu soạn thảo', 'Original': 'Hợp đồng gốc', 'Counterparty': 'Đối tác',
 'Main version unchanged. Entire F01 restarts; a changed route forces reviews.': 'Giữ phiên bản chính và chạy lại toàn bộ F01. Đổi nhánh cần soát xét lại.',
 'Restricted identity documents. Dummy placeholders only; no real PII.': 'Hồ sơ định danh hạn chế truy cập. Chỉ dùng dữ liệu cá nhân giả lập.',
 'Pinned immutable version. Allowed commercial fields only. Generated mock text is not DOCX or a genuine Legal template.': 'Cố định phiên bản mẫu. Chỉ điền trường thương mại được phép. File văn bản được tạo là mẫu minh họa để review.',
 'Demo Legal approved': 'Legal đã duyệt (demo)', 'Unapproved': 'Chưa duyệt', 'Restricted': 'Hạn chế truy cập'
};
const scenarioTranslations: Record<string,string> = {
 SC01:'Người yêu cầu gửi → FIN soát xét → Người yêu cầu xác nhận đối tác đồng ý và chốt → F01 Người yêu cầu / Quản lý / FIN → Gửi ký → Người ký mô phỏng chữ ký → Người yêu cầu ghi nhận bản đối tác ký và hoàn tất.',
 SC02:'Gửi → Legal và FIN duyệt, Procurement đang chờ phải chặn chốt hồ sơ → Procurement duyệt → Chốt → F01 Người yêu cầu / Quản lý / FIN / Procurement / Legal → Ký → Lưu trữ.',
 SC03:'Gửi → FIN duyệt, Legal yêu cầu sửa → Legal tổng hợp → Người yêu cầu tải V2 → FIN và Legal duyệt lại → Chốt → F01 Người yêu cầu và Quản lý duyệt, FIN yêu cầu sửa → Người yêu cầu chỉ sửa F01 → Chạy lại toàn bộ F01 trên V2 → Ký → Lưu trữ.',
 SC04:'Kiểm tra hợp đồng gốc và khai báo tự xác nhận → Gửi → Bỏ qua soát xét liên phòng ban → Chốt → F01 Người yêu cầu / Quản lý → Ký → Lưu trữ. Chọn biến thể D trước khi gửi để thử nghiệm thu từng phần.',
 SC05:'Gửi khi chưa có file chính → Legal soạn thảo và tải V1 → Legal và FIN duyệt riêng → Chốt → F01 Người yêu cầu / Quản lý / FIN / Legal → Ký → Lưu trữ.'
};
const decisionTranslations = [
 'Demo cho phép lưu nháp trước E-pro. Khi gửi phải có chứng từ phê duyệt.',
 'Miễn soát xét C/D do người yêu cầu tự khai và lộ trình xác nhận nội bộ đang chờ Legal duyệt.',
 'Chỉ mẫu được kiểm soát, cố định phiên bản và tạo qua hệ thống mới có thể vào A.',
 'Chờ xác nhận giá trị trước khấu trừ TNCN và tỷ giá. Tạm áp dụng B.',
 'Giá ước tính, biến đổi và không thanh toán vào B, trừ C/D.',
 'Vai trò F01 động, thứ tự và ký nháy trang cuối cần Legal xác nhận.',
 'Chỉ sửa F01 sẽ chạy lại toàn bộ F01. Giữ kết quả soát xét khi bản chính không đổi.',
 'Danh sách người ký là giả lập. Cần kiểm tra ủy quyền LOA thật.',
 'Chữ ký được mô phỏng. Cần nhà cung cấp được cấp phép và kiểm tra chứng thư.',
 'Người yêu cầu tự xác nhận hoàn tất và bản ký tay cần Legal chấp thuận.',
 'Cách thể hiện thời hạn / thanh toán nhập tự do trên F01 cần Legal chấp thuận.',
 'Chỉnh Word ngoài hệ thống. Chưa có so sánh tự động hoặc gia hạn SLA.',
 'SLA tính theo ngày làm việc. Chưa đặt thời hạn F01.',
 'Chưa triển khai hợp đồng nhân viên / nhượng quyền và phạm vi Campuchia.',
 'Hồ sơ định danh giả lập. Cần phân quyền máy chủ, mã hóa và chính sách lưu trữ.',
 'Giữ hash bản được duyệt và bản ký. Chuỗi xác minh giá trị pháp lý đang chờ xác nhận.',
 'Mua hàng cần Procurement. SD tùy chọn là vai trò riêng với quản lý phòng yêu cầu.'
];
const exemptionTranslations = [
 'Phụ lục chỉ thay đổi khối lượng, giữ nguyên đơn giá và không phải phụ lục thi công xây dựng.',
 'Gia hạn cùng đối tác, giá và điều khoản với bằng chứng E-pro được duyệt.',
 'Nghiệm thu / thanh lý không đổi nội dung, giá trị và điều khoản thanh toán. Phạm vi cần Legal xác nhận.',
 'Nghiệm thu từng phần, không đổi điều khoản và không phải thanh lý. Cần hợp đồng gốc.'
];
const pairs = vocabulary.split('\n').map(line => line.split('|') as [string, string]);
pairs.push(...Object.entries(additional));
SCENARIOS.forEach(scenario => pairs.push([scenario.steps, scenarioTranslations[scenario.id]]));
DECISIONS.forEach(([code, text], index) => pairs.push([text, decisionTranslations[index]]));
Object.values(EXEMPTIONS).forEach((text,index)=>pairs.push([text, exemptionTranslations[index]]));
const vietnamese = Object.fromEntries(pairs);
const english = Object.fromEntries(pairs.map(([en, vi]) => [vi, en]));
export function translateText(text: string, language: Language): string {
  const dictionary = language === 'vi' ? vietnamese : english;
  if (dictionary[text]) return dictionary[text];
  if (language === 'vi') {
    if (/^Named /.test(text)) return text.replace(/^Named (.+?) (reviewer|F01 approver) (\d+)$/, (_,group,kind,step)=>
      (kind==='reviewer'?'Người soát xét':'Người xác nhận F01')+' '+translateText(group,language)+' '+step);
    if (/^Legal template unchanged AND total </.test(text)) return text.replace('Legal template unchanged AND total <','Mẫu Legal giữ nguyên VÀ tổng thanh toán <');
    if (/^\d+ business days review$/.test(text)) return text.replace('business days review','ngày làm việc soát xét');
    if (/^\d+ required corrections$/.test(text)) return text.replace('required corrections','nội dung cần bổ sung');
  }
  return text.split(/(\s*·\s*|\s*→\s*|\n)/).map(part => {
    const trimmed = part.trim();
    return dictionary[trimmed] ? part.replace(trimmed, dictionary[trimmed]) : part;
  }).join('');
}
const LanguageContext = createContext<{language: Language; setLanguage: (language: Language) => void}>({language:'en', setLanguage:()=>{}});
export function I18nProvider({children}: {children: React.ReactNode}) {
  const [language, setLanguage] = useState<Language>(() => {
    try {return localStorage.getItem(LANGUAGE_KEY) === 'vi' ? 'vi' : 'en';} catch {return 'en';}
  });
  useEffect(() => {
    document.documentElement.lang = language;
    try {localStorage.setItem(LANGUAGE_KEY, language);} catch { /* The session still supports switching. */ }
  }, [language]);
  return <LanguageContext.Provider value={{language, setLanguage}}>{children}</LanguageContext.Provider>;
}
export function useTranslate() {
  const {language} = useContext(LanguageContext);
  return (text:string) => translateText(text, language);
}
export function Translated({value}: {value: React.ReactNode}) {
  const translate = useTranslate();
  function render(node:React.ReactNode):React.ReactNode {
    if (typeof node === 'string') return translate(node);
    if (Array.isArray(node)) return node.map(render);
    return node;
  }
  return <>{render(value)}</>;
}
export function LanguageSwitcher() {
  const {language, setLanguage} = useContext(LanguageContext);
  return <label className="language-switch">{language === 'vi' ? 'Ngôn ngữ' : 'Language'}
    <select aria-label="Language / Ngôn ngữ" value={language} onChange={event=>setLanguage(event.target.value as Language)}>
      <option value="en">English</option><option value="vi">Tiếng Việt</option>
    </select>
  </label>;
}
