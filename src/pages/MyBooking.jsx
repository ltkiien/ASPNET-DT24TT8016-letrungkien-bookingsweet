import { useMemo, useState, useEffect } from "react";
import {
  CalendarDays, MapPin, Users, BedDouble, Copy, Check, XCircle, Receipt, Search,
  Info, AlertCircle, Loader2, Building2, CircleCheck,
} from "lucide-react";
import { HOTELS, ROOMS, toISODate, addDays, nightsBetween, formatVND, roomTypeLabel } from "./HomeData";
import { getMyBookings } from "../api/bookingsApi";

/**
 * Trang "Booking của tôi" cho khách.
 * - Tab: Sắp tới / Đang ở / Hoàn thành / Đã hủy, tìm theo mã đặt phòng
 * - Xem chi tiết (tiến trình, chi phí, thông tin khách)
 * - Hủy booking theo chính sách hoàn tiền (tính ở client chỉ để hiển thị; backend phải tính lại theo giờ server)
 *
 * Booking cùng cấu trúc với booking tạo ở HomePage.createBooking:
 * { id, code, hotelId, roomId, checkIn, checkOut, guests, status, total, customer }
 */

// ---------- Hằng số ----------
const STATUS = {
  pending: { label: "Chờ xác nhận", cls: "warning" },
  confirmed: { label: "Đã xác nhận", cls: "primary" },
  checked_in: { label: "Đang lưu trú", cls: "info" },
  checked_out: { label: "Đã hoàn thành", cls: "secondary" },
  cancelled: { label: "Đã hủy", cls: "danger" },
};

const TABS = [
  { key: "upcoming", label: "Sắp tới", match: (b) => ["Pending", "Confirmed"].includes(b.status) },
  { key: "staying", label: "Đang ở", match: (b) => b.status === "Checked_in" },
  { key: "completed", label: "Hoàn thành", match: (b) => b.status === "Checked_out" },
  { key: "cancelled", label: "Đã hủy", match: (b) => b.status === "Cancelled" },
];

const STEPS = [
  { key: "pending", label: "Đã đặt" },
  { key: "confirmed", label: "Xác nhận" },
  { key: "checked_in", label: "Nhận phòng" },
  { key: "checked_out", label: "Trả phòng" },
];

const CANCEL_REASONS = ["Thay đổi kế hoạch", "Đặt nhầm ngày", "Tìm được giá tốt hơn", "Lý do khác"];

const fmtDate = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");
const hotelOf = (id) => HOTELS.find((h) => h.id === id);
const roomOf = (id) => ROOMS.find((r) => r.id === id);

/** Chính sách hủy: >= 2 ngày trước nhận phòng hoàn 100%, 1 ngày hoàn 50%, từ ngày nhận phòng không hủy online. */
export function getCancelPolicy(booking, today) {
  if (!["Pending", "Confirmed"].includes(booking.status)) {
    return { canCancel: false, reason: "Booking này không thể hủy." };
  }
  const days = nightsBetween(today, booking.checkIn);
  if (days >= 2) return { canCancel: true, refundRate: 1, note: "Hủy miễn phí, hoàn 100%." };
  if (days === 1) return { canCancel: true, refundRate: 0.5, note: "Hủy trước 1 ngày nhận phòng, hoàn 50%." };
  return { canCancel: false, reason: "Đã đến ngày nhận phòng, vui lòng liên hệ khách sạn để được hỗ trợ." };
}

// ---------- Dữ liệu mẫu (thay bằng GET /me/bookings) ----------
const today0 = toISODate(new Date());
const total = (roomId, a, b) => nightsBetween(a, b) * roomOf(roomId).pricePerNight;
const me = { customerName: "Nguyễn Văn An", phone: "0901234567", email: "an@example.com", note: "" };

const mk = (id, code, hotelId, roomId, inOffset, outOffset, guests, status) => {
  const checkIn = addDays(today0, inOffset);
  const checkOut = addDays(today0, outOffset);
  return { id, code, hotelId, roomId, checkIn, checkOut, guests, status, total: total(roomId, checkIn, checkOut), customer: me };
};

const MOCK = [
  mk("b1", "BK7QX2LM", "h1", "r2", 5, 8, 2, "confirmed"),
  mk("b2", "BK3ZP9DA", "h5", "r15", 1, 2, 2, "pending"),
  mk("b3", "BK8KT5HC", "h2", "r5", -1, 1, 2, "checked_in"),
  mk("b4", "BK2WM6RB", "h3", "r9", -10, -7, 2, "checked_out"),
  { ...mk("b5", "BK5NC4VT", "h4", "r13", -3, -1, 2, "cancelled"), cancelReason: "Thay đổi kế hoạch", refund: 650000 },
];

