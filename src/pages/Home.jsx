import { useEffect, useMemo, useState } from "react";
import {
  Search, MapPin, CalendarDays, Users, Star, Wifi, Waves, Coffee, Car, Dumbbell, Sparkles,
  SlidersHorizontal, BedDouble, CheckCircle2, ThumbsUp, Loader2, AlertCircle, Building2, RotateCcw,
} from "lucide-react";
import {
  AMENITIES, ROOM_TYPES, DEFAULT_FILTERS, MAX_PRICE,
  toISODate, addDays, nightsBetween, formatVND, roomTypeLabel,
  searchHotels, recommendHotels, getAvailableRooms,
} from "./HomeData";
import { getHotels, getRooms, getOccupiedRooms } from "../api/publicApi";
import { useFetch } from "./admin/hooks/UseApi";
import { createBookings } from "../api/bookingsApi";

// Cần import Bootstrap 5.3+ một lần ở main.jsx:  import "bootstrap/dist/css/bootstrap.min.css";

const AMENITY_ICON = { wifi: Wifi, pool: Waves, breakfast: Coffee, parking: Car, gym: Dumbbell, spa: Sparkles };
const amenityOptions = ["wifi", "pool", "breakfast", "parking", "gym"];
const GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)", "linear-gradient(135deg,#11998e,#38ef7d)",
  "linear-gradient(135deg,#f093fb,#f5576c)", "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#fa709a,#fee140)", "linear-gradient(135deg,#30cfd0,#330867)",
];
const VIEWED_KEY = "recentlyViewedHotels";

const loadViewed = () => {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_KEY)) || [];
  } catch {
    return [];
  }
};

/* ============================ UI nhỏ dùng chung ============================ */

function Cover({ hotel, height = 200 }) {
  const imageUrl =
    hotel.imageUrl ||
    hotel.image ||
    hotel.thumbnail ||
    hotel.gallery?.[0] ||
    "";

  return (
    <div
      className="w-100 overflow-hidden bg-light"
      style={{ height, minHeight: 130 }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={hotel.name}
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
          <span>Chưa có ảnh khách sạn</span>
        </div>
      )}
    </div>
  );
}

const Stars = ({ n }) => (
  <span className="d-inline-flex">
    {Array.from({ length: n }).map((_, i) => (
      <Star key={i} size={14} fill="currentColor" className="text-warning" />
    ))}
  </span>
);

const AmenityIcons = ({ list = amenityOptions, max = 5 }) => (
  <div className="d-flex flex-wrap gap-2 text-muted">
    {list.slice(0, max).map((a) => {
      const Icon = AMENITY_ICON[a] || Sparkles;
      return <span key={a} title={AMENITIES.find((x) => x.value === a)?.label}><Icon size={16} /></span>;
    })}
  </div>
);

