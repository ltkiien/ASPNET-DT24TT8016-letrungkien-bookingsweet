import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  RefreshCw,
} from "lucide-react";
import RecordModal from "./RecordModal";
import ConfirmModal from "./ConfirmModal";

/**
 * DataTable - bảng dùng chung cho các trang quản trị (Hotel, Rooms, Booking...)
 *
 * Props
 * - title, subtitle        : tiêu đề trang / mô tả
 * - columns                : [{ key, label, sortable, searchable, width, align, className, render(value,row), accessor(row) }]
 * - data                   : mảng dữ liệu
 * - fields                 : schema form (xem RecordModal)
 * - rowKey                 : tên khóa chính (mặc định "id")
 * - loading                : hiển thị skeleton
 * - onCreate(values)       : async, thêm mới
 * - onUpdate(values, row)  : async, cập nhật
 * - onDelete(row)          : async, xóa
 * - onRefresh()            : nút làm mới (tuỳ chọn)
 * - permissions            : { create, view, edit, delete } (mặc định true)
 * - pageSizeOptions        : mặc định [5, 10, 20, 50]
 * - entityName             : tên đối tượng, vd "khách sạn" -> "Thêm khách sạn"
 * - deleteLabel(row)       : text hiển thị trong modal xác nhận xóa
 * - toolbarExtra           : node chèn thêm vào toolbar (filter, export...)
 */
export default function DataTable({
  title,
  subtitle,
  columns = [],
  data = [],
  fields = [],
  rowKey = "id",
  loading = false,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
  permissions,
  pageSizeOptions = [5, 10, 20, 50],
  entityName = "bản ghi",
  deleteLabel,
  toolbarExtra,
  modalSize = "lg",
}) {
  const can = { create: true, view: true, edit: true, delete: true, ...permissions };
  const hasActions =
    (can.view && fields.length > 0) ||
    (can.edit && onUpdate) ||
    (can.delete && onDelete);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[1] ?? 10);
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit'|'view', record }
  const [toDelete, setToDelete] = useState(null);

  const getValue = (row, col) =>
    col.accessor ? col.accessor(row) : row[col.key];

  // ---- search ----
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      columns.some((c) => {
        if (c.searchable === false || c.key === "__actions") return false;
        const v = getValue(row, c);
        return v != null && String(v).toLowerCase().includes(q);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, search, columns]);

  // ---- sort ----
  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = getValue(a, col);
      const vb = getValue(b, col);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), "vi", { numeric: true }) * dir;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, columns]);

  // ---- pagination ----
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  useEffect(() => setPage(1), [search, pageSize]);

  const toggleSort = (col) => {
    if (col.sortable === false) return;
    setSort((s) =>
      s.key !== col.key
        ? { key: col.key, dir: "asc" }
        : s.dir === "asc"
        ? { key: col.key, dir: "desc" }
        : { key: null, dir: "asc" }
    );
  };

  const SortIcon = ({ col }) => {
    if (col.sortable === false) return null;
    if (sort.key !== col.key) return <ChevronsUpDown size={14} className="ms-1 text-muted" />;
    return sort.dir === "asc" ? (
      <ChevronUp size={14} className="ms-1 text-primary" />
    ) : (
      <ChevronDown size={14} className="ms-1 text-primary" />
    );
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const colSpan = columns.length + (hasActions ? 1 : 0);

  const handleSubmit = async (values) => {
    if (modal.mode === "create") await onCreate?.(values);
    else await onUpdate?.(values, modal.record);
    setModal(null);
  };

  return (
    <div className="card border-0 shadow-sm">
      {/* Header */}
      <div className="card-header bg-white border-bottom py-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            {title && <h5 className="mb-0 fw-semibold">{title}</h5>}
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="input-group" style={{ width: 260 }}>
              <span className="input-group-text bg-white">
                <Search size={16} />
              </span>
              <input
                type="search"
                className="form-control border-start-0"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {toolbarExtra}
            {onRefresh && (
              <button className="btn btn-outline-secondary d-flex align-items-center" onClick={onRefresh} title="Làm mới">
                <RefreshCw size={16} />
              </button>
            )}
            {can.create && onCreate && (
              <button
                className="btn btn-primary d-flex align-items-center gap-1"
                onClick={() => setModal({ mode: "create", record: null })}
              >
                <Plus size={16} /> Thêm {entityName}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: 56 }} className="text-center">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, cursor: col.sortable === false ? "default" : "pointer", whiteSpace: "nowrap" }}
                  className={`text-${col.align || "start"} user-select-none ${col.className || ""}`}
                  onClick={() => toggleSort(col)}
                >
                  <span className="d-inline-flex align-items-center">
                    {col.label}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
              {hasActions && <th className="text-center" style={{ width: 140 }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={colSpan + 1}>
                    <div className="placeholder-glow">
                      <span className="placeholder col-12 rounded" style={{ height: 20 }} />
                    </div>
                  </td>
                </tr>
              ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan + 1} className="text-center text-muted py-5">
                  <Inbox size={40} className="mb-2 opacity-50" />
                  <div>{search ? "Không tìm thấy kết quả phù hợp" : "Chưa có dữ liệu"}</div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, idx) => (
                <tr key={row[rowKey] ?? idx}>
                  <td className="text-center text-muted">{start + idx + 1}</td>
                  {columns.map((col) => {
                    const value = getValue(row, col);
                    return (
                      <td key={col.key} className={`text-${col.align || "start"} ${col.className || ""}`}>
                        {col.render ? col.render(value, row) : value ?? "—"}
                      </td>
                    );
                  })}
                  {hasActions && (
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        {can.view && fields.length > 0 && (
                          <button className="btn btn-outline-info" title="Xem" onClick={() => setModal({ mode: "view", record: row })}>
                            <Eye size={15} />
                          </button>
                        )}
                        {can.edit && onUpdate && (
                          <button className="btn btn-outline-primary" title="Sửa" onClick={() => setModal({ mode: "edit", record: row })}>
                            <Pencil size={15} />
                          </button>
                        )}
                        {can.delete && onDelete && (
                          <button className="btn btn-outline-danger" title="Xóa" onClick={() => setToDelete(row)}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="card-footer bg-white border-top py-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <span>Hiển thị</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 80 }}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>
              {total === 0 ? 0 : start + 1}–{Math.min(start + pageSize, total)} / {total} bản ghi
            </span>
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(1)}><ChevronsLeft size={14} /></button>
              </li>
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(currentPage - 1)}><ChevronLeft size={14} /></button>
              </li>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <li key={`d${i}`} className="page-item disabled"><span className="page-link">…</span></li>
                ) : (
                  <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                  </li>
                )
              )}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(currentPage + 1)}><ChevronRight size={14} /></button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(totalPages)}><ChevronsRight size={14} /></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <RecordModal
          mode={modal.mode}
          title={
            modal.mode === "create"
              ? `Thêm ${entityName}`
              : modal.mode === "edit"
              ? `Chỉnh sửa ${entityName}`
              : `Chi tiết ${entityName}`
          }
          fields={fields}
          record={modal.record}
          size={modalSize}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          onEdit={can.edit && onUpdate ? () => setModal({ mode: "edit", record: modal.record }) : undefined}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title={`Xóa ${entityName}`}
          message={
            <>
              Bạn có chắc chắn muốn xóa{" "}
              <strong>{deleteLabel ? deleteLabel(toDelete) : `${entityName} này`}</strong>? Hành động này không thể hoàn tác.
            </>
          }
          confirmText="Xóa"
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            await onDelete(toDelete);
            setToDelete(null);
          }}
        />
      )}
    </div>
  );
}