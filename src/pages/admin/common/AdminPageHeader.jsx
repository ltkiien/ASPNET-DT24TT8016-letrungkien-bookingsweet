
import { Plus } from "lucide-react";

export default function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon = true,
  children,
}) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h4 className="fw-bold mb-1">{title}</h4>
        {description && (
          <p className="text-muted mb-0">{description}</p>
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        {children}

        {actionLabel && (
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={onAction}
          >
            {actionIcon && <Plus size={18} />}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