function Modal({ title, onClose, size = "lg", busy = false, children, footer }) {
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

/* ============================ Thẻ khách sạn ============================ */

function HotelCard({ hotel, nights, onOpen, compact = false }) {
  const total = hotel.minPrice * nights;
  return (
    <div className={`card border-0 shadow-sm h-100 overflow-hidden ${compact ? "" : "flex-md-row"}`}>
      <div style={compact ? undefined : { minWidth: 260, maxWidth: 260 }} className={compact ? "" : "d-none d-md-block"}>
        <Cover hotel={hotel} height={compact ? 130 : "100%"} />
      </div>
      {!compact && (
        <div className="d-md-none"><Cover hotel={hotel} height={150} /></div>
      )}
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h6 className="fw-semibold mb-1">{hotel.name}</h6>
            <div className="small text-muted d-flex align-items-center gap-1 mb-1">
              <MapPin size={14} /> {hotel.city}
            </div>
            <Stars n={hotel.starRating} />
          </div>
          {/* <span className="badge text-bg-primary fs-6">{hotel.rating.toFixed(1)}</span> */}
        </div>

        {hotel.reasons?.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mt-2">
            {hotel.reasons.map((r) => (
              <span key={r} className="badge rounded-pill text-bg-success-subtle text-success-emphasis border border-success-subtle">{r}</span>
            ))}
          </div>
        )}

        {!compact && <p className="small text-muted mt-2 mb-2">{hotel.description}</p>}
        <div className="mt-2"><AmenityIcons list={hotel.amenities} /></div>

        <div className="mt-auto pt-3 d-flex justify-content-between align-items-end">
          <div className="small text-muted">
            Còn {hotel.availableRooms.length} loại phòng
            <div className="fw-semibold text-dark fs-6">từ {formatVND(hotel.minPrice)}<span className="small fw-normal text-muted">/đêm</span></div>
            {!compact && <div className="small">{nights} đêm: {formatVND(total)}</div>}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onOpen(hotel)}>Xem phòng</button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Modal chọn phòng ============================ */

function RoomsModal({ hotel, rooms, params, nights, onBook, onClose }) {
  console.log("RoomsModal", { hotel, rooms, params, nights });
  return (
    <Modal title={hotel.name} onClose={onClose} size="lg">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
        <Stars n={hotel.starRating} />
        <span className="text-muted small d-flex align-items-center gap-1"><MapPin size={14} /> {hotel.city}</span>
        <span className="badge text-bg-primary">{hotel.starRating.toFixed(1)} ({hotel.reviews} đánh giá)</span>
      </div>
      <p className="text-muted">{hotel.description}</p>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {amenityOptions.map((a) => {
          const Icon = AMENITY_ICON[a] || Sparkles;
          return (
            <span key={a} className="badge text-bg-light border d-inline-flex align-items-center gap-1 fw-normal">
              <Icon size={13} /> {AMENITIES.find((x) => x.value === a)?.label}
            </span>
          );
        })}
      </div>

      <div className="alert alert-light border small py-2">
        {params.checkIn} → {params.checkOut} • {nights} đêm • {params.guests} khách
      </div>

      {rooms.length === 0 ? (
        <div className="text-center text-muted py-4">Không còn phòng phù hợp trong khoảng ngày này.</div>
      ) : (
        <div className="list-group">
          {rooms.map((r) => (
            <div key={r.id} className="list-group-item d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 bg-primary-subtle text-primary p-3"><BedDouble size={22} /></div>
                <div>
                  <div className="fw-semibold">{roomTypeLabel(r.type)} <span className="text-muted fw-normal">• Phòng {r.roomNumber}</span></div>
                  <div className="small text-muted d-flex align-items-center gap-1"><Users size={13} /> Tối đa {r.capacity} khách</div>
                </div>
              </div>
              <div className="text-end">
                <div className="fw-semibold">{formatVND(r.price)}<span className="small fw-normal text-muted">/đêm</span></div>
                <div className="small text-muted mb-1">Tổng {formatVND(r.price * nights)}</div>
                <button className="btn btn-primary btn-sm" onClick={() => onBook(r)}>Đặt phòng</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ============================ Modal đặt phòng ============================ */

function BookingModal({ hotel, room, params, nights, onConfirm, onClose, onDone }) {
  const [values, setValues] = useState({ fullName: "", phone: "", email: "", note: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(null);

  const total = room.price * nights;
  const set = (k, v) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!values.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    if (!/^(0|\+84)\d{9,10}$/.test(values.phone.trim())) e.phone = "Số điện thoại không hợp lệ";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) e.email = "Email không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");
    try {
      const booking = await onConfirm({ room, hotel, params, nights, total, customer: values });
      console.log("Booking confirmed:", booking);
      setDone(booking.data);
    } catch (err) {
      setServerError(err?.message || "Không thể đặt phòng, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  console.log(done, "BookingModal done state");

  if (done) {
    return (
      <Modal title="Đặt phòng thành công" onClose={onDone} size="md"
        footer={<button className="btn btn-primary" onClick={onDone}>Hoàn tất</button>}>
        <div className="text-center py-3">
          <CheckCircle2 size={56} className="text-success mb-3" />
          <h5>Cảm ơn bạn, {values.fullName}!</h5>
          <p className="text-muted mb-1">Mã đặt phòng của bạn</p>
          <div className="display-6 fw-bold text-primary mb-3">{done.bookingCode}</div>
          <div className="small text-muted">
            {hotel.name} • {roomTypeLabel(room.type)} {room.roomNumber}<br />
            {params.checkIn} → {params.checkOut} ({nights} đêm) • {formatVND(total)}<br />
            Thông tin xác nhận sẽ được gửi tới {values.email}
          </div>
        </div>
      </Modal>
    );
  }

  const field = (name, label, props = {}) => (
    <div className={props.col || "col-12"}>
      <label className="form-label fw-medium mb-1">{label}</label>
      <input
        className={`form-control ${errors[name] ? "is-invalid" : ""}`}
        value={values[name]}
        onChange={(e) => set(name, e.target.value)}
        disabled={submitting}
        {...props.input}
      />
      {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
    </div>
  );

  return (
    <Modal title="Xác nhận đặt phòng" onClose={onClose} busy={submitting} size="lg"
      footer={
        <>
          <button className="btn btn-light" onClick={onClose} disabled={submitting}>Quay lại</button>
          <button type="submit" form="booking-form" className="btn btn-primary d-flex align-items-center gap-1" disabled={submitting}>
            {submitting && <Loader2 size={16} style={{ animation: "hp-spin 1s linear infinite" }} />} Xác nhận đặt phòng
          </button>
        </>
      }>
      <div className="row g-4">
        <form id="booking-form" className="col-md-7" onSubmit={submit} noValidate>
          {serverError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
              <AlertCircle size={16} /> {serverError}
            </div>
          )}
          <div className="row g-3">
            {field("fullName", "Họ và tên *", { input: { placeholder: "Nguyễn Văn A" } })}
            {field("phone", "Số điện thoại *", { col: "col-md-6", input: { type: "tel", placeholder: "09xxxxxxxx" } })}
            {field("email", "Email *", { col: "col-md-6", input: { type: "email", placeholder: "email@example.com" } })}
            <div className="col-12">
              <label className="form-label fw-medium mb-1">Yêu cầu đặc biệt</label>
              <textarea className="form-control" rows={3} value={values.note} onChange={(e) => set("note", e.target.value)} disabled={submitting} />
            </div>
          </div>
        </form>

        <div className="col-md-5">
          <div className="border rounded-3 p-3 bg-body-tertiary">
            <div className="fw-semibold">{hotel.name}</div>
            <div className="small text-muted mb-3">{roomTypeLabel(room.type)} • Phòng {room.roomNumber}</div>
            <div className="small d-flex justify-content-between"><span>Nhận phòng</span><strong>{params.checkIn}</strong></div>
            <div className="small d-flex justify-content-between"><span>Trả phòng</span><strong>{params.checkOut}</strong></div>
            <div className="small d-flex justify-content-between"><span>Số khách</span><strong>{params.guests}</strong></div>
            <hr />
            <div className="small d-flex justify-content-between"><span>{formatVND(room.price)} × {nights} đêm</span><span>{formatVND(total)}</span></div>
            <div className="d-flex justify-content-between fw-semibold fs-5 mt-2"><span>Tổng</span><span className="text-primary">{formatVND(total)}</span></div>
          </div>
        </div>
      </div>
      <style>{`@keyframes hp-spin{to{transform:rotate(360deg)}}`}</style>
    </Modal>
  );
}

/* ============================ Bộ lọc ============================ */

function FilterPanel({ filters, setFilters, onReset }) {
  const toggleAmenity = (a) =>
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Bộ lọc</span>
        <button className="btn btn-link btn-sm text-decoration-none p-0 d-flex align-items-center gap-1" onClick={onReset}>
          <RotateCcw size={14} /> Đặt lại
        </button>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <div className="fw-medium mb-2">Giá mỗi đêm</div>
          <div className="small text-muted mb-1">Từ: {formatVND(filters.minPrice)}</div>
          <input type="range" className="form-range" min={0} max={MAX_PRICE} step={100000} value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: Math.min(Number(e.target.value), f.maxPrice) }))} />
          <div className="small text-muted mb-1">Đến: {formatVND(filters.maxPrice)}</div>
          <input type="range" className="form-range" min={0} max={MAX_PRICE} step={100000} value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Math.max(Number(e.target.value), f.minPrice) }))} />
        </div>

        <div className="mb-4">
          <div className="fw-medium mb-2">Hạng sao</div>
          <div className="btn-group w-100">
            {[0, 3, 4, 5].map((s) => (
              <button key={s} type="button"
                className={`btn btn-sm ${filters.minStars === s ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilters((f) => ({ ...f, minStars: s }))}>
                {s === 0 ? "Tất cả" : `${s}★+`}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="fw-medium mb-2">Loại phòng</div>
          <select className="form-select form-select-sm" value={filters.roomType} onChange={(e) => setFilters((f) => ({ ...f, roomType: e.target.value }))}>
            <option value="">Tất cả loại phòng</option>
            {ROOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <div className="fw-medium mb-2">Tiện ích</div>
          {AMENITIES.map((a) => (
            <div className="form-check" key={a.value}>
              <input className="form-check-input" type="checkbox" id={`am-${a.value}`}
                checked={filters.amenities.includes(a.value)} onChange={() => toggleAmenity(a.value)} />
              <label className="form-check-label" htmlFor={`am-${a.value}`}>{a.label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================ Trang chính ============================ */

export default function HomePage() {
  const today = toISODate(new Date());

  // Dữ liệu (thay bằng API)
  const hotelsQ = useFetch(() => getHotels(), [], { initial: [] });
  const roomsQ = useFetch(() => getRooms(), [], { initial: [] });
  // Chỉ lấy các khoảng ngày đang bị giữ từ hôm nay trở đi (không có thông tin cá nhân của khách khác)
  const occupiedQ = useFetch(() => getOccupiedRooms(), [], { initial: [] });
  const hotels = hotelsQ.data;
  const rooms = roomsQ.data;
  const bookings = occupiedQ.data; // dùng cho isRoomAvailable() trong homeData
  const loading = hotelsQ.loading || roomsQ.loading || occupiedQ.loading;
  const loadError = hotelsQ.error || roomsQ.error || occupiedQ.error;
  const reloadAll = () => { hotelsQ.reload(); roomsQ.reload(); occupiedQ.reload(); };

  // Tìm kiếm: draft (đang nhập) -> params (đã áp dụng khi bấm Tìm)
  const [draft, setDraft] = useState({ keyword: "", checkIn: addDays(today, 1), checkOut: addDays(today, 2), guests: 2 });
  const [params, setParams] = useState(draft);
  const [formError, setFormError] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Chi tiết khách sạn / đặt phòng / lịch sử xem
  const [detailId, setDetailId] = useState(null);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [viewedIds, setViewedIds] = useState(loadViewed);

  const nights = Math.max(1, nightsBetween(params.checkIn, params.checkOut));
  const viewedHotels = useMemo(() => viewedIds.map((id) => hotels.find((h) => h.id === id)).filter(Boolean), [viewedIds, hotels]);

  const results = useMemo(
  () => searchHotels({ hotels, rooms, bookings, params, filters, viewed: viewedHotels }),
  [hotels, rooms, bookings, params, filters, viewedHotels]
);
  const recommended = useMemo(
    () => recommendHotels({ hotels, rooms, bookings, params, viewed: viewedHotels, limit: 4 }),
    [hotels, rooms, bookings, params, viewedHotels]
  );

  const detailHotel = hotels.find((h) => h.id === detailId);
  const detailRooms = useMemo(
    () => (detailId ? getAvailableRooms({ rooms, bookings, hotelId: detailId, params }) : []),
    [detailId, rooms, bookings, params]
  );


  const setDraftField = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v };
      if (k === "checkIn" && next.checkOut <= v) next.checkOut = addDays(v, 1); // tự đẩy ngày trả phòng
      return next;
    });

  const submitSearch = (e) => {
    e.preventDefault();
    if (draft.checkIn < today) return setFormError("Ngày nhận phòng không được ở quá khứ");
    if (nightsBetween(draft.checkIn, draft.checkOut) < 1) return setFormError("Ngày trả phòng phải sau ngày nhận phòng");
    setFormError("");
    setParams({ ...draft });
  };

  const openHotel = (h) => {
    setDetailId(h.id);
    const next = [h.id, ...viewedIds.filter((id) => id !== h.id)].slice(0, 5);
    setViewedIds(next);
    try { localStorage.setItem(VIEWED_KEY, JSON.stringify(next)); } catch { /* bỏ qua */ }
  };

  // Tạo booking qua API. Server kiểm tra lại phòng trống (trả 409 nếu trùng), tự tính tổng tiền và trả về { code, ... }.
  // Lỗi được ném ra và BookingModal hiển thị cho khách.
  const createBooking = async ({ room, hotel, params: p, customer }) => {
    const booking = await createBookings({
      hotelId: hotel.id,
      roomId: room.id,
      checkIn: p.checkIn,
      checkOut: p.checkOut,
      guests: p.guests,
      customer,
    });
    occupiedQ.reload(); // cập nhật lại phòng trống sau khi đặt
    return booking;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Loader2 size={32} className="text-primary" style={{ animation: "hp-spin 1s linear infinite" }} />
        <style>{`@keyframes hp-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="container py-5 text-center">
        <AlertCircle size={40} className="text-danger mb-2" />
        <p className="text-muted">{loadError.message}</p>
        <button className="btn btn-primary" onClick={reloadAll}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="bg-body-tertiary min-vh-100">
      {/* Hero + thanh tìm kiếm */}
      <header className="text-white py-5" style={{ background: "linear-gradient(135deg,#1e3c72,#2a5298)" }}>
        <div className="container">
          <h1 className="fw-bold mb-1">Tìm nơi nghỉ lý tưởng cho chuyến đi của bạn</h1>
          <p className="opacity-75 mb-4">Hàng trăm khách sạn, đặt phòng nhanh chóng và minh bạch giá.</p>

          <form className="card border-0 shadow p-3" onSubmit={submitSearch}>
            <div className="row g-2 align-items-end text-dark">
              <div className="col-lg-4">
                <label className="form-label small fw-medium mb-1">Điểm đến / khách sạn</label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><MapPin size={16} /></span>
                  <input className="form-control" placeholder="Thành phố hoặc tên khách sạn" value={draft.keyword}
                    onChange={(e) => setDraftField("keyword", e.target.value)} />
                </div>
              </div>
              <div className="col-6 col-lg-2">
                <label className="form-label small fw-medium mb-1">Nhận phòng</label>
                <div className="input-group">
                  <span className="input-group-text bg-white d-none d-xl-flex"><CalendarDays size={16} /></span>
                  <input type="date" className="form-control" min={today} value={draft.checkIn} onChange={(e) => setDraftField("checkIn", e.target.value)} />
                </div>
              </div>
              <div className="col-6 col-lg-2">
                <label className="form-label small fw-medium mb-1">Trả phòng</label>
                <input type="date" className="form-control" min={addDays(draft.checkIn, 1)} value={draft.checkOut} onChange={(e) => setDraftField("checkOut", e.target.value)} />
              </div>
              <div className="col-6 col-lg-2">
                <label className="form-label small fw-medium mb-1">Số khách</label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><Users size={16} /></span>
                  <select className="form-select" value={draft.guests} onChange={(e) => setDraftField("guests", Number(e.target.value))}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="col-6 col-lg-2 d-grid">
                <button className="btn btn-primary d-flex align-items-center justify-content-center gap-1" type="submit">
                  <Search size={16} /> Tìm kiếm
                </button>
              </div>
            </div>
            {formError && <div className="text-danger small mt-2 d-flex align-items-center gap-1"><AlertCircle size={14} /> {formError}</div>}
          </form>
        </div>
      </header>

      <main className="container py-4">
        {/* Gợi ý */}
        {recommended.length > 0 && (
          <section className="mb-5">
            <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3">
              <ThumbsUp size={20} className="text-primary" /> Gợi ý cho bạn
            </h5>
            <div className="row g-3">
              {recommended.map((h) => (
                <div key={h.id} className="col-12 col-sm-6 col-xl-3">
                  <HotelCard hotel={h} nights={nights} onOpen={openHotel} compact />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="row g-4">
          {/* Bộ lọc */}
          <aside className="col-lg-3">
            <button className="btn btn-outline-secondary w-100 d-lg-none mb-3 d-flex align-items-center justify-content-center gap-2" onClick={() => setShowFilters((s) => !s)}>
              <SlidersHorizontal size={16} /> {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </button>
            <div className={`${showFilters ? "" : "d-none"} d-lg-block`}>
              <FilterPanel filters={filters} setFilters={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
            </div>
          </aside>

          {/* Kết quả */}
          <section className="col-lg-9">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div>
                <h5 className="fw-semibold mb-0">{results.length} khách sạn phù hợp</h5>
                <small className="text-muted">{nights} đêm • {params.guests} khách • {params.checkIn} → {params.checkOut}</small>
              </div>
              <select className="form-select form-select-sm" style={{ width: 200 }} value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}>
                <option value="recommended">Đề xuất cho bạn</option>
                <option value="priceAsc">Giá thấp → cao</option>
                <option value="priceDesc">Giá cao → thấp</option>
                <option value="ratingDesc">Đánh giá cao nhất</option>
              </select>
            </div>

            {results.length === 0 ? (
              <div className="card border-0 shadow-sm text-center py-5 text-muted">
                <Search size={40} className="mb-2 opacity-50 mx-auto" />
                <div>Không có khách sạn phù hợp với tìm kiếm và bộ lọc hiện tại.</div>
                <div><button className="btn btn-link" onClick={() => setFilters(DEFAULT_FILTERS)}>Xóa bộ lọc</button></div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {results.map((h) => (
                  <HotelCard key={h.id} hotel={h} nights={nights} onOpen={openHotel} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Chọn phòng -> Đặt phòng (chỉ hiển thị 1 modal tại một thời điểm) */}
      {detailHotel && !bookingRoom && (
        <RoomsModal hotel={detailHotel} rooms={detailRooms} params={params} nights={nights}
          onBook={setBookingRoom} onClose={() => setDetailId(null)} />
      )}
      {detailHotel && bookingRoom && (
        <BookingModal hotel={detailHotel} room={bookingRoom} params={params} nights={nights}
          onConfirm={createBooking}
          onClose={() => setBookingRoom(null)}
          onDone={() => { setBookingRoom(null); setDetailId(null); }} />
      )}
    </div>
  );
}