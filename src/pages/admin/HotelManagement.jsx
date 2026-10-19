
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {createHotel, getAllHotels, updateHotel} from "../../api/HotelsApi";
// import {HotelModal} from "../../components/admin/HotelModal";
import {
    Hotel, Search, Plus, MapPin, BedDouble,
    Pencil, Trash2, Eye, X, ChevronLeft,
    ChevronRight, SlidersHorizontal, Star,
    ArrowLeft, ImagePlus
} from "lucide-react";
import DataTable from "./common/DataTable";

const initialHotels = [
    {
        id: 1,
        name: "Sweet Dalat Hotel",
        city: "Đà Lạt, Lâm Đồng",
        address: "10 Nguyễn Chí Thanh",
        price: 850000,
        rooms: 32,
        rating: 4.8,
        status: "Active",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
        description: "Khách sạn nghỉ dưỡng giữa trung tâm Đà Lạt."
    },
    {
        id: 2,
        name: "Ocean View Resort",
        city: "Nha Trang, Khánh Hòa",
        address: "25 Trần Phú",
        price: 1500000,
        rooms: 65,
        rating: 4.9,
        status: "Active",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500",
        description: "Khu nghỉ dưỡng hướng biển."
    },
    {
        id: 3,
        name: "Saigon Central Hotel",
        city: "TP. Hồ Chí Minh",
        address: "120 Nguyễn Huệ",
        price: 1200000,
        rooms: 48,
        rating: 4.5,
        status: "Pending",
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500",
        description: "Khách sạn hiện đại tại trung tâm thành phố."
    },
    {
        id: 4,
        name: "Mountain Retreat",
        city: "Đà Lạt, Lâm Đồng",
        address: "Đường Trần Hưng Đạo",
        price: 2100000,
        rooms: 24,
        rating: 4.7,
        status: "Inactive",
        image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=500",
        description: "Không gian nghỉ dưỡng yên tĩnh."
    }
];

const statusMap = {
  active: { label: "Hoạt động", cls: "success" },
  inactive: { label: "Tạm ngưng", cls: "secondary" },
};

const StatusBadge = ({ value }) => {
  const s = statusMap[value] || { label: value, cls: "light" };
  return <span className={`badge rounded-pill text-bg-${s.cls}`}>{s.label}</span>;
};

