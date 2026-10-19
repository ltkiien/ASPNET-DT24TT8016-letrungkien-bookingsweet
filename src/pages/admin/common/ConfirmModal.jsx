import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export default function ConfirmModal({ title, message, confirmText = "Xác nhận", onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (eConfirmModal) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose, loading]);

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(err?.message || "Không thể thực hiện, vui lòng thử lại");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="alertdialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && !loading && onClose()}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-body text-center p-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger mb-3" style={{ width: 64, height: 64 }}>
                <AlertTriangle size={32} />
              </div>
              <h5 className="fw-semibold">{title}</h5>
              <p className="text-muted mb-0">{message}</p>
              {error && <div className="alert alert-danger py-2 mt-3 mb-0">{error}</div>}
            </div>
            <div className="modal-footer justify-content-center border-0 pt-0 pb-4">
              <button className="btn btn-light px-4" onClick={onClose} disabled={loading}>Hủy</button>
              <button className="btn btn-danger px-4 d-flex align-items-center gap-1" onClick={handleConfirm} disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />} {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
      <style>{`.spin{animation:dt-spin 1s linear infinite}@keyframes dt-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}