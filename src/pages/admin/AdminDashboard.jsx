import {
    LayoutDashboard,
    Hotel,
    BedDouble,
    CalendarCheck,
    Users,
    CreditCard,
    Star,
    Settings,
    LogOut,
    Menu,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    MoreVertical,
    ArrowUpRight,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
    const { user, logout } = useAuth();

    const stats = [
        {
            title: "Tổng khách sạn",
            value: "128",
            change: "+12.5%",
            icon: Hotel,
        },
        {
            title: "Tổng phòng",
            value: "1,245",
            change: "+8.2%",
            icon: BedDouble,
        },
        {
            title: "Đặt phòng",
            value: "3,842",
            change: "+18.4%",
            icon: CalendarCheck,
        },
        {
            title: "Khách hàng",
            value: "8,521",
            change: "+15.7%",
            icon: Users,
        },
    ];

    const bookings = [
        {
            id: "BK00125",
            customer: "Nguyễn Văn An",
            hotel: "Sweet Hotel Đà Lạt",
            room: "Deluxe Room",
            date: "22/08/2026",
            amount: "1.700.000đ",
            status: "confirmed",
        },
        {
            id: "BK00124",
            customer: "Trần Minh Anh",
            hotel: "Ocean View Resort",
            room: "Ocean Suite",
            date: "22/08/2026",
            amount: "2.400.000đ",
            status: "pending",
        },
        {
            id: "BK00123",
            customer: "Lê Hoàng Nam",
            hotel: "Saigon Central Hotel",
            room: "Superior Room",
            date: "21/08/2026",
            amount: "950.000đ",
            status: "confirmed",
        },
        {
            id: "BK00122",
            customer: "Phạm Thu Hà",
            hotel: "Mountain Resort",
            room: "Family Room",
            date: "21/08/2026",
            amount: "3.200.000đ",
            status: "cancelled",
        },
        {
            id: "BK00121",
            customer: "Võ Minh Khang",
            hotel: "Beach Paradise",
            room: "Premium Room",
            date: "20/08/2026",
            amount: "2.100.000đ",
            status: "confirmed",
        },
    ];

    return (
        <div className="admin-layout">

            {/* SIDEBAR */}
            <aside className="admin-sidebar">

                {/* LOGO */}
                <div className="admin-logo">

                    <div className="logo-icon">
                        <Hotel size={22} />
                    </div>

                    <div>
                        <div className="logo-title">
                            Booking Sweet
                        </div>

                        <div className="logo-subtitle">
                            ADMIN PANEL
                        </div>
                    </div>

                </div>

                {/* MENU */}
                <div className="sidebar-content">

                    <div className="menu-label">
                        TỔNG QUAN
                    </div>

                    <SidebarItem
                        icon={<LayoutDashboard size={19} />}
                        text="Dashboard"
                        active
                    />

                    <div className="menu-label mt-4">
                        QUẢN LÝ
                    </div>

                    <SidebarItem
                        link={"/admin/hotels"}
                        icon={<Hotel size={19} />}
                        text="Khách sạn"
                    />

                    <SidebarItem
                        link={"/admin/hotels"}
                        icon={<BedDouble size={19} />}
                        text="Phòng"
                    />

                    <SidebarItem
                        link={"/admin/hotels"}
                        icon={<CalendarCheck size={19} />}
                        text="Đặt phòng"
                    />

                    <SidebarItem
                        link={"/admin/hotels"}
                        icon={<Users size={19} />}
                        text="Khách hàng"
                    />

                    <SidebarItem
                        link={"/admin/hotels"}
                        icon={<CreditCard size={19} />}
                        text="Thanh toán"
                    />

                    <SidebarItem
                        link={"/admin/hotels"}
                        icon={<Star size={19} />}
                        text="Đánh giá"
                    />

                    <div className="menu-label mt-4">
                        HỆ THỐNG
                    </div>

                    <SidebarItem
                        link={"/admin/hotels"}
                        icon={<Settings size={19} />}
                        text="Cài đặt"
                    />

                </div>

                {/* USER */}
                <div className="sidebar-user">

                    <div className="admin-avatar">
                        {user?.fullName?.charAt(0) || "A"}
                    </div>

                    <div className="flex-grow-1 overflow-hidden">

                        <div className="fw-semibold text-white text-truncate">
                            {user?.fullName || "Administrator"}
                        </div>

                        <small className="text-white-50">
                            Admin
                        </small>

                    </div>

                    <button
                        onClick={logout}
                        className="logout-btn"
                        title="Đăng xuất"
                    >
                        <LogOut size={18} />
                    </button>

                </div>

            </aside>

            {/* MAIN */}
            <main className="admin-main">

                {/* HEADER */}
                <header className="admin-header">

                    <div>
                        <h4 className="mb-1 fw-bold">
                            Dashboard
                        </h4>

                        <div className="text-muted small">
                            Tổng quan hoạt động của Booking Sweet
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">

                        <button className="mobile-menu btn btn-light">
                            <Menu size={20} />
                        </button>

                        <div className="text-end d-none d-md-block">
                            <div className="small text-muted">
                                Thứ Bảy
                            </div>

                            <strong>
                                22/08/2026
                            </strong>
                        </div>

                        <div className="header-avatar">
                            {user?.fullName?.charAt(0) || "A"}
                        </div>

                    </div>

                </header>

                {/* CONTENT */}
                <div className="admin-content">

                    {/* WELCOME */}
                    <div className="welcome-card mb-4">

                        <div>
                            <div className="welcome-small">
                                Chào mừng trở lại 👋
                            </div>

                            <h3>
                                Xin chào,{" "}
                                {user?.fullName || "Admin"}!
                            </h3>

                            <p>
                                Đây là tổng quan hoạt động của hệ thống
                                Booking Sweet hôm nay.
                            </p>
                        </div>

                        <div className="welcome-icon">
                            <Hotel size={70} />
                        </div>

                    </div>

                    {/* STATS */}
                    <div className="row g-4 mb-4">

                        {stats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    className="col-sm-6 col-xl-3"
                                    key={stat.title}
                                >

                                    <div className="stat-card">

                                        <div className="d-flex justify-content-between">

                                            <div>

                                                <div className="stat-title">
                                                    {stat.title}
                                                </div>

                                                <div className="stat-value">
                                                    {stat.value}
                                                </div>

                                            </div>

                                            <div className="stat-icon">
                                                <Icon size={23} />
                                            </div>

                                        </div>

                                        <div className="stat-change">
                                            <TrendingUp size={14} />
                                            {stat.change}
                                            <span>
                                                so với tháng trước
                                            </span>
                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                    {/* CHART + OVERVIEW */}
                    <div className="row g-4 mb-4">

                        {/* CHART */}
                        <div className="col-xl-8">

                            <div className="dashboard-card">

                                <div className="card-header-custom">

                                    <div>
                                        <h5>
                                            Doanh thu
                                        </h5>

                                        <p>
                                            Doanh thu trong 7 ngày gần nhất
                                        </p>
                                    </div>

                                    <select className="form-select form-select-sm chart-select">
                                        <option>
                                            7 ngày
                                        </option>

                                        <option>
                                            30 ngày
                                        </option>

                                        <option>
                                            12 tháng
                                        </option>
                                    </select>

                                </div>

                                <div className="revenue-total">
                                    186.500.000đ
                                </div>

                                <div className="revenue-increase">
                                    <TrendingUp size={15} />
                                    +18,6%
                                    <span>
                                        so với kỳ trước
                                    </span>
                                </div>

                                <RevenueChart />

                            </div>

                        </div>

                        {/* OVERVIEW */}
                        <div className="col-xl-4">

                            <div className="dashboard-card h-100">

                                <div className="card-header-custom">
                                    <div>
                                        <h5>
                                            Tổng quan hôm nay
                                        </h5>

                                        <p>
                                            Tình trạng booking
                                        </p>
                                    </div>
                                </div>

                                <QuickStat
                                    icon={<CheckCircle />}
                                    title="Đã xác nhận"
                                    value="86"
                                    type="success"
                                />

                                <QuickStat
                                    icon={<Clock />}
                                    title="Chờ xác nhận"
                                    value="24"
                                    type="warning"
                                />

                                <QuickStat
                                    icon={<XCircle />}
                                    title="Đã hủy"
                                    value="8"
                                    type="danger"
                                />

                                <QuickStat
                                    icon={<DollarSign />}
                                    title="Doanh thu hôm nay"
                                    value="28,6M"
                                    type="primary"
                                    last
                                />

                            </div>

                        </div>

                    </div>

                    {/* BOOKING TABLE */}
                    <div className="dashboard-card">

                        <div className="card-header-custom">

                            <div>
                                <h5>
                                    Đặt phòng gần đây
                                </h5>

                                <p>
                                    Những booking mới nhất trong hệ thống
                                </p>
                            </div>

                            <Link
                                to="/admin/bookings"
                                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            >
                                Xem tất cả
                                <ArrowUpRight
                                    size={15}
                                    className="ms-1"
                                />
                            </Link>

                        </div>

                        <div className="table-responsive">

                            <table className="table admin-table align-middle">

                                <thead>
                                    <tr>
                                        <th>MÃ BOOKING</th>
                                        <th>KHÁCH HÀNG</th>
                                        <th>KHÁCH SẠN</th>
                                        <th>PHÒNG</th>
                                        <th>NGÀY ĐẶT</th>
                                        <th>THÀNH TIỀN</th>
                                        <th>TRẠNG THÁI</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {bookings.map((booking) => (
                                        <tr key={booking.id}>

                                            <td>
                                                <strong>
                                                    #{booking.id}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="customer-cell">

                                                    <div className="customer-avatar">
                                                        {booking.customer.charAt(
                                                            0
                                                        )}
                                                    </div>

                                                    <span>
                                                        {booking.customer}
                                                    </span>

                                                </div>
                                            </td>

                                            <td>
                                                {booking.hotel}
                                            </td>

                                            <td>
                                                {booking.room}
                                            </td>

                                            <td>
                                                {booking.date}
                                            </td>

                                            <td>
                                                <strong>
                                                    {booking.amount}
                                                </strong>
                                            </td>

                                            <td>
                                                <BookingStatus
                                                    status={
                                                        booking.status
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <button className="btn btn-sm btn-light">
                                                    <MoreVertical
                                                        size={17}
                                                    />
                                                </button>
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </main>

            <style>{`
                .admin-layout {
                    min-height: 100vh;
                    background: #f6f8fb;
                    display: flex;
                }

                .admin-sidebar {
                    width: 260px;
                    min-width: 260px;
                    background: #111827;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                }

                .admin-logo {
                    height: 82px;
                    padding: 0 22px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid rgba(255,255,255,.08);
                }

                .logo-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 11px;
                    background: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logo-title {
                    font-weight: 700;
                    font-size: 17px;
                }

                .logo-subtitle {
                    font-size: 9px;
                    letter-spacing: 1.5px;
                    color: #9ca3af;
                    margin-top: 2px;
                }

                .sidebar-content {
                    padding: 20px 14px;
                    flex: 1;
                    overflow-y: auto;
                }

                .menu-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #6b7280;
                    letter-spacing: 1px;
                    padding: 0 12px 9px;
                }

                .sidebar-item {
                    color: #9ca3af;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 11px 13px;
                    border-radius: 9px;
                    margin-bottom: 3px;
                    transition: .2s;
                }

                .sidebar-item:hover {
                    color: white;
                    background: rgba(255,255,255,.06);
                }

                .sidebar-item.active {
                    background: #2563eb;
                    color: white;
                    box-shadow: 0 5px 15px rgba(37,99,235,.25);
                }

                .sidebar-user {
                    padding: 15px;
                    border-top: 1px solid rgba(255,255,255,.08);
                    display: flex;
                    align-items: center;
                    gap: 11px;
                }

                .admin-avatar,
                .header-avatar,
                .customer-avatar {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                }

                .admin-avatar {
                    width: 39px;
                    height: 39px;
                    min-width: 39px;
                    border-radius: 50%;
                    background: #2563eb;
                }

                .logout-btn {
                    border: 0;
                    background: transparent;
                    color: #9ca3af;
                    padding: 6px;
                }

                .logout-btn:hover {
                    color: #ef4444;
                }

                .admin-main {
                    flex: 1;
                    min-width: 0;
                }

                .admin-header {
                    height: 82px;
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                    padding: 0 30px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .header-avatar {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: #eff6ff;
                    color: #2563eb;
                }

                .mobile-menu {
                    display: none;
                }

                .admin-content {
                    padding: 28px;
                    max-width: 1700px;
                }

                .welcome-card {
                    min-height: 150px;
                    padding: 30px 35px;
                    border-radius: 18px;
                    background: linear-gradient(
                        120deg,
                        #2563eb,
                        #3b82f6,
                        #60a5fa
                    );
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    overflow: hidden;
                }

                .welcome-small {
                    opacity: .8;
                    font-size: 14px;
                    margin-bottom: 7px;
                }

                .welcome-card h3 {
                    font-weight: 700;
                    margin-bottom: 7px;
                }

                .welcome-card p {
                    margin: 0;
                    opacity: .8;
                }

                .welcome-icon {
                    opacity: .15;
                    margin-right: 40px;
                }

                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 22px;
                    border: 1px solid #eef0f4;
                    box-shadow: 0 2px 8px rgba(15,23,42,.03);
                }

                .stat-title {
                    color: #6b7280;
                    font-size: 13px;
                    margin-bottom: 7px;
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #111827;
                }

                .stat-icon {
                    width: 46px;
                    height: 46px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #2563eb;
                    background: #eff6ff;
                    border-radius: 12px;
                }

                .stat-change {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 13px;
                    color: #16a34a;
                    font-size: 12px;
                    font-weight: 600;
                }

                .stat-change span {
                    color: #9ca3af;
                    font-weight: 400;
                    margin-left: 2px;
                }

                .dashboard-card {
                    background: white;
                    border: 1px solid #eef0f4;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 2px 8px rgba(15,23,42,.03);
                }

                .card-header-custom {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .card-header-custom h5 {
                    font-weight: 700;
                    margin: 0 0 5px;
                }

                .card-header-custom p {
                    margin: 0;
                    color: #9ca3af;
                    font-size: 12px;
                }

                .chart-select {
                    width: auto;
                }

                .revenue-total {
                    font-size: 25px;
                    font-weight: 700;
                    color: #111827;
                }

                .revenue-increase {
                    color: #16a34a;
                    font-size: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 3px;
                }

                .revenue-increase span {
                    color: #9ca3af;
                    font-weight: 400;
                }

                .chart {
                    height: 180px;
                    display: flex;
                    align-items: end;
                    gap: 12px;
                    margin-top: 25px;
                }

                .chart-bar {
                    flex: 1;
                    background: linear-gradient(
                        to top,
                        #2563eb,
                        #93c5fd
                    );
                    border-radius: 7px 7px 2px 2px;
                    min-width: 15px;
                    transition: .3s;
                }

                .chart-bar:hover {
                    opacity: .75;
                    transform: translateY(-4px);
                }

                .quick-stat {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 17px 0;
                    border-bottom: 1px solid #f1f3f5;
                }

                .quick-stat.last {
                    border-bottom: 0;
                }

                .quick-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .quick-icon {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                }

                .quick-icon.success {
                    background: #ecfdf5;
                    color: #16a34a;
                }

                .quick-icon.warning {
                    background: #fffbeb;
                    color: #d97706;
                }

                .quick-icon.danger {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .quick-icon.primary {
                    background: #eff6ff;
                    color: #2563eb;
                }

                .admin-table {
                    margin: 0;
                    font-size: 13px;
                }

                .admin-table th {
                    font-size: 10px;
                    color: #9ca3af;
                    font-weight: 700;
                    letter-spacing: .5px;
                    white-space: nowrap;
                    border-bottom: 1px solid #eef0f4;
                    padding: 13px 10px;
                }

                .admin-table td {
                    padding: 15px 10px;
                    border-bottom: 1px solid #f3f4f6;
                    white-space: nowrap;
                }

                .customer-cell {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                }

                .customer-avatar {
                    width: 32px;
                    height: 32px;
                    min-width: 32px;
                    border-radius: 50%;
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 12px;
                }

                @media (max-width: 991px) {
                    .admin-sidebar {
                        display: none;
                    }

                    .admin-content {
                        padding: 18px;
                    }

                    .admin-header {
                        padding: 0 18px;
                    }

                    .mobile-menu {
                        display: block;
                    }
                }

                @media (max-width: 575px) {
                    .welcome-card {
                        padding: 23px;
                    }

                    .welcome-icon {
                        display: none;
                    }

                    .dashboard-card {
                        padding: 18px;
                    }
                }
            `}</style>
        </div>
    );
}

function SidebarItem({ icon, text, active = false, link = "#" }) {
    return (
        <Link
            to={link}
            className={`sidebar-item ${
                active ? "active" : ""
            }`}
        >
            {icon}
            <span>{text}</span>
        </Link>
    );
}

function QuickStat({
    icon,
    title,
    value,
    type,
    last = false,
}) {
    return (
        <div
            className={`quick-stat ${
                last ? "last" : ""
            }`}
        >
            <div className="quick-left">

                <div
                    className={`quick-icon ${type}`}
                >
                    {icon}
                </div>

                <span className="small">
                    {title}
                </span>

            </div>

            <strong>
                {value}
            </strong>
        </div>
    );
}

function BookingStatus({ status }) {
    const config = {
        confirmed: {
            text: "Đã xác nhận",
            className:
                "bg-success-subtle text-success",
        },

        pending: {
            text: "Chờ xác nhận",
            className:
                "bg-warning-subtle text-warning",
        },

        cancelled: {
            text: "Đã hủy",
            className:
                "bg-danger-subtle text-danger",
        },
    };

    const item = config[status];

    return (
        <span
            className={`badge ${item.className} px-2 py-2`}
        >
            {item.text}
        </span>
    );
}

function RevenueChart() {
    const data = [35, 52, 42, 68, 57, 82, 70];

    return (
        <div className="chart">

            {data.map((height, index) => (
                <div
                    key={index}
                    className="chart-bar"
                    style={{
                        height: `${height}%`,
                    }}
                    title={`${height}%`}
                />
            ))}

        </div>
    );
}

export default AdminDashboard;