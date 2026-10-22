import { useEffect, useMemo, useRef, useState } from "react";
import { UploadCloud, X, AlertCircle, ImageOff } from "lucide-react";

/**
 * Giá trị của ảnh luôn là MẢNG các item:
 *  - string : URL ảnh đã có trên server (giữ nguyên)
 *  - File   : ảnh mới người dùng vừa chọn (cần upload)
 */
export const toImageArray = (v) => (v == null || v === "" ? [] : Array.isArray(v) ? v : [v]);

/** Tạo URL preview cho File, tự thu hồi khi đổi/ẩn. */
function usePreviewUrls(items) {
  const urls = useMemo(
    () => items.map((i) => (typeof i === "string" ? i : URL.createObjectURL(i))),
    [items]
  );
  useEffect(
    () => () => urls.forEach((u, i) => typeof items[i] !== "string" && URL.revokeObjectURL(u)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [urls]
  );
  return urls;
}

/** Ô upload: kéo thả hoặc bấm chọn, preview, xóa, kiểm tra loại file / dung lượng / số lượng. */
export default function ImageUpload({
  value = [],
  onChange,
  multiple = false,
  maxFiles = 5,
  maxSizeMB = 5,
  accept = "image/png,image/jpeg,image/webp",
  disabled = false,
  invalid = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const limit = multiple ? maxFiles : 1;
  const urls = usePreviewUrls(value);

  const addFiles = (fileList) => {
    const allowed = accept.split(",").map((s) => s.trim());
    const errs = [];
    const valid = [];
    Array.from(fileList).forEach((file) => {
      if (!allowed.includes(file.type)) errs.push(`"${file.name}": định dạng không được hỗ trợ`);
      else if (file.size > maxSizeMB * 1024 * 1024) errs.push(`"${file.name}": vượt quá ${maxSizeMB}MB`);
      else valid.push(file);
    });

    let next = multiple ? [...value, ...valid] : valid.slice(0, 1).length ? valid.slice(0, 1) : value;
    if (next.length > limit) {
      errs.push(`Chỉ được tải tối đa ${limit} ảnh`);
      next = next.slice(0, limit);
    }
    setError(errs.join(". "));
    if (next !== value) onChange(next);
  };

  const removeAt = (idx) => {
    setError("");
    onChange(value.filter((_, i) => i !== idx));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) addFiles(e.dataTransfer.files);
  };

  const full = value.length >= limit && multiple;

  return (
    <div>
      {!(full || (!multiple && value.length > 0)) && (
        <div
          role="button"
          tabIndex={0}
          className={`border border-2 rounded-3 text-center p-4 ${
            invalid ? "border-danger" : dragging ? "border-primary bg-primary-subtle" : "bg-body-tertiary"
          }`}
          style={{ borderStyle: "dashed", cursor: disabled ? "not-allowed" : "pointer" }}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !disabled && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            !disabled && setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <UploadCloud size={32} className="text-primary mb-2" />
          <div className="fw-medium">Kéo thả ảnh vào đây hoặc bấm để chọn</div>
          <div className="small text-muted">
            JPG, PNG, WEBP • tối đa {maxSizeMB}MB{multiple ? ` • tối đa ${maxFiles} ảnh` : ""}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        disabled={disabled}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = ""; // cho phép chọn lại cùng 1 file
        }}
      />

      {error && (
        <div className="text-danger small mt-2 d-flex align-items-start gap-1">
          <AlertCircle size={14} className="mt-1 flex-shrink-0" /> {error}
        </div>
      )}

      {value.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {value.map((item, idx) => (
            <div
              key={typeof item === "string" ? item : `${item.name}-${item.size}-${idx}`}
              className="position-relative border rounded-3 overflow-hidden bg-light"
              style={{ width: multiple ? 104 : 200, height: multiple ? 104 : 140 }}
            >
              <img src={urls[idx]} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
              {multiple && idx === 0 && (
                <span className="badge text-bg-primary position-absolute bottom-0 start-0 m-1">Ảnh chính</span>
              )}
              {typeof item !== "string" && (
                <span className="badge text-bg-success position-absolute top-0 start-0 m-1">Mới</span>
              )}
              {!disabled && (
                <button
                  type="button"
                  className="btn btn-sm btn-dark position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 22, height: 22 }}
                  title="Xóa ảnh"
                  onClick={() => removeAt(idx)}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Hiển thị ảnh ở chế độ Xem (modal). */
export function ImageGallery({ items = [] }) {
  if (items.length === 0) return <div className="text-muted">—</div>;
  return (
    <div className="d-flex flex-wrap gap-2">
      {items.map((src, i) => (
        <a key={i} href={src} target="_blank" rel="noreferrer" className="border rounded-3 overflow-hidden d-block" style={{ width: 120, height: 90 }}>
          <img src={src} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
        </a>
      ))}
    </div>
  );
}

/** Ô ảnh nhỏ trong bảng: dùng trong columns -> render: (v) => <ImageCell src={v} /> */
export function ImageCell({ src, size = 48, alt = "" }) {
  const list = toImageArray(src).filter((s) => typeof s === "string");
  if (list.length === 0) {
    return (
      <div className="d-inline-flex align-items-center justify-content-center bg-light text-muted rounded-2" style={{ width: size, height: size }}>
        <ImageOff size={size / 2.5} />
      </div>
    );
  }
  return (
    <div className="position-relative d-inline-block">
      <img src={list[0]} alt={alt} className="rounded-2 border" style={{ width: size, height: size, objectFit: "cover" }} />
      {list.length > 1 && (
        <span className="badge text-bg-dark position-absolute bottom-0 end-0" style={{ fontSize: 10 }}>
          +{list.length - 1}
        </span>
      )}
    </div>
  );
}