const fields = [
//   { name: "code", label: "Mã khách sạn", required: true, readOnlyOnEdit: true },
  { name: "name", label: "Tên khách sạn", required: true },
  { name: "city", label: "Thành phố", required: true },
  { name: "stars", label: "Hạng sao", type: "select", required: true, options: [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n} sao` })) },
  { name: "phone", label: "Điện thoại", type: "tel", pattern: "^[0-9+\\s-]{8,15}$", patternMessage: "Số điện thoại không hợp lệ" },
  { name: "email", label: "Email", type: "email" },
  { name: "status", label: "Trạng thái", type: "select", required: true, defaultValue: "active", options: Object.entries(statusMap).map(([value, { label }]) => ({ value, label })) },
  { name: "address", label: "Địa chỉ", type: "textarea" },
];

const columns = [
  { key: "code", label: "Mã", width: 110 },
  { key: "name", label: "Tên khách sạn", render: (v) => <span className="fw-medium">{v}</span> },
  { key: "city", label: "Thành phố" },
  { key: "stars", label: "Hạng sao", align: "center", render: (v) => "★".repeat(v) },
  { key: "phone", label: "Điện thoại", sortable: false },
  { key: "status", label: "Trạng thái", align: "center", render: (v) => <StatusBadge value={v} /> },
];

const emptyForm = {
    name: "",
    city: "",
    address: "",
    price: "",
    rooms: "",
    image: "",
    description: "",
    status: "Pending"
};

const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
    }).format(price || 0);

function HotelManagement() {
    const [hotels, setHotels] = useState(initialHotels);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const pageSize = 5;

    async function loadHotels() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllHotels();
        setHotels(data);
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi.");
      } finally {
        setLoading(false);
      }
    }
    useEffect(() => {

    loadHotels();
  }, []);

    const filteredHotels = useMemo(() => {
        const q = keyword.trim().toLowerCase();

        return hotels.filter((hotel) => {
            const matchesKeyword =
                hotel.name.toLowerCase().includes(q) ||
                hotel.city.toLowerCase().includes(q) ||
                hotel.address.toLowerCase().includes(q);

            const matchesStatus =
                statusFilter === "All" ||
                hotel.status === statusFilter;

            return matchesKeyword && matchesStatus;
        });
    }, [hotels, keyword, statusFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredHotels.length / pageSize)
    );

    const currentPage = Math.min(page, totalPages);

    const visibleHotels = filteredHotels.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const stats = {
        total: hotels.length,
        active: hotels.filter(h => h.status === "Active").length,
        pending: hotels.filter(h => h.status === "Pending").length,
        inactive: hotels.filter(h => h.status === "Inactive").length
    };

    const openCreate = () => {
        setEditingHotel(null);
        setForm(emptyForm);
        setError("");
        setShowModal(true);
    };

    const openEdit = (hotel) => {
        setEditingHotel(hotel);
        setForm({
            ...hotel,
            price: String(hotel.price),
            rooms: String(hotel.rooms)
        });
        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingHotel(null);
        setError("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreate = async (payload) => {
    
            try {
                const result = await createHotel(payload);
                const newHotel = result?.data;
                console.log("API response:", result);
                if (!newHotel) {
                throw new Error("API không trả về thông tin khách sạn.");
                }
                loadHotels();
                setMessage(result?.message || "Thêm khách sạn thành công!");
            } catch (error) {
                setMessage(error.message || "Không thể thêm khách sạn.");
            }
            setMessage("Đã cập nhật khách sạn.");
    };
    const handleUpdate = async (payload) => {
        console.log("Updating hotel with payload:", payload);
            try {
            const result = await updateHotel(payload.id, payload);
            const newHotel = result?.data;
            console.log("API response:", result);
            if (!newHotel) {
            throw new Error("API không trả về thông tin khách sạn.");
            }

            setHotels((prev) => [newHotel, ...prev]);
            setPage(1);
            setMessage(result?.message || "Cập nhật khách sạn thành công!");
        } catch (error) {
            setMessage(error.message || "Không thể cập nhật khách sạn.");
        }
    };

    const handleDelete = (hotel) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa "${hotel.name}" khỏi danh sách?`
        );

        if (!confirmed) return;

        setHotels(prev =>
            prev.filter(h => h.id !== hotel.id)
        );

        setSelectedHotel(null);
        setMessage("Đã xóa khách sạn khỏi danh sách.");
    };

    const changeStatus = (hotel, status) => {
        setHotels(prev =>
            prev.map(h =>
                h.id === hotel.id ? { ...h, status } : h
            )
        );

        setMessage("Đã cập nhật trạng thái khách sạn.");
    };

    const statusLabel = {
        Active: "Đang hoạt động",
        Pending: "Chờ duyệt",
        Inactive: "Tạm ngưng"
    };

    return (
        <div className="hm-page">
            <style>{`
                .hm-page {
                    min-height: 100vh;
                    background: #f5f7fb;
                    color: #172033;
                    font-size: 14px;
                }
                .hm-topbar {
                    height: 70px;
                    padding: 0 30px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    border-bottom: 1px solid #e9edf3;
                }
                .hm-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 19px;
                    font-weight: 800;
                    color: #2457df;
                    text-decoration: none;
                }
                .hm-brand-icon {
                    width: 36px;
                    height: 36px;
                    display: grid;
                    place-items: center;
                    border-radius: 10px;
                    background: #eaf0ff;
                }
                .hm-content {
                    max-width: 1600px;
                    margin: auto;
                    padding: 28px 30px;
                }
                .hm-muted { color: #7b8497; }
                .hm-title {
                    font-size: 27px;
                    font-weight: 800;
                    letter-spacing: -.7px;
                }
                .hm-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    border: 0;
                    border-radius: 9px;
                    padding: 11px 16px;
                    background: #2457df;
                    color: white;
                    font-weight: 650;
                }
                .hm-btn-primary:hover { background: #1746c4; }
                .hm-stat {
                    background: white;
                    border: 1px solid #e9edf3;
                    border-radius: 14px;
                    padding: 19px;
                    height: 100%;
                }
                .hm-stat-label { color: #7b8497; font-size: 13px; }
                .hm-stat-number { font-size: 27px; font-weight: 800; margin-top: 8px; }
                .hm-stat-icon {
                    display: grid;
                    place-items: center;
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: #edf2ff;
                    color: #2457df;
                }
                .hm-panel {
                    background: white;
                    border: 1px solid #e9edf3;
                    border-radius: 14px;
                    overflow: hidden;
                }
                .hm-toolbar {
                    padding: 18px 20px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    align-items: center;
                    justify-content: space-between;
                }
                .hm-search {
                    position: relative;
                    flex: 1;
                    min-width: 220px;
                    max-width: 420px;
                }
                .hm-search svg {
                    position: absolute;
                    left: 13px;
                    top: 12px;
                    color: #8992a4;
                }
                .hm-search input {
                    width: 100%;
                    padding: 10px 12px 10px 40px;
                    border: 1px solid #e0e5ed;
                    border-radius: 9px;
                    outline: none;
                }
                .hm-search input:focus, .hm-form-control:focus {
                    border-color: #7ea0ff;
                    box-shadow: 0 0 0 3px #2457df16;
                }
                .hm-select {
                    padding: 10px 12px;
                    border: 1px solid #e0e5ed;
                    border-radius: 9px;
                    background: white;
                }
                .hm-table { min-width: 920px; margin: 0; }
                .hm-table thead th {
                    background: #f9fafc;
                    color: #818b9e;
                    font-size: 10px;
                    letter-spacing: .6px;
                    font-weight: 800;
                    padding: 14px 17px;
                    border-bottom: 1px solid #e9edf3;
                    white-space: nowrap;
                }
                .hm-table tbody td {
                    padding: 15px 17px;
                    border-bottom: 1px solid #f0f2f6;
                    vertical-align: middle;
                }
                .hm-table tbody tr:hover { background: #fafbff; }
                .hm-hotel-cell { display: flex; align-items: center; gap: 12px; }
                .hm-hotel-img {
                    width: 76px;
                    height: 58px;
                    object-fit: cover;
                    border-radius: 9px;
                    background: #edf0f5;
                }
                .hm-hotel-name { font-weight: 750; color: #202a3d; }
                .hm-badge {
                    display: inline-block;
                    padding: 6px 9px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    white-space: nowrap;
                }
                .hm-active { background: #e5f8ef; color: #168354; }
                .hm-pending { background: #fff3d8; color: #a56b00; }
                .hm-inactive { background: #eef0f4; color: #687184; }
                .hm-icon-btn {
                    border: 1px solid #e5e9f0;
                    background: white;
                    color: #677286;
                    border-radius: 8px;
                    padding: 7px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .hm-icon-btn:hover { color: #2457df; background: #f0f4ff; }
                .hm-icon-btn.danger:hover { color: #dc3545; background: #fff1f2; }
                .hm-pagination {
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .hm-page-btn {
                    border: 1px solid #e1e6ee;
                    border-radius: 7px;
                    background: white;
                    padding: 7px 10px;
                    min-width: 35px;
                    margin-left: 4px;
                }
                .hm-page-btn.active { background: #2457df; color: white; border-color: #2457df; }
                .hm-page-btn:disabled { opacity: .4; cursor: not-allowed; }
                .hm-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 1050;
                    background: #11182780;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    overflow-y: auto;
                }
                .hm-modal {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 650px;
                    max-height: calc(100vh - 32px);
                    overflow-y: auto;
                    box-shadow: 0 25px 80px #0002;
                }
                .hm-modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #edf0f5;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .hm-modal-body { padding: 24px; }
                .hm-form-control {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #dfe4ed;
                    border-radius: 8px;
                    outline: none;
                    background: white;
                }
                .hm-label { display: block; font-weight: 650; margin-bottom: 7px; }
                .hm-detail-image {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    border-radius: 12px;
                    margin-bottom: 18px;
                }
                @media(max-width: 767px) {
                    .hm-topbar { padding: 0 16px; }
                    .hm-content { padding: 22px 14px; }
                    .hm-title { font-size: 23px; }
                    .hm-toolbar { padding: 15px; }
                    .hm-search { max-width: none; width: 100%; }
                }
            `}</style>

            <header className="hm-topbar">
                <Link to="/admin" className="hm-brand">
                    <span className="hm-brand-icon">
                        <Hotel size={21} />
                    </span>
                    Booking Sweet
                </Link>

                <Link to="/admin" className="btn btn-light btn-sm">
                    <ArrowLeft size={15} className="me-1" />
                    Dashboard
                </Link>
            </header>

            <main className="hm-content">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div>
                        <div className="hm-muted mb-2">
                            Dashboard / Quản lý
                        </div>
                        <h1 className="hm-title mb-2">
                            Quản lý khách sạn
                        </h1>
                        <p className="hm-muted mb-0">
                            Quản lý thông tin, trạng thái và danh sách cơ sở lưu trú.
                        </p>
                    </div>

                    <button className="hm-btn-primary" onClick={openCreate}>
                        <Plus size={18} />
                        Thêm khách sạn
                    </button>
                </div>

                {message && (
                    <div className="alert alert-success d-flex justify-content-between align-items-center">
                        <span>{message}</span>
                        <button className="btn-close" onClick={() => setMessage("")} />
                    </div>
                )}

                <div className="row g-3 mb-4">
                    {[
                        { label: "Tổng khách sạn", value: stats.total, icon: Hotel },
                        { label: "Đang hoạt động", value: stats.active, icon: BedDouble },
                        { label: "Chờ duyệt", value: stats.pending, icon: SlidersHorizontal },
                        { label: "Tạm ngưng", value: stats.inactive, icon: X }
                    ].map(item => {
                        const Icon = item.icon;
                        return (
                            <div className="col-6 col-xl-3" key={item.label}>
                                <div className="hm-stat">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="hm-stat-label">{item.label}</div>
                                        <div className="hm-stat-icon">
                                            <Icon size={20} />
                                        </div>
                                    </div>
                                    <div className="hm-stat-number">{item.value}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <section className="hm-panel">
                    <div className="hm-toolbar">
                        <div>
                            <h5 className="fw-bold mb-1">Danh sách khách sạn</h5>
                            <div className="hm-muted small">
                                Tìm kiếm và quản lý các khách sạn trên hệ thống
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 flex-grow-1 justify-content-md-end">
                            <div className="hm-search">
                                <Search size={17} />
                                <input
                                    value={keyword}
                                    onChange={e => {
                                        setKeyword(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Tìm tên hoặc địa điểm..."
                                    aria-label="Tìm khách sạn"
                                />
                            </div>

                            <select
                                className="hm-select"
                                value={statusFilter}
                                onChange={e => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                aria-label="Lọc trạng thái"
                            >
                                <option value="All">Tất cả trạng thái</option>
                                <option value="Active">Đang hoạt động</option>
                                <option value="Pending">Chờ duyệt</option>
                                <option value="Inactive">Tạm ngưng</option>
                            </select>
                        </div>
                    </div>

                    <DataTable
                        title="Quản lý khách sạn"
                        subtitle="Danh sách khách sạn trong hệ thống"
                        entityName="khách sạn"
                        columns={columns}
                        fields={fields}
                        data={hotels}
                        onCreate={handleCreate}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        deleteLabel={(row) => row.name}
                    />


                    <div className="table-responsive">
                        <table className="table hm-table">
                            <thead>
                                <tr>
                                    <th>KHÁCH SẠN</th>
                                    <th>ĐỊA ĐIỂM</th>
                                    <th>SỐ PHÒNG</th>
                                    <th>GIÁ TỪ</th>
                                    <th>ĐÁNH GIÁ</th>
                                    <th>TRẠNG THÁI</th>
                                    <th className="text-end">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleHotels.map(hotel => (
                                    <tr key={hotel.id}>
                                        <td>
                                            <div className="hm-hotel-cell">
                                                <img
                                                    className="hm-hotel-img"
                                                    src={hotel.imageUrl}
                                                    alt={hotel.name}
                                                    onError={e => {
                                                        e.currentTarget.style.visibility = "hidden";
                                                    }}
                                                />
                                                <div>
                                                    <div className="hm-hotel-name">
                                                        {hotel.name}
                                                    </div>
                                                    <div className="hm-muted small mt-1">
                                                        ID: #{hotel.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2 align-items-start">
                                                <MapPin size={16} className="hm-muted mt-1" />
                                                <div>
                                                    <div>{hotel.city}</div>
                                                    <div className="hm-muted small">{hotel.address}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{hotel.rooms} phòng</td>
                                        <td className="fw-bold">{formatPrice(hotel.price)}</td>
                                        <td>
                                            <span className="d-flex gap-1 align-items-center">
                                                <Star size={15} fill="#f5b82e" color="#f5b82e" />
                                                {hotel.rating ? hotel.rating : "Chưa có"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`hm-badge ${
                                                hotel.status === "Active"
                                                    ? "hm-active"
                                                    : hotel.status === "Pending"
                                                    ? "hm-pending"
                                                    : "hm-inactive"
                                            }`}>
                                                {statusLabel[hotel.status]}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-end gap-1">
                                                <button
                                                    className="hm-icon-btn"
                                                    title="Xem chi tiết"
                                                    onClick={() => setSelectedHotel(hotel)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="hm-icon-btn"
                                                    title="Chỉnh sửa"
                                                    onClick={() => openEdit(hotel)}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className="hm-icon-btn danger"
                                                    title="Xóa khách sạn"
                                                    onClick={() => handleDelete(hotel)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {visibleHotels.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <Hotel size={35} className="hm-muted mb-2" />
                                            <div className="fw-semibold">Không tìm thấy khách sạn</div>
                                            <div className="hm-muted mt-1">
                                                Hãy thử từ khóa hoặc bộ lọc khác.
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {loading && (<tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <Hotel size={35} className="hm-muted mb-2" />
                                            <div className="fw-semibold">Không tìm thấy khách sạn</div>
                                            <div className="hm-muted mt-1">
                                                Hãy thử từ khóa hoặc bộ lọc khác.
                                            </div>
                                        </td>
                                    </tr>)
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="hm-pagination">
                        <span className="hm-muted small">
                            Hiển thị {filteredHotels.length ? (currentPage - 1) * pageSize + 1 : 0}
                            {" – "}
                            {Math.min(currentPage * pageSize, filteredHotels.length)}
                            {" / "}{filteredHotels.length} khách sạn
                        </span>

                        <div>
                            <button
                                className="hm-page-btn"
                                disabled={currentPage <= 1}
                                onClick={() => setPage(p => p - 1)}
                                aria-label="Trang trước"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    className={`hm-page-btn ${currentPage === n ? "active" : ""}`}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                className="hm-page-btn"
                                disabled={currentPage >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                                aria-label="Trang sau"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {showModal && (
                <div className="hm-overlay" onMouseDown={e => {
                    if (e.target === e.currentTarget) closeModal();
                }}>
                    <section className="hm-modal" role="dialog" aria-modal="true" aria-labelledby="hotel-modal-title">
                        <div className="hm-modal-header">
                            <div>
                                <h5 id="hotel-modal-title" className="fw-bold mb-1">
                                    {editingHotel ? "Chỉnh sửa khách sạn" : "Thêm khách sạn mới"}
                                </h5>
                                <div className="hm-muted small">
                                    Nhập thông tin cơ sở lưu trú
                                </div>
                            </div>
                            <button className="hm-icon-btn" onClick={closeModal} aria-label="Đóng">
                                <X size={19} />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="hm-modal-body">
                                {error && (
                                    <div className="alert alert-danger py-2">{error}</div>
                                )}

                                <div className="mb-3">
                                    <label className="hm-label">Tên khách sạn *</label>
                                    <input
                                        className="hm-form-control"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="VD: Sweet Dalat Hotel"
                                        required
                                    />
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="hm-label">Tỉnh / thành phố *</label>
                                        <input
                                            className="hm-form-control"
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="VD: Đà Lạt, Lâm Đồng"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="hm-label">Địa chỉ *</label>
                                        <input
                                            className="hm-form-control"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            placeholder="Số nhà, tên đường"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="hm-label">Giá phòng từ (VNĐ) *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="hm-form-control"
                                            name="price"
                                            value={form.price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="hm-label">Số phòng *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            className="hm-form-control"
                                            name="rooms"
                                            value={form.rooms}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="hm-label">URL ảnh khách sạn</label>
                                    <input
                                        className="hm-form-control"
                                        name="image"
                                        value={form.image}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="hm-label">Mô tả</label>
                                    <textarea
                                        className="hm-form-control"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Giới thiệu khách sạn..."
                                    />
                                </div>

                                <div className="mb-1">
                                    <label className="hm-label">Trạng thái</label>
                                    <select
                                        className="hm-form-control"
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Pending">Chờ duyệt</option>
                                        <option value="Active">Đang hoạt động</option>
                                        <option value="Inactive">Tạm ngưng</option>
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2 px-4 pb-4">
                                <button type="button" className="btn btn-light border" onClick={closeModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="hm-btn-primary">
                                    {editingHotel ? "Lưu thay đổi" : "Tạo khách sạn"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {selectedHotel && (
                <div className="hm-overlay" onMouseDown={e => {
                    if (e.target === e.currentTarget) setSelectedHotel(null);
                }}>
                    <section className="hm-modal" role="dialog" aria-modal="true" aria-labelledby="hotel-detail-title">
                        <div className="hm-modal-header">
                            <h5 id="hotel-detail-title" className="fw-bold mb-0">Chi tiết khách sạn</h5>
                            <button className="hm-icon-btn" onClick={() => setSelectedHotel(null)} aria-label="Đóng">
                                <X size={19} />
                            </button>
                        </div>
                        <div className="hm-modal-body">
                            <img
                                className="hm-detail-image"
                                src={selectedHotel.image}
                                alt={selectedHotel.name}
                            />
                            <h4 className="fw-bold">{selectedHotel.name}</h4>
                            <p className="hm-muted">
                                <MapPin size={15} className="me-1" />
                                {selectedHotel.address}, {selectedHotel.city}
                            </p>
                            <p>{selectedHotel.description || "Chưa có mô tả."}</p>

                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <div className="border rounded-3 p-3">
                                        <div className="hm-muted small">Giá phòng từ</div>
                                        <strong>{formatPrice(selectedHotel.price)}</strong>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="border rounded-3 p-3">
                                        <div className="hm-muted small">Số phòng</div>
                                        <strong>{selectedHotel.rooms} phòng</strong>
                                    </div>
                                </div>
                            </div>

                            <label className="hm-label">Cập nhật trạng thái</label>
                            <select
                                className="hm-form-control"
                                value={selectedHotel.status}
                                onChange={e => {
                                    const status = e.target.value;
                                    changeStatus(selectedHotel, status);
                                    setSelectedHotel(prev => ({ ...prev, status }));
                                }}
                            >
                                <option value="Active">Đang hoạt động</option>
                                <option value="Pending">Chờ duyệt</option>
                                <option value="Inactive">Tạm ngưng</option>
                            </select>
                        </div>
                        <div className="d-flex justify-content-end gap-2 px-4 pb-4">
                            <button className="btn btn-light border" onClick={() => setSelectedHotel(null)}>
                                Đóng
                            </button>
                            <button
                                className="hm-btn-primary"
                                onClick={() => {
                                    const hotel = selectedHotel;
                                    setSelectedHotel(null);
                                    openEdit(hotel);
                                }}
                            >
                                <Pencil size={16} /> Chỉnh sửa
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default HotelManagement;
