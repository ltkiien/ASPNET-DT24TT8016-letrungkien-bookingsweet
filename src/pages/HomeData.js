/**
 * Dữ liệu mẫu + logic thuần (không phụ thuộc UI) cho trang Home của khách.
 * Khi nối backend: thay HOTELS / ROOMS / BOOKINGS bằng dữ liệu từ API,
 * hoặc chuyển searchHotels() thành 1 endpoint phía server (khuyến nghị khi dữ liệu lớn).
 */

// ---------- Tiện ích ngày (dùng giờ local, tránh lệch múi giờ của toISOString) ----------
export const toISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};
export const nightsBetween = (a, b) =>
  Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400000);

export const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

// ---------- Hằng số ----------
export const AMENITIES = [
  { value: "wifi", label: "Wifi miễn phí" },
  { value: "pool", label: "Hồ bơi" },
  { value: "breakfast", label: "Bữa sáng" },
  { value: "parking", label: "Bãi đỗ xe" },
  { value: "gym", label: "Phòng gym" },
  { value: "spa", label: "Spa" },
];

export const ROOM_TYPES = [
  { value: "single", label: "Phòng đơn" },
  { value: "double", label: "Phòng đôi" },
  { value: "twin", label: "Phòng 2 giường" },
  { value: "family", label: "Phòng gia đình" },
  { value: "suite", label: "Suite" },
];
export const roomTypeLabel = (v) => ROOM_TYPES.find((t) => t.value === v)?.label ?? v;

export const MAX_PRICE = 5000000;
export const DEFAULT_FILTERS = {
  minPrice: 0,
  maxPrice: MAX_PRICE,
  minStars: 0,
  amenities: [],
  roomType: "",
  sort: "recommended",
};

// ---------- Dữ liệu mẫu ----------
const today = toISODate(new Date());

export const HOTELS = [
  { id: "h1", name: "Sunrise Palace", city: "Hồ Chí Minh", starRating: 5, rating: 4.8, reviews: 1240, popularity: 0.9, amenities: ["wifi", "pool", "breakfast", "gym", "spa", "parking"], description: "Khách sạn 5 sao ngay trung tâm Quận 1, gần phố đi bộ Nguyễn Huệ và các điểm tham quan chính." },
  { id: "h2", name: "Ocean View", city: "Đà Nẵng", starRating: 4, rating: 4.6, reviews: 860, popularity: 0.8, amenities: ["wifi", "pool", "breakfast", "parking"], description: "Cách biển Mỹ Khê vài bước chân, phòng nhìn ra biển và hồ bơi vô cực trên tầng thượng." },
  { id: "h3", name: "Mountain Retreat", city: "Đà Lạt", starRating: 4, rating: 4.7, reviews: 520, popularity: 0.7, amenities: ["wifi", "breakfast", "parking", "spa"], description: "Không gian yên tĩnh giữa rừng thông, phù hợp nghỉ dưỡng cuối tuần cho gia đình và cặp đôi." },
  { id: "h4", name: "Saigon Central Inn", city: "Hồ Chí Minh", starRating: 3, rating: 4.2, reviews: 430, popularity: 0.6, amenities: ["wifi", "breakfast"], description: "Khách sạn gọn gàng, giá hợp lý, thuận tiện di chuyển đến chợ Bến Thành và bến xe." },
  { id: "h5", name: "Hội An Riverside", city: "Hội An", starRating: 4, rating: 4.9, reviews: 980, popularity: 0.85, amenities: ["wifi", "pool", "breakfast", "spa"], description: "Nằm bên sông Hoài, cách phố cổ 5 phút đi bộ, có dịch vụ xe đạp miễn phí." },
  { id: "h6", name: "Hanoi Old Quarter Boutique", city: "Hà Nội", starRating: 3, rating: 4.4, reviews: 610, popularity: 0.65, amenities: ["wifi", "breakfast"], description: "Khách sạn boutique giữa phố cổ, gần hồ Hoàn Kiếm và nhiều quán ăn đường phố nổi tiếng." },
];

