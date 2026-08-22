import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Hotel,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

import { register } from "../api/authApi";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (
            !form.fullName ||
            !form.email ||
            !form.password ||
            !form.confirmPassword
        ) {
            setError("Vui lòng nhập đầy đủ thông tin");

            return;
        }

        if (form.password.length < 6) {
            setError(
                "Mật khẩu phải có ít nhất 6 ký tự"
            );

            return;
        }

        if (
            form.password !==
            form.confirmPassword
        ) {
            setError(
                "Mật khẩu xác nhận không khớp"
            );

            return;
        }

        try {
            setLoading(true);

            const data = await register(
                form.fullName,
                form.email,
                form.password,
                form.phone
            );

            console.log(
                "Register success:",
                data
            );

            // Đăng ký thành công
            navigate("/login");

        } catch (error) {
            setError(
                error.message ||
                    "Đăng ký thất bại"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 bg-light">

            {/* Navbar */}
            <nav className="navbar bg-white border-bottom">
                <div className="container py-2">

                    <Link
                        to="/"
                        className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary"
                    >
                        <Hotel size={28} />

                        <span className="fs-4">
                            Booking Sweet
                        </span>
                    </Link>

                    <Link
                        to="/login"
                        className="btn btn-outline-primary rounded-pill px-4"
                    >
                        Đăng nhập
                    </Link>

                </div>
            </nav>

            {/* Register */}
            <main>
                <div className="container py-5">

                    <div className="row justify-content-center">

                        <div className="col-12 col-md-8 col-lg-6 col-xl-5">

                            <div className="card border-0 shadow-sm rounded-4">

                                <div className="card-body p-4 p-md-5">

                                    {/* Header */}
                                    <div className="text-center mb-4">

                                        <div
                                            className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{
                                                width: "64px",
                                                height: "64px",
                                            }}
                                        >
                                            <Hotel
                                                size={30}
                                            />
                                        </div>

                                        <h2 className="fw-bold mb-2">
                                            Tạo tài khoản
                                        </h2>

                                        <p className="text-muted mb-0">
                                            Đăng ký để bắt đầu
                                            hành trình của bạn
                                        </p>

                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div
                                            className="alert alert-danger border-0 rounded-3"
                                            role="alert"
                                        >
                                            {error}
                                        </div>
                                    )}

                                    <form
                                        onSubmit={
                                            handleSubmit
                                        }
                                    >

                                        {/* Full name */}
                                        <div className="mb-3">

                                            <label
                                                htmlFor="fullName"
                                                className="form-label fw-semibold"
                                            >
                                                Họ và tên
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text bg-white">
                                                    <User
                                                        size={
                                                            18
                                                        }
                                                        className="text-muted"
                                                    />
                                                </span>

                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    name="fullName"
                                                    className="form-control"
                                                    placeholder="Nguyễn Văn A"
                                                    value={
                                                        form.fullName
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>

                                        </div>

                                        {/* Email */}
                                        <div className="mb-3">

                                            <label
                                                htmlFor="email"
                                                className="form-label fw-semibold"
                                            >
                                                Email
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text bg-white">
                                                    <Mail
                                                        size={
                                                            18
                                                        }
                                                        className="text-muted"
                                                    />
                                                </span>

                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    className="form-control"
                                                    placeholder="example@gmail.com"
                                                    value={
                                                        form.email
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>

                                        </div>

                                        {/* Phone */}
                                        <div className="mb-3">

                                            <label
                                                htmlFor="phone"
                                                className="form-label fw-semibold"
                                            >
                                                Số điện thoại
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text bg-white">
                                                    <Phone
                                                        size={
                                                            18
                                                        }
                                                        className="text-muted"
                                                    />
                                                </span>

                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    className="form-control"
                                                    placeholder="0901234567"
                                                    value={
                                                        form.phone
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>

                                        </div>

                                        {/* Password */}
                                        <div className="mb-3">

                                            <label
                                                htmlFor="password"
                                                className="form-label fw-semibold"
                                            >
                                                Mật khẩu
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text bg-white">
                                                    <Lock
                                                        size={
                                                            18
                                                        }
                                                        className="text-muted"
                                                    />
                                                </span>

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    id="password"
                                                    name="password"
                                                    className="form-control"
                                                    placeholder="Ít nhất 6 ký tự"
                                                    value={
                                                        form.password
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    ) : (
                                                        <Eye
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    )}
                                                </button>

                                            </div>

                                        </div>

                                        {/* Confirm password */}
                                        <div className="mb-4">

                                            <label
                                                htmlFor="confirmPassword"
                                                className="form-label fw-semibold"
                                            >
                                                Xác nhận mật khẩu
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text bg-white">
                                                    <Lock
                                                        size={
                                                            18
                                                        }
                                                        className="text-muted"
                                                    />
                                                </span>

                                                <input
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    className="form-control"
                                                    placeholder="Nhập lại mật khẩu"
                                                    value={
                                                        form.confirmPassword
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    ) : (
                                                        <Eye
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    )}
                                                </button>

                                            </div>

                                        </div>

                                        {/* Terms */}
                                        <div className="form-check mb-4">

                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="terms"
                                                required
                                            />

                                            <label
                                                className="form-check-label small text-muted"
                                                htmlFor="terms"
                                            >
                                                Tôi đồng ý với
                                                các điều khoản
                                                và chính sách
                                                của Booking
                                                Sweet.
                                            </label>

                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                            disabled={
                                                loading
                                            }
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm"
                                                        role="status"
                                                    />

                                                    Đang tạo
                                                    tài khoản...
                                                </>
                                            ) : (
                                                <>
                                                    Đăng ký

                                                    <ArrowRight
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </>
                                            )}
                                        </button>

                                    </form>

                                    {/* Login */}
                                    <div className="text-center mt-4">

                                        <span className="text-muted">
                                            Đã có tài khoản?
                                        </span>{" "}

                                        <Link
                                            to="/login"
                                            className="fw-semibold text-primary text-decoration-none"
                                        >
                                            Đăng nhập
                                        </Link>

                                    </div>

                                </div>
                            </div>

                            <p className="text-center text-muted small mt-4">
                                © 2026 Booking Sweet
                            </p>

                        </div>

                    </div>
                </div>
            </main>

        </div>
    );
}

export default Register;