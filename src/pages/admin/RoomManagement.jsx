import { useEffect, useMemo, useState } from "react";
import { Building2, BedDouble, DoorOpen, DoorClosed, Wrench } from "lucide-react";
import { createRoom, getAllRooms, updateRoom } from "../../api/roomsApi";
import DataTable from "./common/DataTable";
import { getAllHotels } from "../../api/HotelsApi";

/**
 * Quan he: 1 Hotel (hotels) -> N Room (rooms), room.hotelId tro toi hotel.id
 * - Chon khach san o thanh loc tren cung de xem phong cua khach san do (hoac "Tat ca")
 * - Them phong: tu dong gan hotelId = khach san dang chon
 * - So phong (roomNumber) la duy nhat TRONG moi khach san
 * - Khong cho doi khach san cua phong khi sua (readOnlyOnEdit)
 */

// ---------- Hang so ----------
const ROOM_TYPES = [
  { value: "single", label: "Phòng đơn" },
  { value: "double", label: "Phòng đôi" },
  { value: "twin", label: "Phòng 2 giường" },
  { value: "family", label: "Phòng gia đình" },
  { value: "suite", label: "Suite" },
];

const ROOM_STATUS = {
  available: { label: "Còn trống", cls: "success" },
  occupied: { label: "Đang ở", cls: "primary" },
  cleaning: { label: "Đang dọn", cls: "warning" },
  maintenance: { label: "Bảo trì", cls: "danger" },
};

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const labelOf = (list, value) => list.find((i) => i.value === value)?.label ?? value;

// ---------- Du lieu mau (thay bang API) ----------
const MOCK_HOTELS = [
  { id: "h1", name: "Sunrise Palace", city: "Hồ Chí Minh" },
  { id: "h2", name: "Ocean View", city: "Đà Nẵng" },
  { id: "h3", name: "Mountain Retreat", city: "Đà Lạt" },
];

const MOCK_ROOMS = [
  { id: "r1", hotelId: "h1", roomNumber: "101", type: "single", floor: 1, capacity: 1, pricePerNight: 650000, status: "available", description: "Hướng phố" },
  { id: "r2", hotelId: "h1", roomNumber: "102", type: "double", floor: 1, capacity: 2, pricePerNight: 900000, status: "occupied", description: "" },
  { id: "r3", hotelId: "h1", roomNumber: "201", type: "suite", floor: 2, capacity: 4, pricePerNight: 2500000, status: "cleaning", description: "Có bồn tắm" },
  { id: "r4", hotelId: "h2", roomNumber: "101", type: "family", floor: 1, capacity: 5, pricePerNight: 1800000, status: "available", description: "Hướng biển" },
  { id: "r5", hotelId: "h2", roomNumber: "302", type: "double", floor: 3, capacity: 2, pricePerNight: 1100000, status: "maintenance", description: "" },
];

