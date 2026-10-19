
export default function StatsCards({
  title,
  value,
  icon: Icon,
  color = "primary",
  description,
}) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div
          className={`rounded-3 bg-${color}-subtle text-${color} p-3`}
        >
          {Icon && <Icon size={24} />}
        </div>

        <div className="min-w-0">
          <p className="text-muted mb-1">{title}</p>
          <h4 className="fw-bold mb-1">{value ?? 0}</h4>
          {description && (
            <small className="text-muted">{description}</small>
          )}
        </div>
      </div>
    </div>
  );
}
