
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="admin-pagination">
      <span className="text-secondary small">
        Hiển thị {start} – {end} / {totalItems}
      </span>

      <div className="d-flex gap-1">
        <button
          className="admin-page-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className={`admin-page-btn ${
              currentPage === n ? "active" : ""
            }`}
            onClick={() => onPageChange(n)}
          >
            {n}
          </button>
        ))}

        <button
          className="admin-page-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
