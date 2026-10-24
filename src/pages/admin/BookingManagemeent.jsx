import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Clock, BedDouble, Wallet, CheckCircle2, LogIn, LogOut, XCircle } from "lucide-react";
import DataTable from "../DataTable";
import { getAllBookings } from "../../api/bookingsApi";
import { getAllHotels } from "../../api/HotelsApi";
import { getAllRooms } from "../../api/roomsApi";

/**
 * Quan he: Hotel 1-N Room 1-N Booking
 *  - Chon khach san -> danh sach phong loc theo khach san (field roomId dependsOn hotelId)
 *  - Khong cho dat trung phong trong cung khoang ngay (chi tinh booking dang hieu luc)
 *  - So khach <= suc chua phong
 *  - Vong doi trang thai: pending -> confirmed -> checked_in -> checked_out, co the cancelled truoc khi check-in
 *  - Tong tien = so dem x gia phong (tinh o handler; backend nen tinh lai)
 */

// ---------- Hang so ----------
const STATUS = {
  Pending: { label: "Chờ xác nhận", cls: "warning" },
  Confirmed: { label: "Đã xác nhận", cls: "primary" },
  CheckedIn: { label: "Đang ở", cls: "info" },
  CheckedOut: { label: "Đã trả phòng", cls: "secondary" },
  Cancelled: { label: "Đã hủy", cls: "danger" },
};
const ACTIVE = ["Pending", "Confirmed", "CheckedIn"]; // booking giu phong
const TRANSITIONS = {
  Pending: ["confirmed", "cancelled"],
  Confirmed: ["checked_in", "cancelled"],
  CheckedIn: ["checked_out"],
  CheckedOut: [],
  Cancelled: [],
};
const ROOM_TYPE = { single: "Phòng đơn", double: "Phòng đôi", twin: "Phòng 2 giường", family: "Phòng gia đình", suite: "Suite" };

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n || 0);