// ---------- UI nhỏ ----------
function Modal({ title, onClose, busy = false, size = "lg", children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose, busy]);

  return (
    <>
      <div className="modal fade show d-block" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
        <div className={`modal-dialog modal-${size} modal-dialog-centered modal-dialog-scrollable`}>
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={busy} aria-label="Đóng" />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}

function CodeBadge({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* trình duyệt không cho phép clipboard */
    }
  };
  return (
    <button type="button" className="btn btn-sm btn-light border font-monospace d-inline-flex align-items-center gap-1" onClick={copy} title="Sao chép mã">
      {code} {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  );
}

const StatusBadge = ({ status }) => (
  <span className={`badge rounded-pill text-bg-${STATUS[status]?.cls ?? "secondary"}`}>{STATUS[status]?.label ?? status}</span>
);

function Timeline({ status }) {
  const cur = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="d-flex justify-content-between position-relative my-3">
      {STEPS.map((s, i) => {
        const done = i <= cur;
        return (
          <div key={s.key} className="text-center flex-fill position-relative">
            {i > 0 && (
              <div className="position-absolute" style={{ top: 13, left: "-50%", width: "100%", height: 2, background: i <= cur ? "var(--bs-primary)" : "var(--bs-border-color)" }} />
            )}
            <div
              className={`position-relative rounded-circle d-inline-flex align-items-center justify-content-center ${done ? "bg-primary text-white" : "bg-body-secondary text-muted"}`}
              style={{ width: 28, height: 28 }}
            >
              {done ? <Check size={15} /> : i + 1}
            </div>
            <div className={`small mt-1 ${done ? "fw-medium" : "text-muted"}`}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================ Thẻ booking ============================ */

function BookingCard({ booking, today, onDetail, onCancel }) {
  const hotel = hotelOf(booking.hotelId);
  const room = roomOf(booking.roomId);
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const policy = getCancelPolicy(booking, today);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 bg-primary-subtle text-primary p-3"><Building2 size={24} /></div>
            <div>
              <h6 className="fw-semibold mb-1">{booking?.rooms[0].hotelName ?? "Khách sạn"}</h6>
              <div className="small text-muted d-flex align-items-center gap-1"><MapPin size={13} /> {hotel?.city}</div>
            </div>
          </div>
          <div className="text-end">
            <StatusBadge status={booking.status} />
            <div className="mt-1"><CodeBadge code={booking.code} /></div>
          </div>
        </div>

        <div className="row g-2 small">
          <div className="col-12 col-md-4 d-flex align-items-center gap-2">
            <CalendarDays size={15} className="text-muted" /> {fmtDate(booking.checkIn)} → {fmtDate(booking.checkOut)} ({nights} đêm)
          </div>
          <div className="col-6 col-md-4 d-flex align-items-center gap-2">
            <BedDouble size={15} className="text-muted" /> {roomTypeLabel(room?.type)} • Phòng {room?.roomNumber}
          </div>
          <div className="col-6 col-md-4 d-flex align-items-center gap-2">
            <Users size={15} className="text-muted" /> {booking.guests} khách
          </div>
        </div>
      </div>

      <div className="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <span className="text-muted small">Tổng tiền </span>
          <span className="fw-semibold">{formatVND(booking.totalAmount)}</span>
        </div>
        <div className="d-flex gap-2">
          {policy.canCancel && (
            <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => onCancel(booking)}>
              <XCircle size={15} /> Hủy
            </button>
          )}
          <button className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={() => onDetail(booking)}>
            <Receipt size={15} /> Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Modal chi tiết ============================ */

function DetailModal({ booking, today, onClose, onCancel }) {
    console.log("DetailModal: booking:", booking, "today:", today);
  const hotel = hotelOf(booking.hotelId);
  const room = roomOf(booking.roomId);
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const policy = getCancelPolicy(booking, today);

  return (
    <Modal
      title={`Booking ${booking.code}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>Đóng</button>
          {policy.canCancel && (
            <button className="btn btn-outline-danger d-flex align-items-center gap-1" onClick={() => onCancel(booking)}>
              <XCircle size={16} /> Hủy booking
            </button>
          )}
        </>
      }
    >
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div>
          <h5 className="fw-semibold mb-1">{booking?.rooms[0].name}</h5>
          <div className="text-muted small d-flex align-items-center gap-1"><MapPin size={14} /> {booking?.rooms[0].hotelName}</div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {booking.status === "cancelled" ? (
        <div className="alert alert-danger mt-3 small">
          Booking đã hủy{booking.cancelReason ? ` • Lý do: ${booking.cancelReason}` : ""}.
          {booking.refund != null && <> Số tiền hoàn lại: <strong>{formatVND(booking.refund)}</strong>.</>}
        </div>
      ) : (
        <Timeline status={booking.status} />
      )}

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className="border rounded-3 p-3 h-100">
            <div className="fw-medium mb-2">Thông tin lưu trú</div>
            <div className="small d-flex justify-content-between"><span className="text-muted">Nhận phòng</span><span>{fmtDate(booking.checkIn)}</span></div>
            <div className="small d-flex justify-content-between"><span className="text-muted">Trả phòng</span><span>{fmtDate(booking.checkOut)}</span></div>
            <div className="small d-flex justify-content-between"><span className="text-muted">Phòng</span><span>{roomTypeLabel(booking?.rooms[0]?.type)} {booking?.rooms[0]?.roomNumber}</span></div>
            <div className="small d-flex justify-content-between"><span className="text-muted">Số khách</span><span>{booking.guests}</span></div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="border rounded-3 p-3 h-100">
            <div className="fw-medium mb-2">Người đặt</div>
            <div className="small">{booking.user?.fullName}</div>
            <div className="small text-muted">{booking.user?.phone}</div>
            <div className="small text-muted">{booking.user?.email}</div>
            {booking.user?.note && <div className="small mt-2"><span className="text-muted">Ghi chú:</span> {booking.user.note}</div>}
          </div>
        </div>
        <div className="col-12">
          <div className="border rounded-3 p-3 bg-body-tertiary">
            <div className="small d-flex justify-content-between"><span>{formatVND(booking?.rooms[0]?.amount ?? 0)} × {booking?.rooms[0]?.numberOfNights} đêm</span><span>{formatVND(booking.totalAmount)}</span></div>
            <div className="d-flex justify-content-between fw-semibold fs-5 mt-1"><span>Tổng cộng</span><span className="text-primary">{formatVND(booking.totalAmount)}</span></div>
          </div>
        </div>
      </div>

      {["pending", "confirmed"].includes(booking.status) && (
        <div className={`alert ${policy.canCancel ? "alert-info" : "alert-warning"} small mt-3 mb-0 d-flex gap-2`}>
          <Info size={16} className="flex-shrink-0 mt-1" />
          <div>{policy.canCancel ? policy.note : policy.reason}</div>
        </div>
      )}
    </Modal>
  );
}

/* ============================ Modal hủy ============================ */

function CancelModal({ booking, today, onConfirm, onClose }) {
  const hotel = hotelOf(booking.hotelId);
  const policy = getCancelPolicy(booking, today);
  const refund = Math.round(booking.totalAmount * (policy.refundRate ?? 0));
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm(booking, { reason, refund });
    } catch (err) {
      setError(err?.message || "Không thể hủy booking, vui lòng thử lại");
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Hủy booking"
      size="md"
      busy={busy}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose} disabled={busy}>Giữ booking</button>
          <button className="btn btn-danger d-flex align-items-center gap-1" onClick={confirm} disabled={busy || !policy.canCancel}>
            {busy && <Loader2 size={16} style={{ animation: "mb-spin 1s linear infinite" }} />} Xác nhận hủy
          </button>
        </>
      }
    >
      <p className="mb-2">
        Bạn muốn hủy booking <strong>{booking.code}</strong> tại <strong>{hotel?.name}</strong> ({fmtDate(booking.checkIn)} → {fmtDate(booking.checkOut)})?
      </p>

      {error && <div className="alert alert-danger py-2 small d-flex align-items-center gap-2"><AlertCircle size={16} /> {error}</div>}

      <label className="form-label fw-medium mb-1">Lý do hủy</label>
      <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)} disabled={busy}>
        {CANCEL_REASONS.map((r) => <option key={r}>{r}</option>)}
      </select>

      <div className="border rounded-3 p-3 bg-body-tertiary small">
        <div className="d-flex justify-content-between"><span>Tổng tiền booking</span><span>{formatVND(booking.totalAmount)}</span></div>
        <div className="text-muted mb-2">{policy.canCancel ? policy.note : policy.reason}</div>
        <div className="d-flex justify-content-between fw-semibold">
          <span>Số tiền hoàn lại (nếu đã thanh toán)</span>
          <span className="text-success">{formatVND(refund)}</span>
        </div>
      </div>
      <style>{`@keyframes mb-spin{to{transform:rotate(360deg)}}`}</style>
    </Modal>
  );
}

/* ============================ Trang chính ============================ */

export default function MyBookings() {
  const today = toISODate(new Date());
  const [bookings, setBookings] = useState(MOCK);
  const [tab, setTab] = useState("upcoming");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [toast, setToast] = useState("");

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, bookings.filter(t.match).length])), [bookings]);


    const loadBookings = async () => {
            const response = await getMyBookings();
            setBookings(response.data);
        }

        useEffect(() => {
            loadBookings();
        }, []);
  const list = useMemo(() => {
    const current = TABS.find((t) => t.key === tab);
    const q = query.trim().toLowerCase();
    console.log(current.match, "tab:", tab, "query:", query);
    const filtered = bookings.filter(current.match).filter((b) => !q || b.code.toLowerCase().includes(q));
    // Sắp tới: ngày nhận phòng gần nhất trước; các tab còn lại: mới nhất trước
    console.log("MyBookings: filtered:", filtered, "tab:", tab, "query:", query);
    return [...filtered].sort((a, b) => (tab === "upcoming" ? a.checkIn.localeCompare(b.checkIn) : b.checkIn.localeCompare(a.checkIn)));
  }, [bookings, tab, query]);

  console.log("MyBookings: bookings:", bookings, "tab:", tab, "query:", query, "list:", list);

  // Thay bằng API: await api.post(`/bookings/${id}/cancel`, { reason }) -> server tính hoàn tiền theo giờ server
  const handleCancel = async (booking, { reason, refund }) => {
    await new Promise((r) => setTimeout(r, 700));
    const policy = getCancelPolicy(booking, toISODate(new Date()));
    if (!policy.canCancel) throw new Error(policy.reason || "Booking này không thể hủy");
    setBookings((l) => l.map((b) => (b.id === booking.id ? { ...b, status: "cancelled", cancelReason: reason, refund } : b)));
    setCancelTarget(null);
    setDetail(null);
    setToast(`Đã hủy booking ${booking.code}`);
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="bg-body-tertiary min-vh-100 py-4">
      <div className="container" style={{ maxWidth: 920 }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div>
            <h4 className="fw-semibold mb-1">Booking của tôi</h4>
            <div className="text-muted small">Xem, theo dõi và hủy các đặt phòng của bạn</div>
          </div>
          <div className="input-group" style={{ width: 260 }}>
            <span className="input-group-text bg-white"><Search size={16} /></span>
            <input className="form-control" placeholder="Tìm theo mã đặt phòng" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <ul className="nav nav-pills gap-2 mb-4">
          {TABS.map((t) => (
            <li className="nav-item" key={t.key}>
              <button className={`nav-link ${tab === t.key ? "active" : "bg-white border"}`} onClick={() => setTab(t.key)}>
                {t.label} <span className={`badge ${tab === t.key ? "text-bg-light" : "text-bg-secondary"} ms-1`}>{counts[t.key]}</span>
              </button>
            </li>
          ))}
        </ul>

        {list.length === 0 ? (
          <div className="card border-0 shadow-sm text-center text-muted py-5">
            <Receipt size={40} className="mx-auto mb-2 opacity-50" />
            {query ? "Không tìm thấy booking với mã này" : "Chưa có booking nào trong mục này"}
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {list.map((b) => (
              <BookingCard key={b.id} booking={b} today={today} onDetail={setDetail} onCancel={setCancelTarget} />
            ))}
          </div>
        )}
      </div>

      {detail && !cancelTarget && (
        <DetailModal booking={bookings.find((b) => b.id === detail.id) ?? detail} today={today} onClose={() => setDetail(null)} onCancel={setCancelTarget} />
      )}
      {cancelTarget && (
        <CancelModal booking={cancelTarget} today={today} onConfirm={handleCancel} onClose={() => setCancelTarget(null)} />
      )}

      {toast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
          <div className="toast show align-items-center text-bg-success border-0">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2"><CircleCheck size={16} /> {toast}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast("")} aria-label="Đóng" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}