
import { AlertTriangle } from "lucide-react";

export default function ConfirmDeleteModal({
  show,
  title = "Xác nhận xóa",
  message,
  itemName,
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!show) return null;

  return (
    <div className="admin-modal-overlay">
      <section
        className="admin-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="admin-modal-body">
          <AlertTriangle size={32} color="#dc3545" />

          <h5 id="confirm-delete-title" className="mt-3 fw-bold">
            {title}
          </h5>

          <p>{message || "Bạn có chắc chắn muốn xóa mục này?"}</p>

          {itemName && (
            <div className="bg-light rounded p-3 fw-semibold">
              {itemName}
            </div>
          )}
        </div>

        <div className="admin-modal-footer">
          <button
            className="btn btn-light border"
            disabled={loading}
            onClick={onClose}
          >
            Hủy
          </button>

          <button
            className="btn btn-danger"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Đang xử lý..." : "Xác nhận xóa"}
          </button>
        </div>
      </section>
    </div>
  );
}
