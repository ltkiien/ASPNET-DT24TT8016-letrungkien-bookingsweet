import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tải dữ liệu 1 lần (và tải lại khi deps đổi hoặc gọi reload()).
 *
 *   const { data, loading, error, reload } = useFetch(() => hotelApi.list(), [], { initial: [] });
 *
 * - loading: chỉ true ở lần tải ĐẦU TIÊN (tải lại không làm bảng nhấp nháy skeleton)
 * - refreshing: true khi đang tải lại
 * - tự bỏ qua kết quả của request cũ nếu deps đổi hoặc component đã unmount (tránh race condition)
 */
export function useFetch(fetcher, deps = [], { initial = null, enabled = true } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const loadedOnce = useRef(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    if (loadedOnce.current) setRefreshing(true);
    else setLoading(true);
    setError(null);

    Promise.resolve()
      .then(() => fetcherRef.current())
      .then((result) => {
        if (cancelled) return;
        setData(result);
        loadedOnce.current = true;
      })
      .catch((e) => !cancelled && setError(e))
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, setData, loading, refreshing, error, reload };
}

/**
 * Tải danh sách + các thao tác CRUD. Sau mỗi thao tác thành công sẽ tải lại danh sách từ server
 * (nên các field do server tính như code, total, id luôn đúng).
 * Lỗi được ném ra để DataTable/modal hiển thị.
 *
 *   const { items, loading, error, reload, create, update, remove } = useCrud(roomApi);
 *   const { items } = useCrud(roomApi, { hotelId });   // truyền params lọc phía server
 */
export function useCrud(api, params) {
  const key = JSON.stringify(params ?? {});
  const { data, loading, refreshing, error, reload } = useFetch(() => api.list(params), [key], { initial: [] });

  const create = async (values) => {
    const result = await api.create(values);
    reload();
    return result;
  };
  const update = async (id, values) => {
    const result = await api.update(id, values);
    reload();
    return result;
  };
  const remove = async (id) => {
    await api.remove(id);
    reload();
  };

  return { items: data ?? [], loading, refreshing, error, reload, create, update, remove };
}