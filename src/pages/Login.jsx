import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Hotel,
} from "lucide-react";

import { login } from "../api/authApi";
import { useAuth } from "./AuthContext";

function Login() {
    const navigate = useNavigate();
    const { t } = useTranslation();

const { loginUser } = useAuth();
    
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
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

        if (!form.email || !form.password) {
            setError(t("login.pleaseFillAllFields"));
            return;
        }

        try {
            setLoading(true);
            setError("");

            
            const data = await login(
            form.email,
            form.password
            );

            console.log("Login API trả về:", data);

            const token =
            data?.token ||
            data?.accessToken ||
            data?.user?.token ||
            data?.user?.accessToken;

            if (!token) {
            throw new Error("API đăng nhập không trả về token.");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(data.user));

            loginUser({
            ...data.user,
            token,
            });

            if (data?.user?.role?.toLowerCase() === "admin") {
            navigate("/admin");
            } else {
            navigate("/");
            }

        } catch (error) {
            setError(
                error.message || t("login.loginFailed")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 bg-light">

            {/* Login */}
            <main>
                <div className="container py-5">
                    <div className="row justify-content-center">

                        <div className="col-12 col-md-8 col-lg-5 col-xl-4">

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
                                            <Hotel size={30} />
                                        </div>

                                        <h2 className="fw-bold mb-2">
                                            {t("login.welcomeBack")}
                                        </h2>

                                        <p className="text-muted mb-0">
                                            {t("login.subtitle")}
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

                                    <form onSubmit={handleSubmit}>

                                        {/* Email */}
                                        <div className="mb-3">

                                            <label
                                                htmlFor="email"
                                                className="form-label fw-semibold"
                                            >
                                                {t("login.email")}
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text bg-white">
                                                    <Mail
                                                        size={18}
                                                        className="text-muted"
                                                    />
                                                </span>

                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    className="form-control"
                                                    placeholder="example@gmail.com"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    autoComplete="email"
                                                />

                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="mb-2">

                                            <div className="d-flex justify-content-between">

                                                <label
                                                    htmlFor="password"
                                                    className="form-label fw-semibold"
                                                >
                                                    {t("Password")}
                                                </label>

                                                <Link
                                                    to="/forgot-password"
                                                    className="text-primary text-decoration-none small"
                                                >
                                                    {t("login.forgotPassword")}
                                                </Link>

                                            </div>

                                            <div className="input-group">

                                                <span className="input-group-text bg-white">
                                                    <Lock
                                                        size={18}
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
                                                    placeholder={t("login.password")}
                                                    value={form.password}
                                                    onChange={handleChange}
                                                    autoComplete="current-password"
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
                                                        <EyeOff size={18} />
                                                    ) : (
                                                        <Eye size={18} />
                                                    )}
                                                </button>

                                            </div>
                                        </div>

                                        {/* Remember */}
                                        <div className="form-check my-4">

                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="remember"
                                            />

                                            <label
                                                className="form-check-label text-muted"
                                                htmlFor="remember"
                                            >
                                                {t("login.remember")}
                                            </label>

                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm"
                                                        role="status"
                                                    />

                                                    {t("login.loggingIn")}
                                                </>
                                            ) : (
                                                <>
                                                    {t("common.login")}

                                                    <ArrowRight
                                                        size={18}
                                                    />
                                                </>
                                            )}
                                        </button>

                                    </form>

                                    {/* Divider */}
                                    <div className="d-flex align-items-center my-4">

                                        <hr className="flex-grow-1" />

                                        <span className="px-3 text-muted small">
                                            {t("login.or")}
                                        </span>

                                        <hr className="flex-grow-1" />

                                    </div>

                                    {/* Register */}
                                    <div className="text-center">

                                        <span className="text-muted">
                                            {t("login.noAccount")}
                                        </span>{" "}

                                        <Link
                                            to="/register"
                                            className="fw-semibold text-primary text-decoration-none"
                                        >
                                            {t("login.createAccount")}
                                        </Link>

                                    </div>

                                </div>
                            </div>

                            {/* Footer */}
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

export default Login;