function parseDate(date) {
  if (!date) return null;

  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fmtDate(value) {
  const date = parseDate(value);

  if (!date) return "--";

  return date.toLocaleDateString("vi-VN");
}

function nightsBetween(checkIn, checkOut) {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);

  if (!start || !end) return 0;

  const startDate = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const endDate = Date.UTC(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  return Math.max(0, Math.round((endDate - startDate) / 86400000));
}
const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const genCode = () => `BK${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

// ---------- Du lieu mau (thay bang API) ----------
const MOCK_HOTELS = [
  { id: "h1", name: "Sunrise Palace", city: "Hồ Chí Minh" },
  { id: "h2", name: "Ocean View", city: "Đà Nẵng" },
  { id: "h3", name: "Mountain Retreat", city: "Đà Lạt" },
];
const MOCK_ROOMS = [
  { id: "r1", hotelId: "h1", roomNumber: "101", type: "single", capacity: 1, pricePerNight: 1200000 },
  { id: "r2", hotelId: "h1", roomNumber: "102", type: "double", capacity: 2, pricePerNight: 1800000 },
  { id: "r3", hotelId: "h1", roomNumber: "201", type: "suite", capacity: 4, pricePerNight: 3800000 },
  { id: "r5", hotelId: "h2", roomNumber: "101", type: "double", capacity: 2, pricePerNight: 1100000 },
  { id: "r7", hotelId: "h2", roomNumber: "301", type: "family", capacity: 5, pricePerNight: 2100000 },
  { id: "r9", hotelId: "h3", roomNumber: "A1", type: "double", capacity: 2, pricePerNight: 1400000 },
];
const t = todayISO();
const MOCK_BOOKINGS = [
  { id: "b1", code: "BK7QX2LM", hotelId: "h1", roomId: "r2", customerName: "Nguyễn Văn An", phone: "0901234567", email: "an@example.com", checkIn: addDays(t, 1), checkOut: addDays(t, 4), guests: 2, status: "Confirmed", total: 5400000, note: "Tầng cao" },
  { id: "b2", code: "BK3ZP9DA", hotelId: "h2", roomId: "r5", customerName: "Trần Thị Bình", phone: "0912345678", email: "binh@example.com", checkIn: addDays(t, 0), checkOut: addDays(t, 2), guests: 2, status: "CheckedIn", totalAmount: 2200000, note: "" },
  { id: "b3", code: "BK8KT5HC", hotelId: "h1", roomId: "r3", customerName: "Lê Hoàng Cường", phone: "0987654321", email: "cuong@example.com", checkIn: addDays(t, 5), checkOut: addDays(t, 7), guests: 3, status: "Pending", totalAmount: 7600000, note: "Cần giường phụ" },
  { id: "b4", code: "BK2WM6RB", hotelId: "h3", roomId: "r9", customerName: "Phạm Minh Dũng", phone: "0933445566", email: "dung@example.com", checkIn: addDays(t, -6), checkOut: addDays(t, -3), guests: 2, status: "CheckedOut", totalAmount: 4200000, note: "" },
];

export default function BookingManagement() {
  const [hotels, setHotels] = useState(MOCK_HOTELS);
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [bookings, setBookings] = useState([]);
  const [hotelFilter, setHotelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const hotelMap = useMemo(() => Object.fromEntries(hotels.map((h) => [h.id, h])), [hotels]);
  const roomMap = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r])), [rooms]);

  const loadHotels = async () => {
          const data = await getAllHotels();
          setHotels(data);
      }
      const loadRooms = async () => {
                const data = await getAllRooms();
                setRooms(data);
            }
            
  const loadBookings = async () => {
          const response = await getAllBookings();
          setBookings(response.data);
      }
  
      useEffect(() => {
      loadBookings();
      loadHotels()
      loadRooms()
    }, []);

    

  const visible = useMemo(
    () => bookings.filter((b) => (!hotelFilter || b.hotelId === hotelFilter) && (!statusFilter || b.status === statusFilter)),
    [bookings, hotelFilter, statusFilter]
  );


  const stats = useMemo(() => {
    const count = (s) => visible.filter((b) => b.status === s).length;
    const revenue = visible.filter((b) => ["confirmed", "checked_in", "checked_out"].includes(b.status)).reduce((s, b) => s + b.total, 0);
    return { pending: count("pending"), confirmed: count("confirmed"), checkedIn: count("checked_in"), revenue };
  }, [visible]);

  // Phong co dang bi booking khac giu trong khoang ngay nay khong
  const hasConflict = (roomId, checkIn, checkOut, ignoreId) =>
    bookings.some(
      (b) => b.id !== ignoreId && b.roomId === roomId && ACTIVE.includes(b.status) && b.checkIn < checkOut && b.checkOut > checkIn
    );

  const calcTotal = (roomId, checkIn, checkOut) => nightsBetween(checkIn, checkOut) * (roomMap[roomId]?.pricePerNight || 0);

  // Trang thai duoc phep chon trong form: trang thai hien tai + cac buoc tiep theo hop le
  const statusOptions = (values) => {
    console.log("statusOptions values:", values);
    const current = bookings.find((b) => b.id === values.id)?.status;
    const keys = current ? [current, ...TRANSITIONS[current]] : ["Pending", "confirmed"];
    console.log("statusOptions current:", current, "keys:", keys);
    return keys.map((k) => ({ value: k, label: STATUS[k].label }));
  };

  console.log("BookingManagement render: hotels:", hotels, "rooms:", rooms, "bookings:", bookings, "visible:", visible, "stats:", stats);

  // ---------- Cot bang ----------
  const columns = [
    { key: "code", label: "Mã đặt phòng", width: 130, render: (_, v) => <span className="fw-semibold font-monospace">{v.bookingCode}</span> },
    {
      key: "customerName",
      label: "Khách hàng",
      accessor: (r) => `${r.user.fullName} ${r.user.email}`,
      render: (_, r) => (
        <div>
          <div className="fw-medium">{r.user.fullName}</div>
          <div className="small text-muted">{r.user.email}</div>
        </div>
      ),
    },
    {
      key: "hotelId",
      label: "Khách sạn / Phòng",
      accessor: (r) => `${r.rooms[0]?.hotelName ?? ""} ${r.rooms[0]?.roomNumber ?? ""}`,
      render: (_, r) => (
        <div>
          <div>{r.rooms[0]?.hotelName ?? "—"}</div>
          <div className="small text-muted">
            Phòng {r.rooms[0]?.roomNumber ?? "—"} • {ROOM_TYPE[r.rooms[0]?.type] ?? ""}
          </div>
        </div>
      ),
    },
    {
      key: "checkIn",
      label: "Lưu trú",
      render: (v, r) => (
        <div>
          <div>{fmtDate(v)} → {fmtDate(r.checkOut)}</div>
          <div className="small text-muted">{nightsBetween(v, r.checkOut)} đêm • {r.guests || 2} khách</div>
        </div>
      ),
    },
    { key: "totalAmount", label: "Tổng tiền", align: "end", render: (v) => <span className="fw-medium">{formatVND(v)}</span> },
    {
      key: "status",
      label: "Trạng thái",
      align: "center",
      accessor: (r) => STATUS[r.status]?.label ?? r.status,
      render: (_, r) => <span className={`badge rounded-pill text-bg-${STATUS[r.status]?.cls ?? "secondary"}`}>{STATUS[r.status]?.label ?? r.status}</span>,
    },
  ];

  // ---------- Form ----------
  const fields = [
    { name: "id", label: "ID", hiddenIn: ["create", "edit", "view"] },
    { name: "code", label: "Mã đặt phòng", hiddenIn: ["create"], readOnlyOnEdit: true },
    {
      name: "hotelId",
      label: "Khách sạn",
      type: "select",
      required: true,
      readOnlyOnEdit: true,
      defaultValue: hotelFilter,
      options: hotels.map((h) => ({ value: h.id, label: `${h.name} - ${h.city}` })),
    },
    {
      name: "roomId",
      label: "Phòng",
      type: "select",
      required: true,
      dependsOn: "hotelId", // doi khach san -> tu xoa phong da chon
      options: (v) =>
        rooms
          .filter((r) => r.hotelId === v.hotelId)
          .map((r) => ({
            value: r.id,
            label: `${r.roomNumber} • ${ROOM_TYPE[r.type]} • ${r.capacity} khách • ${formatVND(r.pricePerNight)}/đêm`,
          })),
    },
    { name: "customerName", label: "Tên khách hàng", required: true },
    { name: "phone", label: "Số điện thoại", type: "tel", required: true, pattern: "^(0|\\+84)\\d{9,10}$", patternMessage: "Số điện thoại không hợp lệ" },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "guests",
      label: "Số khách",
      type: "number",
      required: true,
      min: 1,
      defaultValue: 1,
      validate: (v, values) => {
        const room = roomMap[values.roomId];
        if (room && Number(v) > room.capacity) return `Phòng chỉ chứa tối đa ${room.capacity} khách`;
      },
    },
    { name: "checkIn", label: "Ngày nhận phòng", type: "date", required: true },
    {
      name: "checkOut",
      label: "Ngày trả phòng",
      type: "date",
      required: true,
      validate: (v, values) => {
        if (!values.checkIn) return;
        if (v <= values.checkIn) return "Ngày trả phòng phải sau ngày nhận phòng";
        const current = bookings.find((b) => b.id === values.id)?.status;
        const holds = !current || ACTIVE.includes(current);
        if (holds && values.roomId && hasConflict(values.roomId, values.checkIn, v, values.id)) {
          return "Phòng đã có booking khác trong khoảng thời gian này";
        }
      },
    },
    { name: "status", label: "Trạng thái", type: "select", required: true, defaultValue: "pending", options: statusOptions },
    { name: "note", label: "Ghi chú", type: "textarea" },
  ];

  // ---------- CRUD (thay bang goi API that; backend PHAI kiem tra lai trung phong) ----------
  const handleCreate = async (values) => {
    if (hasConflict(values.roomId, values.checkIn, values.checkOut)) throw new Error("Phòng vừa được đặt trong khoảng thời gian này");
    const booking = {
      ...values,
      id: `b${Date.now()}`,
      code: genCode(),
      total: calcTotal(values.roomId, values.checkIn, values.checkOut),
    };
    setBookings((l) => [booking, ...l]);
  };

  const handleUpdate = async (values, row) => {
    if (!ACTIVE.includes(row.status)) throw new Error("Booking đã kết thúc, không thể chỉnh sửa");
    if (values.status !== row.status && !TRANSITIONS[row.status].includes(values.status)) {
      throw new Error(`Không thể chuyển từ "${STATUS[row.status].label}" sang "${STATUS[values.status].label}"`);
    }
    if (ACTIVE.includes(values.status) && hasConflict(values.roomId, values.checkIn, values.checkOut, row.id)) {
      throw new Error("Phòng đã có booking khác trong khoảng thời gian này");
    }
    const total = calcTotal(values.roomId, values.checkIn, values.checkOut);
    setBookings((l) => l.map((b) => (b.id === row.id ? { ...b, ...values, id: row.id, code: row.code, total } : b)));
  };

  const handleDelete = async (row) => {
    if (!["pending", "cancelled"].includes(row.status)) {
      throw new Error("Chỉ xóa được booking đang chờ hoặc đã hủy. Hãy hủy booking trước khi xóa");
    }
    setBookings((l) => l.filter((b) => b.id !== row.id));
  };

  // Doi trang thai nhanh bang nut tren dong
  const changeStatus = (row, status) => {
    if (status === "cancelled" && !window.confirm(`Hủy booking ${row.code}?`)) return;
    // API that: await api.patch(`/bookings/${row.id}/status`, { status })
    setBookings((l) => l.map((b) => (b.id === row.id ? { ...b, status } : b)));
  };

  const ACTION_BTN = {
    confirmed: { icon: CheckCircle2, title: "Xác nhận", cls: "btn-outline-success" },
    checked_in: { icon: LogIn, title: "Check-in", cls: "btn-outline-primary" },
    checked_out: { icon: LogOut, title: "Check-out", cls: "btn-outline-secondary" },
    cancelled: { icon: XCircle, title: "Hủy booking", cls: "btn-outline-warning" },
  };

  const rowActions = (row) => {
    TRANSITIONS[row.status].map((next) => {
      const { icon: Icon, title, cls } = ACTION_BTN[next];
      return (
        <button key={next} type="button" className={`btn ${cls}`} title={title} onClick={() => changeStatus(row, next)}>
          <Icon size={15} />
        </button>
      );
    });

  }

  const StatCard = ({ icon: Icon, label, value, tone }) => (
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div className={`rounded-3 p-3 bg-${tone}-subtle text-${tone}`}><Icon size={22} /></div>
          <div>
            <div className="text-muted small">{label}</div>
            <div className="fs-5 fw-semibold lh-1">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h4 className="fw-semibold mb-1">Quản lý đặt phòng</h4>
        <div className="text-muted small">Theo dõi, xác nhận và cập nhật trạng thái các booking</div>
      </div>

      <div className="row g-3 mb-4">
        <StatCard icon={Clock} label="Chờ xác nhận" value={stats.pending} tone="warning" />
        <StatCard icon={CalendarCheck} label="Đã xác nhận" value={stats.confirmed} tone="primary" />
        <StatCard icon={BedDouble} label="Đang ở" value={stats.checkedIn} tone="info" />
        <StatCard icon={Wallet} label="Doanh thu" value={formatVND(stats.revenue)} tone="success" />
      </div>

      <DataTable
        title="Danh sách booking"
        entityName="booking"
        columns={columns}
        fields={fields}
        data={visible}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        rowActions={rowActions}
        deleteLabel={(r) => `booking ${r.code} (${r.customerName})`}
        toolbarExtra={
          <>
            <select className="form-select" style={{ width: 180 }} value={hotelFilter} onChange={(e) => setHotelFilter(e.target.value)}>
              <option value="">Tất cả khách sạn</option>
              {hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Mọi trạng thái</option>
              {Object.entries(STATUS).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </>
        }
      />
    </div>
  );
}