/**
 * Từ điển đa ngôn ngữ (khóa phẳng, dạng "nhóm.tên").
 * Thêm ngôn ngữ mới: thêm 1 object vào DICTIONARIES và 1 dòng vào LANGUAGES.
 * Biến nội suy dùng {ten}, ví dụ t("header.greeting", { name: "An" }).
 */

export const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", short: "VI" },
  { code: "en", label: "English", short: "EN" },
];

const vi = {
  // Header / điều hướng
  "brand.name": "StayBook",
  "nav.home": "Trang chủ",
  "nav.myBookings": "Booking của tôi",
  "nav.admin.hotels": "Khách sạn",
  "nav.admin.rooms": "Phòng",
  "nav.admin.bookings": "Đặt phòng",
  "header.toggleMenu": "Mở/đóng menu",
  "header.language": "Ngôn ngữ",
  "header.greeting": "Xin chào, {name}",

  // Tài khoản
  "auth.login": "Đăng nhập",
  "auth.logout": "Đăng xuất",
  "auth.loggingOut": "Đang đăng xuất...",
  "auth.profile": "Hồ sơ cá nhân",
  "auth.account": "Tài khoản",
  "auth.role.admin": "Quản trị viên",
  "auth.role.staff": "Nhân viên",
  "auth.role.customer": "Khách hàng",
  "auth.phone": "Số điện thoại",
  "auth.noPhone": "Chưa cập nhật",

  // Dùng chung
  "common.save": "Lưu",
  "common.cancel": "Hủy",
  "common.close": "Đóng",
  "common.search": "Tìm kiếm",
  "common.loading": "Đang tải...",
  "common.retry": "Thử lại",
  "common.nights": "{count} đêm",
  "common.guests": "{count} khách",
};

const en = {
  "brand.name": "StayBook",
  "nav.home": "Home",
  "nav.myBookings": "My bookings",
  "nav.admin.hotels": "Hotels",
  "nav.admin.rooms": "Rooms",
  "nav.admin.bookings": "Bookings",
  "header.toggleMenu": "Toggle menu",
  "header.language": "Language",
  "header.greeting": "Hello, {name}",

  "auth.login": "Sign in",
  "auth.logout": "Sign out",
  "auth.loggingOut": "Signing out...",
  "auth.profile": "My profile",
  "auth.account": "Account",
  "auth.role.admin": "Administrator",
  "auth.role.staff": "Staff",
  "auth.role.customer": "Customer",
  "auth.phone": "Phone",
  "auth.noPhone": "Not provided",

  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.search": "Search",
  "common.loading": "Loading...",
  "common.retry": "Retry",
  "common.nights": "{count} night(s)",
  "common.guests": "{count} guest(s)",
};

export const DICTIONARIES = { vi, en };
export const DEFAULT_LANG = "vi";