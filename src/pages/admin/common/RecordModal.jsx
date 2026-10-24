import { useEffect, useState } from "react";
import { X, Save, Pencil, Loader2, AlertCircle } from "lucide-react";
import ImageUpload, { ImageGallery, toImageArray } from "./ImageUpload";

const isImageField = (f) => f.type === "image" || f.type === "images";

/**
 * Schema field:
 * {
 *   name, label,
 *   type: "text" | "number" | "email" | "tel" | "date" | "textarea" | "select" | "checkbox",
 *   options: [{ value, label }]      // cho select
 *   required, placeholder, col (1-12, mặc định 6; textarea = 12),
 *   min, max, pattern, patternMessage,
 *   validate: (value, values) => string | undefined,
 *   readOnlyOnEdit: true,            // vd: mã khách sạn không cho sửa
 *   hiddenIn: ["create"|"edit"|"view"],
 *   defaultValue,
 *   viewRender: (value, record) => node
 * }
 */
export default function RecordModal({ mode, title, fields, record, size = "lg", onClose, onSubmit, onEdit }) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const visibleFields = fields.filter((f) => !(f.hiddenIn || []).includes(mode));
  console.log("RecordModal visibleFields:", visibleFields, "record:", record, "mode:", mode);
  
  const [values, setValues] = useState(() => {
    const v = {};
    fields.forEach((f) => {
      const raw = record?.[f.name] ?? f.defaultValue;
      v[f.name] = isImageField(f) ? toImageArray(raw) : raw ?? (f.type === "checkbox" ? false : "");
    });
    return v;
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !submitting && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose, submitting]);

  const setField = (name, value) => {
    setValues((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    visibleFields.forEach((f) => {
      const v = values[f.name];
      const empty = v === "" || v == null || (Array.isArray(v) && v.length === 0);
      if (f.required && (empty || v === false && f.type !== "checkbox")) {
        errs[f.name] = `${f.label} là bắt buộc`;
        return;
      }
      if (empty) return;
      if (f.type === "email" && !/^\S+@\S+\.\S+$/.test(v)) errs[f.name] = "Email không hợp lệ";
      else if (f.type === "number") {
        if (f.min != null && Number(v) < f.min) errs[f.name] = `Giá trị tối thiểu là ${f.min}`;
        if (f.max != null && Number(v) > f.max) errs[f.name] = `Giá trị tối đa là ${f.max}`;
      } else if (f.pattern && !new RegExp(f.pattern).test(v)) {
        errs[f.name] = f.patternMessage || `${f.label} không đúng định dạng`;
      }
      const custom = f.validate?.(v, values);
      if (!errs[f.name] && custom) errs[f.name] = custom;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (isView || !validate()) return;
    setSubmitting(true);
    setServerError("");
    try {
      const payload = { ...values };
      fields.forEach((f) => {
        if (f.type === "number" && payload[f.name] !== "") payload[f.name] = Number(payload[f.name]);
        // ảnh đơn: File | string(URL cũ) | null(đã xóa); nhiều ảnh: mảng (File | string)
        if (f.type === "image") payload[f.name] = payload[f.name][0] ?? null;
      });
      await onSubmit(payload);
    } catch (err) {
      setServerError(err?.message || "Đã có lỗi xảy ra, vui lòng thử lại");
      setSubmitting(false);
    }
  };

  const renderViewValue = (f) => {
    const v = record?.[f.name];
    if (f.viewRender) return f.viewRender(v, record);
    if (isImageField(f)) return <ImageGallery items={toImageArray(v)} />;
    if (f.type === "checkbox") return v ? "Có" : "Không";
    if (f.type === "select") return f.options?.find((o) => String(o.value) === String(v))?.label ?? v ?? "—";
    return v === "" || v == null ? "—" : String(v);
  };

  const renderInput = (f) => {
    const invalid = !!errors[f.name];
    const common = {
      id: `f-${f.name}`,
      name: f.name,
      disabled: submitting || (isEdit && f.readOnlyOnEdit),
      className: `form-control ${invalid ? "is-invalid" : ""}`,
      placeholder: f.placeholder,
    };
    switch (f.type) {
      case "image":
      case "images":
        return (
          <ImageUpload
            value={values[f.name]}
            onChange={(arr) => setField(f.name, arr)}
            multiple={f.type === "images"}
            maxFiles={f.maxFiles}
            maxSizeMB={f.maxSizeMB}
            accept={f.accept}
            disabled={common.disabled}
            invalid={invalid}
          />
        );
      case "textarea":
        return <textarea {...common} rows={3} value={values[f.name]} onChange={(e) => setField(f.name, e.target.value)} />;
      case "select":
        return (
          <select {...common} className={`form-select ${invalid ? "is-invalid" : ""}`} value={values[f.name]} onChange={(e) => setField(f.name, e.target.value)}>
            <option value="">-- Chọn --</option>
            {typeof f.options === "function" ? f.options(values).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            )) : f.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="form-check form-switch mt-2">
            <input {...common} type="checkbox" className="form-check-input" checked={!!values[f.name]} onChange={(e) => setField(f.name, e.target.checked)} />
          </div>
        );
      default:
        return (
          <input
            {...common}
            type={f.type || "text"}
            min={f.min}
            max={f.max}
            value={values[f.name]}
            onChange={(e) => setField(f.name, e.target.value)}
          />
        );
    }
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && !submitting && onClose()}>
        <div className={`modal-dialog modal-${size} modal-dialog-centered modal-dialog-scrollable`}>
          <form className="modal-content border-0 shadow" onSubmit={submit} noValidate>
            <div className="modal-header">
              <h5 className="modal-title fw-semibold">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={submitting} aria-label="Đóng" />
            </div>

            <div className="modal-body">
              {serverError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
                  <AlertCircle size={16} /> {serverError}
                </div>
              )}
              <div className="row g-3">
                {visibleFields.map((f) => {
                  const col = f.col || (f.type === "textarea" || isImageField(f) ? 12 : 6);
                  return (
                    <div key={f.name} className={`col-12 col-md-${col}`}>
                      <label htmlFor={`f-${f.name}`} className="form-label fw-medium mb-1">
                        {f.label}
                        {!isView && f.required && <span className="text-danger ms-1">*</span>}
                      </label>
                      {isView ? (
                        <div className="form-control-plaintext border-bottom pb-1">{renderViewValue(f)}</div>
                      ) : (
                        <>
                          {renderInput(f)}
                          {errors[f.name] && <div className="invalid-feedback d-block">{errors[f.name]}</div>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light d-flex align-items-center gap-1" onClick={onClose} disabled={submitting}>
                <X size={16} /> {isView ? "Đóng" : "Hủy"}
              </button>
              {isView && onEdit && (
                <button type="button" className="btn btn-primary d-flex align-items-center gap-1" onClick={onEdit}>
                  <Pencil size={16} /> Chỉnh sửa
                </button>
              )}
              {!isView && (
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-1" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                  {isEdit ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
      <style>{`.spin{animation:dt-spin 1s linear infinite}@keyframes dt-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}