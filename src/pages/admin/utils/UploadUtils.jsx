/**
 * Chuyển values của form (có thể chứa File) thành FormData để gửi multipart/form-data.
 *
 * Quy ước gửi lên backend:
 *  - Ảnh đơn (type "image"):
 *      File   -> ảnh mới, field `key` là file
 *      string -> giữ ảnh cũ (URL)
 *      ""     -> đã xóa ảnh
 *  - Nhiều ảnh (type "images"):
 *      các file mới  -> field `key` (lặp nhiều lần)
 *      URL còn giữ   -> field `keyExisting` (JSON mảng URL). Ảnh cũ không có trong mảng này = bị xóa.
 *
 * Dùng: await axios.post("/rooms", buildFormData(values));  (axios tự set Content-Type + boundary)
 */
export function buildFormData(values) {
  const fd = new FormData();
  Object.entries(values).forEach(([key, v]) => {
    if (v === undefined) return;
    if (Array.isArray(v)) {
      v.filter((i) => i instanceof File).forEach((file) => fd.append(key, file));
      fd.append(`${key}Existing`, JSON.stringify(v.filter((i) => typeof i === "string")));
    } else if (v instanceof File) {
      fd.append(key, v);
    } else if (v === null) {
      fd.append(key, "");
    } else {
      fd.append(key, v);
    }
  });
  return fd;
}

/**
 * CHỈ DÙNG ĐỂ DEMO khi chưa có backend: biến File thành URL tạm (blob:) để hiển thị.
 * Khi có API thật, server trả về URL ảnh và bạn lưu URL đó.
 */
export const demoResolveImage = (v) => (v instanceof File ? URL.createObjectURL(v) : v);
export const demoResolveImages = (arr = []) => arr.map(demoResolveImage);