const room = (id, hotelId, roomNumber, type, capacity, pricePerNight, status = "available") => ({
  id, hotelId, roomNumber, type, capacity, pricePerNight, status,
});

export const ROOMS = [
  room("r1", "h1", "101", "single", 1, 1200000),
  room("r2", "h1", "102", "double", 2, 1800000),
  room("r3", "h1", "201", "suite", 4, 3800000),
  room("r4", "h1", "202", "family", 5, 3200000),
  room("r5", "h2", "101", "double", 2, 1100000),
  room("r6", "h2", "102", "twin", 2, 1300000),
  room("r7", "h2", "301", "family", 5, 2100000),
  room("r8", "h2", "302", "double", 2, 1150000, "maintenance"),
  room("r9", "h3", "A1", "double", 2, 1400000),
  room("r10", "h3", "A2", "family", 4, 2300000),
  room("r11", "h3", "B1", "suite", 3, 3000000),
  room("r12", "h4", "101", "single", 1, 450000),
  room("r13", "h4", "102", "double", 2, 650000),
  room("r14", "h4", "201", "twin", 2, 720000),
  room("r15", "h5", "01", "double", 2, 1250000),
  room("r16", "h5", "02", "family", 4, 2200000),
  room("r17", "h5", "03", "suite", 3, 2900000),
  room("r18", "h6", "101", "single", 1, 500000),
  room("r19", "h6", "102", "double", 2, 780000),
  room("r20", "h6", "201", "twin", 3, 900000),
];

export const BOOKINGS = [
  { id: "b1", roomId: "r2", hotelId: "h1", checkIn: addDays(today, 1), checkOut: addDays(today, 4), status: "confirmed" },
  { id: "b2", roomId: "r5", hotelId: "h2", checkIn: addDays(today, 1), checkOut: addDays(today, 3), status: "confirmed" },
  { id: "b3", roomId: "r6", hotelId: "h2", checkIn: addDays(today, 2), checkOut: addDays(today, 5), status: "pending" },
  { id: "b4", roomId: "r15", hotelId: "h5", checkIn: addDays(today, 1), checkOut: addDays(today, 2), status: "confirmed" },
];

// ---------- Logic ----------

/**
 * Phòng trống khi: không bảo trì VÀ không có booking đang hiệu lực trùng khoảng ngày.
 * Trùng khoảng khi: b.checkIn < checkOut && b.checkOut > checkIn  (ngày trả phòng = ngày nhận phòng của khách sau là hợp lệ)
 * Lưu ý: trạng thái "occupied"/"cleaning" của admin là trạng thái HIỆN TẠI, không dùng để chặn ngày tương lai.
 */
export function isRoomAvailable(room, bookings, checkIn, checkOut) {
  if (room.status === "maintenance") return false;
  return !bookings.some(
    (b) =>
      b.roomId === room.id &&
      ["pending", "confirmed", "checked_in"].includes(b.status) &&
      b.checkIn < checkOut &&
      b.checkOut > checkIn
  );
}

const jaccard = (a, b) => {
  const A = new Set(a);
  const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union === 0 ? 0 : inter / union;
};

/**
 * Chấm điểm gợi ý (0-100) dựa trên:
 *  - Đánh giá (40) + số lượt đánh giá (10) + độ phổ biến (10)
 *  - Giá tốt so với các khách sạn còn trống (20)
 *  - Giống khách sạn user đã xem: tiện ích tương tự (10) + cùng thành phố (10)
 */
