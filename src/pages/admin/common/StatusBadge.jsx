
const STATUS_MAP = {
  Active: { label: "Hoạt động", color: "success" },
  Inactive: { label: "Ngừng hoạt động", color: "secondary" },
  Available: { label: "Còn trống", color: "success" },
  Occupied: { label: "Đang sử dụng", color: "warning" },
  Pending: { label: "Chờ xác nhận", color: "warning" },
  Confirmed: { label: "Đã xác nhận", color: "primary" },
  Cancelled: { label: "Đã hủy", color: "danger" },
  Completed: { label: "Hoàn thành", color: "success" },
  Paid: { label: "Đã thanh toán", color: "success" },
  Unpaid: { label: "Chưa thanh toán", color: "warning" },
};

export default function StatusBadge({ status, label }) {
  const config = STATUS_MAP[status] ?? {
    label: label ?? status ?? "Không xác định",
    color: "secondary",
  };

  return (
    <span className={`badge text-bg-${config.color}`}>
      {label ?? config.label}
    </span>
  );
}
