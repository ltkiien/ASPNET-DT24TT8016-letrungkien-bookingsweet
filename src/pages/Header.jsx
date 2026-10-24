import { useEffect, useRef, useState } from "react";
import { Hotel, Globe, ChevronDown, Check, LogOut, User, Phone, Mail, Menu, X, LogIn, Receipt, Loader2 } from "lucide-react";
import { useI18n } from "./I18nProvider";
import { useAuth } from "./AuthContext";

/**
 * Header dùng chung: logo, menu điều hướng (theo vai trò), chọn ngôn ngữ, thông tin người dùng.
 *
 * Props
 * - LinkComponent : "a" (mặc định) hoặc Link của react-router-dom. Với "a" dùng href, với component khác dùng prop `to`.
 * - currentPath   : đường dẫn hiện tại để tô sáng menu (mặc định window.location.pathname)
 * - onLoginClick  : bấm nút Đăng nhập (vd: navigate("/login")). Không truyền thì Đăng nhập dẫn tới /login
 * - onLoggedOut   : gọi sau khi đăng xuất xong (vd: navigate("/"))
 *
 * Cần bọc app trong <I18nProvider> và <AuthProvider>. Bootstrap 5.3+ CSS đã import ở main.jsx.
 */

// Đóng dropdown khi bấm ra ngoài hoặc nhấn Esc
function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && onClose();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, ref, onClose]);
}

const initialsOf = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase(); // Vietnamese: chữ đầu họ + chữ đầu tên
};

function Avatar({ user, size = 36 }) {
  if (user.avatar) {
    return <img src={user.avatar} alt="" className="rounded-circle border" style={{ width: size, height: size, objectFit: "cover" }} />;
  }
  return (
    <span
      className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initialsOf(user.name)}
    </span>
  );
}

/* ============================ Chọn ngôn ngữ ============================ */

function LanguageSwitcher() {
  const { lang, setLang, languages, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(ref, open, () => setOpen(false));
  const current = languages.find((l) => l.code === lang);

  return (
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("header.language")}
      >
        <Globe size={16} /> <span className="fw-medium">{current?.short}</span> <ChevronDown size={14} />
      </button>

      {open && (
        <ul className="dropdown-menu show shadow border-0 mt-2" style={{ right: 0, left: "auto", minWidth: 170 }} role="menu">
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l.code === lang}
                className={`dropdown-item d-flex align-items-center justify-content-between gap-3 ${l.code === lang ? "active" : ""}`}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
              >
                <span>{l.label}</span>
                {l.code === lang && <Check size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================ Menu người dùng ============================ */

function UserMenu({ LinkComponent, linkProps, onLoggedOut }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  useDismiss(ref, open, () => setOpen(false));

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      setOpen(false);
      onLoggedOut?.();
    } finally {
      setBusy(false);
    }
  };

  const roleKey = `auth.role.${user.role || "customer"}`;
  const roleCls = user.role === "admin" ? "danger" : user.role === "staff" ? "info" : "success";

  return (
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="btn btn-light border d-flex align-items-center gap-2 py-1 px-2"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} size={30} />
        <span className="d-none d-md-inline fw-medium text-truncate" style={{ maxWidth: 140 }}>{user.name}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open && (
        <div className="dropdown-menu show shadow border-0 mt-2 p-0" style={{ right: 0, left: "auto", minWidth: 290 }} role="menu">
          {/* Thông tin người dùng */}
          <div className="p-3 border-bottom d-flex align-items-center gap-3">
            <Avatar user={user} size={48} />
            <div className="overflow-hidden">
              <div className="fw-semibold text-truncate">{user.name}</div>
              <span className={`badge rounded-pill text-bg-${roleCls}-subtle text-${roleCls}-emphasis border border-${roleCls}-subtle`}>{t(roleKey)}</span>
            </div>
          </div>
          <div className="px-3 py-2 small text-muted border-bottom">
            <div className="d-flex align-items-center gap-2 mb-1 text-truncate"><Mail size={14} /> {user.email}</div>
            <div className="d-flex align-items-center gap-2"><Phone size={14} /> {user.phone || t("auth.noPhone")}</div>
          </div>

          {/* Liên kết */}
          <div className="py-1">
            <LinkComponent {...linkProps("/profile")} className="dropdown-item d-flex align-items-center gap-2" onClick={() => setOpen(false)}>
              <User size={16} /> {t("auth.profile")}
            </LinkComponent>
            <LinkComponent {...linkProps("/my-bookings")} className="dropdown-item d-flex align-items-center gap-2" onClick={() => setOpen(false)}>
              <Receipt size={16} /> {t("nav.myBookings")}
            </LinkComponent>
          </div>

          <div className="border-top py-1">
            <button type="button" className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={handleLogout} disabled={busy}>
              {busy ? <Loader2 size={16} style={{ animation: "hd-spin 1s linear infinite" }} /> : <LogOut size={16} />}
              {busy ? t("auth.loggingOut") : t("auth.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ Header ============================ */

export default function Header({ LinkComponent = "a", currentPath, onLoginClick, onLoggedOut }) {
  const { t } = useI18n();
  const { user, loading, isAdmin, isStaff } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false); // menu trên mobile
  const path = currentPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");

  // "a" dùng href, component router (Link/NavLink) dùng to
  const linkProps = (to) => (LinkComponent === "a" ? { href: to } : { to });

  console.log("Header user:", user, "isAdmin:", isAdmin, "isStaff:", isStaff);

  // Menu điều hướng theo vai trò
  const items = [
    { to: "/", label: t("nav.home") },
    ...(user ? [{ to: "/my-bookings", label: t("nav.myBookings") }] : []),
    ...(isAdmin || isStaff
      ? [
          { to: "/admin/hotels", label: t("nav.admin.hotels") },
          { to: "/admin/rooms", label: t("nav.admin.rooms") },
          { to: "/admin/bookings", label: t("nav.admin.bookings") },
        ]
      : []),
  ];
  const isActive = (to) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm sticky-top">
      <div className="container">
        <LinkComponent {...linkProps("/")} className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary">
          <Hotel size={24} /> {t("brand.name")}
        </LinkComponent>

        <button
          type="button"
          className="navbar-toggler border-0"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={t("header.toggleMenu")}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {items.map((it) => (
              <li className="nav-item" key={it.to}>
                <LinkComponent
                  {...linkProps(it.to)}
                  className={`nav-link ${isActive(it.to) ? "active fw-semibold text-primary" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {it.label}
                </LinkComponent>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2 pb-2 pb-lg-0">
            <LanguageSwitcher />

            {loading ? (
              <span className="placeholder-glow"><span className="placeholder rounded-circle" style={{ width: 36, height: 36, display: "inline-block" }} /></span>
            ) : user ? (
              <UserMenu LinkComponent={LinkComponent} linkProps={linkProps} onLoggedOut={onLoggedOut} />
            ) : onLoginClick ? (
              <button type="button" className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={onLoginClick}>
                <LogIn size={16} /> {t("auth.login")}
              </button>
            ) : (
              <LinkComponent {...linkProps("/login")} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
                <LogIn size={16} /> {t("auth.login")}
              </LinkComponent>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes hd-spin{to{transform:rotate(360deg)}}`}</style>
    </nav>
  );
}