export default function RoomManagement() {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [hotels, setHotels] = useState(MOCK_HOTELS);
  const [hotelId, setHotelId] = useState(""); // "" = tat ca khach san
  const [loading] = useState(false);

  const hotelMap = useMemo(() => Object.fromEntries(hotels.map((h) => [h.id, h])), [hotels]);
  const selectedHotel = hotelMap[hotelId];

  // Chi lay phong thuoc khach san dang chon
  const visibleRooms = useMemo(
    () => (hotelId ? rooms.filter((r) => r.hotelId === hotelId) : rooms),
    [rooms, hotelId]
  );

  // Thong ke theo pham vi dang xem
  const stats = useMemo(() => {
    const count = (s) => visibleRooms.filter((r) => r.status === s).length;
    return {
      total: visibleRooms.length,
      available: count("available"),
      occupied: count("occupied"),
      maintenance: count("maintenance"),
    };
  }, [visibleRooms]);

  // Dem so phong cua tung khach san cho dropdown
  const roomCountByHotel = useMemo(() => {
    const m = {};
    rooms.forEach((r) => (m[r.hotelId] = (m[r.hotelId] || 0) + 1));
    return m;
  }, [rooms]);

  // ---------- Cot bang ----------
  const columns = useMemo(() => {
    const cols = [
      { key: "roomNumber", label: "Số phòng", width: 110, render: (v) => <span className="fw-semibold">{v}</span> },
    ];
    // Khi xem tat ca khach san thi hien them cot khach san
    if (!hotelId) {
      cols.push({
        key: "hotelName",
        label: "Khách sạn",
        accessor: (r) => hotelMap[r.hotelId]?.name ?? "—",
      });
    }
    cols.push(
      { key: "type", label: "Loại phòng", accessor: (r) => labelOf(ROOM_TYPES, r.type) },
      { key: "floor", label: "Tầng", align: "center", width: 90 },
      { key: "capacity", label: "Sức chứa", align: "center", width: 110, render: (v) => `${v} người` },
      { key: "price", label: "Giá/đêm", align: "end", render: (v) => formatVND(v) },
      {
        key: "status",
        label: "Trạng thái",
        align: "center",
        render: (v) => {
          const s = ROOM_STATUS[v] || { label: v, cls: "secondary" };
          return <span className={`badge rounded-pill text-bg-${s.cls}`}>{s.label}</span>;
        },
      }
    );
    return cols;
  }, [hotelId, hotelMap]);

  // ---------- Form fields ----------
  const fields = useMemo(
    () => [
      { name: "id", label: "ID", hiddenIn: ["create", "edit", "view"] }, // giu id de validate trung so phong
      {
        name: "hotelId",
        label: "Khách sạn",
        type: "select",
        required: true,
        readOnlyOnEdit: true,
        defaultValue: hotelId, // tu dong gan theo khach san dang chon
        options: hotels.map((h) => ({ value: h.id, label: `${h.name} - ${h.city}` })),
      },
      {
        name: "roomNumber",
        label: "Số phòng",
        required: true,
        placeholder: "VD: 101",
        validate: (value, values) => {
          const dup = rooms.some(
            (r) =>
              r.hotelId === values.hotelId &&
              r.id !== values.id &&
              r.roomNumber.trim().toLowerCase() === String(value).trim().toLowerCase()
          );
          return dup ? "Số phòng đã tồn tại trong khách sạn này" : undefined;
        },
      },
      { name: "type", label: "Loại phòng", type: "select", required: true, options: ROOM_TYPES },
      { name: "name", label: "Tên phòng", type: "text" },
      { name: "floor", label: "Tầng", type: "number", required: true, min: 0, max: 100 },
      { name: "capacity", label: "Sức chứa (người)", type: "number", required: true, min: 1, max: 20 },
      { name: "price", label: "Giá mỗi đêm (VND)", type: "number", required: true, min: 0 },
      {
        name: "status",
        label: "Trạng thái",
        type: "select",
        required: true,
        defaultValue: "available",
        options: Object.entries(ROOM_STATUS).map(([value, { label }]) => ({ value, label })),
      },
      { name: "description", label: "Mô tả", type: "textarea" },
    ],
    [hotels, rooms, hotelId]
  );

      const loads = async () => {
          const data = await getAllRooms();
          setRooms(data);
      }
      

      const loadHotels = async () => {
      try {
        const data = await getAllHotels();
        setHotels(data);
      } catch (error) {
        console.error("Lỗi tải khách sạn:", error);
      }
    }

        useEffect(() => {
        loads();
        loadHotels();
        }, []);

  // ---------- CRUD (thay bang goi API that) ----------
  const handleCreate = async (values) => {
    // await api.post("/rooms", values)
    console.log("Creating room:", values);
    const result = await createRoom(values.hotelId ,values);
        const newRoom = result;
        if (!newRoom) {
        throw new Error("API không trả về thông tin phòng.");
        }
        loads();
    setRooms((list) => [{ ...values, id: `r${Date.now()}` }, ...list]);
  };

  const handleUpdate = async (values, row) => {
    console.log("Updating room:", values, "Row:", row);
    const result = await updateRoom(values.hotelId, values.id, values);
        const newRoom = result;
        console.log("API response:", result);
        if (!newRoom) {
        throw new Error("API không trả về thông tin phòng.");
        }
    setRooms((list) => list.map((r) => (r.id === row.id ? { ...r, ...values, id: row.id } : r)));
  };

  const handleDelete = async (row) => {
    if (row.status === "occupied") {
      throw new Error("Không thể xóa phòng đang có khách ở");
    }
    // await api.delete(`/rooms/${row.id}`)
    setRooms((list) => list.filter((r) => r.id !== row.id));
  };

  const StatCard = ({ icon: Icon, label, value, tone }) => (
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div className={`rounded-3 p-3 bg-${tone}-subtle text-${tone}`}>
            <Icon size={22} />
          </div>
          <div>
            <div className="text-muted small">{label}</div>
            <div className="fs-4 fw-semibold lh-1">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* Bo loc khach san */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-semibold mb-1">Quản lý phòng</h4>
          <div className="text-muted small">
            {selectedHotel
              ? `${selectedHotel.name} • ${selectedHotel.city}`
              : "Tất cả khách sạn"}
          </div>
        </div>
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white">
            <Building2 size={16} />
          </span>
          <select className="form-select" value={hotelId} onChange={(e) => setHotelId(e.target.value)}>
            <option value="">Tất cả khách sạn ({rooms.length} phòng)</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({roomCountByHotel[h.id] || 0} phòng)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thong ke */}
      <div className="row g-3 mb-4">
        <StatCard icon={BedDouble} label="Tổng số phòng" value={stats.total} tone="primary" />
        <StatCard icon={DoorOpen} label="Còn trống" value={stats.available} tone="success" />
        <StatCard icon={DoorClosed} label="Đang ở" value={stats.occupied} tone="info" />
        <StatCard icon={Wrench} label="Bảo trì" value={stats.maintenance} tone="danger" />
      </div>

      {/* Bang dung chung */}
      <DataTable
        title="Danh sách phòng"
        entityName="phòng"
        columns={columns}
        fields={fields}
        data={visibleRooms}
        loading={loading}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        deleteLabel={(r) => `phòng ${r.roomNumber} (${hotelMap[r.hotelId]?.name ?? ""})`}
      />
    </div>
  );
}