export function scoreHotels(candidates, viewedHotels = []) {
  if (!candidates.length) return [];
  const prices = candidates.map((h) => h.minPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return candidates
    .map((h) => {
      const value = max === min ? 0.5 : 1 - (h.minPrice - min) / (max - min);
      const others = viewedHotels.filter((v) => v.id !== h.id);
      const sim = others.reduce((m, v) => Math.max(m, jaccard(h.amenities, v.amenities)), 0);
      const sameCity = others.some((v) => v.city === h.city);

      const score =
        (h.rating / 5) * 40 +
        (Math.min(h.reviews, 1000) / 1000) * 10 +
        h.popularity * 10 +
        value * 20 +
        sim * 10 +
        (sameCity ? 10 : 0);

      const reasons = [];
      if (sameCity || sim >= 0.6) reasons.push("Tương tự nơi bạn đã xem");
      if (h.rating >= 4.7) reasons.push("Đánh giá cao");
      if (value >= 0.7 && candidates.length > 1) reasons.push("Giá tốt");
      if (h.popularity >= 0.85) reasons.push("Được đặt nhiều");

      return { ...h, score, reasons: reasons.slice(0, 2) };
    })
    .sort((a, b) => b.score - a.score);
}

/** Phòng còn trống của 1 khách sạn theo ngày + số khách (không áp bộ lọc giá/loại). */
export function getAvailableRooms({ rooms, bookings, hotelId, params }) {
  const { checkIn, checkOut, guests = 1 } = params;
  return rooms
    .filter(
      (r) =>
        r.hotelId === hotelId &&
        r.capacity >= guests &&
        isRoomAvailable(r, bookings, checkIn, checkOut)
    )
    .sort((a, b) => a.pricePerNight - b.pricePerNight);
}

/** Tìm khách sạn: áp dụng từ khóa, ngày, số khách và toàn bộ bộ lọc; trả về kèm availableRooms + minPrice. */
export function searchHotels({ hotels, rooms, bookings, params, filters, viewed = [] }) {
  const { keyword = "", checkIn, checkOut, guests = 1 } = params;
  const q = keyword.trim().toLowerCase();

  const found = [];
  hotels.forEach((h) => {
    if (q && !`${h.name} ${h.city}`.toLowerCase().includes(q)) return;
    if (
  filters.minStars &&
  Number(h.starRating ?? h.stars ?? 0) < Number(filters.minStars)
) {
  return;
}
    if (filters.amenities.length && !filters.amenities.every((a) => h.amenities.includes(a))) return;

    const availableRooms = rooms
      .filter(
        (r) =>
          r.hotelId === h.id &&
          r.capacity >= guests &&
          Number(r.price ?? r.pricePerNight ?? 0) >= Number(filters.minPrice) &&
          Number(r.price ?? r.pricePerNight ?? 0) <= Number(filters.maxPrice) &&
          (!filters.roomType || r.type === filters.roomType) &&
          isRoomAvailable(r, bookings, checkIn, checkOut)
      )
      .sort(
  (a, b) =>
    Number(a.price ?? a.pricePerNight ?? 0) -
    Number(b.price ?? b.pricePerNight ?? 0)
);

    if (availableRooms.length) {
  found.push({
    ...h,
    availableRooms,
    minPrice: Number(
      availableRooms[0].price ?? availableRooms[0].pricePerNight ?? 0
    ),
  });
}
  });

  const ranked = scoreHotels(found, viewed);
  switch (filters.sort) {
    case "priceAsc":
      return [...ranked].sort((a, b) => a.minPrice - b.minPrice);
    case "priceDesc":
      return [...ranked].sort((a, b) => b.minPrice - a.minPrice);
    case "ratingDesc":
      return [...ranked].sort((a, b) => b.rating - a.rating);
    default:
      return ranked; // recommended
  }
}

/** Gợi ý: xét mọi khách sạn còn phòng theo ngày + số khách (bỏ từ khóa và bộ lọc), xếp theo điểm gợi ý. */
export function recommendHotels({ hotels, rooms, bookings, params, viewed = [], limit = 4 }) {
  return searchHotels({
    hotels,
    rooms,
    bookings,
    params: { ...params, keyword: "" },
    filters: DEFAULT_FILTERS,
    viewed,
  }).slice(0, limit);
}