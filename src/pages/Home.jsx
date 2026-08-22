import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Search,
    MapPin,
    CalendarDays,
    Users,
    Star,
    ArrowRight,
    Wifi,
    Coffee,
    Car,
    ShieldCheck,
    Hotel,
} from "lucide-react";

function Home() {
    const { t } = useTranslation();

    const hotels = [
        {
            id: 1,
            name: "Sweet Hotel Đà Lạt",
            location: "Đà Lạt, Việt Nam",
            image:
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
            rating: 4.8,
            price: "850.000",
        },
        {
            id: 2,
            name: "Ocean View Resort",
            location: "Phan Thiết, Việt Nam",
            image:
                "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80",
            rating: 4.9,
            price: "1.200.000",
        },
        {
            id: 3,
            name: "Saigon Central Hotel",
            location: "TP. Hồ Chí Minh",
            image:
                "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80",
            rating: 4.7,
            price: "950.000",
        },
    ];

    const destinations = [
        {
            name: "Đà Lạt",
            image:
                "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=700&q=80",
        },
        {
            name: "Đà Nẵng",
            image:
                "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=700&q=80",
        },
        {
            name: "Phan Thiết",
            image:
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
        },
        {
            name: "Hạ Long",
            image:
                "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=700&q=80",
        },
    ];

    return (
        <div className="bg-light min-vh-100">

            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg bg-white shadow-sm">
                <div className="container py-2">

                    <Link
                        to="/"
                        className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary"
                    >
                        <Hotel size={30} />

                        <span className="fs-4">
                            Booking Sweet
                        </span>
                    </Link>

                    <div className="d-flex align-items-center gap-2">

                        <Link
                            to="/login"
                            className="btn btn-outline-primary rounded-pill px-4"
                        >
                            {t("common.login")}
                        </Link>

                        <Link
                            to="/register"
                            className="btn btn-primary rounded-pill px-4"
                        >
                            {t("common.register")}
                        </Link>

                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section
                className="position-relative text-white"
                style={{
                    minHeight: "520px",
                    backgroundImage:
                        "linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.5)), url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1800&q=85')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="container h-100">
                    <div
                        className="row align-items-center"
                        style={{ minHeight: "520px" }}
                    >
                        <div className="col-lg-8">

                            <span className="badge bg-white text-primary rounded-pill px-3 py-2 mb-3">
                                ✨ Khám phá kỳ nghỉ tuyệt vời
                            </span>

                            <h1 className="display-4 fw-bold mb-3">
                                Tìm nơi nghỉ dưỡng
                                <br />
                                <span className="text-info">
                                    hoàn hảo cho bạn
                                </span>
                            </h1>

                            <p className="lead mb-4 opacity-75">
                                Khám phá hàng nghìn khách sạn,
                                resort và homestay với mức giá tốt nhất.
                            </p>

                        </div>
                    </div>
                </div>

                {/* SEARCH BOX */}
                <div
                    className="position-absolute w-100"
                    style={{
                        bottom: "-70px",
                    }}
                >
                    <div className="container">

                        <div className="bg-white rounded-4 shadow-lg p-3">

                            <div className="row g-2">

                                {/* Location */}
                                <div className="col-lg-3">
                                    <div className="border rounded-3 p-3 h-100">

                                        <small className="text-muted d-block">
                                            Địa điểm
                                        </small>

                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <MapPin
                                                size={19}
                                                className="text-primary"
                                            />

                                            <input
                                                type="text"
                                                className="form-control border-0 p-0 shadow-none"
                                                placeholder="Bạn muốn đi đâu?"
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* Check in */}
                                <div className="col-lg-2">
                                    <div className="border rounded-3 p-3 h-100">

                                        <small className="text-muted d-block">
                                            Nhận phòng
                                        </small>

                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <CalendarDays
                                                size={19}
                                                className="text-primary"
                                            />

                                            <input
                                                type="date"
                                                className="form-control border-0 p-0 shadow-none"
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* Check out */}
                                <div className="col-lg-2">
                                    <div className="border rounded-3 p-3 h-100">

                                        <small className="text-muted d-block">
                                            Trả phòng
                                        </small>

                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <CalendarDays
                                                size={19}
                                                className="text-primary"
                                            />

                                            <input
                                                type="date"
                                                className="form-control border-0 p-0 shadow-none"
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* Guests */}
                                <div className="col-lg-2">
                                    <div className="border rounded-3 p-3 h-100">

                                        <small className="text-muted d-block">
                                            Khách
                                        </small>

                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <Users
                                                size={19}
                                                className="text-primary"
                                            />

                                            <select className="form-select border-0 p-0 shadow-none">
                                                <option>
                                                    1 khách
                                                </option>
                                                <option>
                                                    2 khách
                                                </option>
                                                <option>
                                                    3 khách
                                                </option>
                                                <option>
                                                    4+ khách
                                                </option>
                                            </select>
                                        </div>

                                    </div>
                                </div>

                                {/* Search */}
                                <div className="col-lg-3">

                                    <Link
                                        to="/hotels"
                                        className="btn btn-primary w-100 h-100 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                    >
                                        <Search size={20} />
                                        Tìm khách sạn
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* DESTINATIONS */}
            <section className="container pt-5 mt-5">

                <div className="d-flex justify-content-between align-items-end mb-4">

                    <div>
                        <span className="text-primary fw-semibold">
                            KHÁM PHÁ
                        </span>

                        <h2 className="fw-bold mt-2 mb-1">
                            Điểm đến nổi bật
                        </h2>

                        <p className="text-muted mb-0">
                            Những địa điểm được yêu thích nhất
                        </p>
                    </div>

                    <Link
                        to="/hotels"
                        className="text-primary text-decoration-none fw-semibold d-flex align-items-center gap-1"
                    >
                        Xem tất cả
                        <ArrowRight size={17} />
                    </Link>

                </div>

                <div className="row g-4">

                    {destinations.map((destination) => (
                        <div
                            className="col-6 col-lg-3"
                            key={destination.name}
                        >
                            <Link
                                to={`/hotels?location=${destination.name}`}
                                className="text-decoration-none"
                            >
                                <div
                                    className="rounded-4 overflow-hidden position-relative"
                                    style={{ height: "230px" }}
                                >

                                    <img
                                        src={destination.image}
                                        alt={destination.name}
                                        className="w-100 h-100 object-fit-cover"
                                    />

                                    <div
                                        className="position-absolute bottom-0 start-0 w-100 p-3 text-white"
                                        style={{
                                            background:
                                                "linear-gradient(transparent, rgba(0,0,0,.75))",
                                        }}
                                    >
                                        <h5 className="fw-bold mb-0">
                                            {destination.name}
                                        </h5>
                                    </div>

                                </div>
                            </Link>
                        </div>
                    ))}

                </div>
            </section>

            {/* HOTELS */}
            <section className="container py-5">

                <div className="d-flex justify-content-between align-items-end mb-4">

                    <div>
                        <span className="text-primary fw-semibold">
                            ĐƯỢC YÊU THÍCH
                        </span>

                        <h2 className="fw-bold mt-2 mb-1">
                            Khách sạn nổi bật
                        </h2>

                        <p className="text-muted mb-0">
                            Những nơi lưu trú được đánh giá cao
                        </p>
                    </div>

                    <Link
                        to="/hotels"
                        className="text-primary text-decoration-none fw-semibold d-flex align-items-center gap-1"
                    >
                        Xem tất cả
                        <ArrowRight size={17} />
                    </Link>

                </div>

                <div className="row g-4">

                    {hotels.map((hotel) => (
                        <div
                            className="col-md-6 col-lg-4"
                            key={hotel.id}
                        >

                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">

                                <img
                                    src={hotel.image}
                                    alt={hotel.name}
                                    className="w-100"
                                    style={{
                                        height: "230px",
                                        objectFit: "cover",
                                    }}
                                />

                                <div className="card-body p-4">

                                    <div className="d-flex justify-content-between align-items-start">

                                        <div>
                                            <h5 className="fw-bold mb-2">
                                                {hotel.name}
                                            </h5>

                                            <div className="d-flex align-items-center gap-1 text-muted small">
                                                <MapPin size={15} />
                                                {hotel.location}
                                            </div>
                                        </div>

                                        <div className="badge bg-warning-subtle text-warning-emphasis">
                                            <Star
                                                size={14}
                                                fill="currentColor"
                                            />{" "}
                                            {hotel.rating}
                                        </div>

                                    </div>

                                    <hr />

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>
                                            <small className="text-muted">
                                                Từ
                                            </small>

                                            <div>
                                                <strong className="text-primary fs-5">
                                                    {hotel.price}đ
                                                </strong>

                                                <small className="text-muted">
                                                    /đêm
                                                </small>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/hotels/${hotel.id}`}
                                            className="btn btn-outline-primary rounded-pill px-3"
                                        >
                                            Xem phòng
                                        </Link>

                                    </div>

                                </div>

                            </div>

                        </div>
                    ))}

                </div>
            </section>

            {/* FEATURES */}
            <section className="bg-white py-5">

                <div className="container">

                    <div className="text-center mb-5">

                        <span className="text-primary fw-semibold">
                            BOOKING SWEET
                        </span>

                        <h2 className="fw-bold mt-2">
                            Vì sao chọn chúng tôi?
                        </h2>

                    </div>

                    <div className="row g-4">

                        <div className="col-md-6 col-lg-3">
                            <Feature
                                icon={<ShieldCheck />}
                                title="Đặt phòng an toàn"
                                text="Thông tin và giao dịch của bạn luôn được bảo vệ."
                            />
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <Feature
                                icon={<Star />}
                                title="Khách sạn chất lượng"
                                text="Hệ thống đánh giá giúp bạn dễ dàng lựa chọn."
                            />
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <Feature
                                icon={<Coffee />}
                                title="Nhiều tiện ích"
                                text="Tìm kiếm nơi lưu trú phù hợp với nhu cầu của bạn."
                            />
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <Feature
                                icon={<Car />}
                                title="Vị trí thuận tiện"
                                text="Dễ dàng tìm khách sạn gần địa điểm bạn muốn đến."
                            />
                        </div>

                    </div>

                </div>

            </section>

            {/* FOOTER */}
            <footer className="bg-dark text-white py-5">

                <div className="container">

                    <div className="row g-4">

                        <div className="col-lg-5">

                            <div className="d-flex align-items-center gap-2 fw-bold fs-4 mb-3">
                                <Hotel />
                                Booking Sweet
                            </div>

                            <p className="text-white-50">
                                Nền tảng đặt phòng khách sạn
                                giúp bạn tìm kiếm và đặt nơi
                                lưu trú phù hợp một cách dễ dàng.
                            </p>

                        </div>

                        <div className="col-6 col-lg-2">

                            <h6 className="fw-bold">
                                Khám phá
                            </h6>

                            <Link
                                to="/"
                                className="d-block text-white-50 text-decoration-none mb-2"
                            >
                                Trang chủ
                            </Link>

                            <Link
                                to="/hotels"
                                className="d-block text-white-50 text-decoration-none"
                            >
                                Khách sạn
                            </Link>

                        </div>

                        <div className="col-6 col-lg-2">

                            <h6 className="fw-bold">
                                Tài khoản
                            </h6>

                            <Link
                                to="/login"
                                className="d-block text-white-50 text-decoration-none mb-2"
                            >
                                Đăng nhập
                            </Link>

                            <Link
                                to="/register"
                                className="d-block text-white-50 text-decoration-none"
                            >
                                Đăng ký
                            </Link>

                        </div>

                        <div className="col-lg-3">

                            <h6 className="fw-bold">
                                Liên hệ
                            </h6>

                            <p className="text-white-50 mb-1">
                                support@bookingsweet.com
                            </p>

                            <p className="text-white-50">
                                Hotline: 1900 0000
                            </p>

                        </div>

                    </div>

                    <hr className="border-secondary" />

                    <div className="text-center text-white-50 small">
                        © 2026 Booking Sweet. All rights reserved.
                    </div>

                </div>

            </footer>

        </div>
    );
}

function Feature({ icon, title, text }) {
    return (
        <div className="text-center px-3">

            <div
                className="mx-auto mb-3 bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{
                    width: "64px",
                    height: "64px",
                }}
            >
                {icon}
            </div>

            <h5 className="fw-bold">
                {title}
            </h5>

            <p className="text-muted small">
                {text}
            </p>

        </div>
    );
}

export default Home;