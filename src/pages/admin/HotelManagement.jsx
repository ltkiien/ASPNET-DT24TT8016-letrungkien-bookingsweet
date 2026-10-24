
import { useEffect, useMemo, useState } from "react";
import {createHotel, deleteHotel, getAllHotels, updateHotel} from "../../api/HotelsApi";
import DataTable from "./common/DataTable";
import AdminPageContainer from "./layout/AdminPageContainer";
import AdminPageHeader from "./common/AdminPageHeader";
import { uploadImage } from "../../api/uploadApi";

const statusMap = {
  active: { label: "Hoạt động", cls: "success" },
  inactive: { label: "Tạm ngưng", cls: "secondary" },
};

const StatusBadge = ({ value }) => {
  const s = statusMap[value] || { label: value, cls: "light" };
  return <span className={`badge rounded-pill text-bg-${s.cls}`}>{s.label}</span>;
};

const fields = [
//   { name: "code", label: "Mã khách sạn", required: true, readOnlyOnEdit: true },
    {name: "id", label: "ID", hiddenIn: ["create", "edit"]},
  { name: "name", label: "Tên khách sạn", required: true },
  { name: "city", label: "Thành phố", required: true },
  { name: "starRating", label: "Hạng sao", type: "select", required: true, options: [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n} sao` })) },
  { name: "phone", label: "Điện thoại", type: "tel", pattern: "^[0-9+\\s-]{8,15}$", patternMessage: "Số điện thoại không hợp lệ" },
  { name: "email", label: "Email", type: "email" },
  { name: "status", label: "Trạng thái", type: "select", required: true, defaultValue: "active", options: Object.entries(statusMap).map(([value, { label }]) => ({ value, label })) },
  { name: "address", label: "Địa chỉ", type: "textarea" },
  { name: "imageUrl", label: "Ảnh đại diện", type: "image", maxSizeMB: 5 },
  { name: "gallery", label: "Thư viện ảnh", type: "images", maxFiles: 8 },
];

const columns = [
  { key: "code", label: "Mã", width: 110 },
  { key: "name", label: "Tên khách sạn", render: (v) => <span className="fw-medium">{v}</span> },
  { key: "city", label: "Thành phố" },
  { key: "starRating", label: "Hạng sao", align: "center", render: (v) => "★".repeat(v) },
  { key: "phone", label: "Điện thoại", sortable: false },
  { key: "status", label: "Trạng thái", align: "center", render: (v) => <StatusBadge value={v} /> },
];


function HotelManagement() {
    const [hotels, setHotels] = useState([]);

    const loadHotels = async () => {
        const data = await getAllHotels();
        setHotels(data);
    }

    useEffect(() => {
    loadHotels();
  }, []);
  const resolvedHotelImage = async (payload) => {
    return await Promise.all(
      payload.gallery.map(async (file) => {
        if (typeof file === "string") {
          return file; // giữ nguyên URL cũ
        }
        const result = await uploadImage(file);
            return result.url;
        }));
    };

    const handleCreate = async (payload) => {
        const newPayload = { ...payload, gallery: await resolvedHotelImage(payload) };
        const result = await createHotel(newPayload);
        const newHotel = result?.data;
        if (!newHotel) {
        throw new Error("API không trả về thông tin khách sạn.");
        }
        loadHotels();
    };

    const handleUpdate = async (payload) => {
        const newPayload = { ...payload, gallery: await resolvedHotelImage(payload) };
        const result = await updateHotel(payload.id, newPayload);
        const newHotel = result?.data;
        if (!newHotel) {
        throw new Error("API không trả về thông tin khách sạn.");
        }
        setHotels((list) => list.map((r) => (r.id === payload.id ? { ...r, ...newPayload, id: payload.id } : r)));
    };

    const handleDelete = async (hotel) => {

        await deleteHotel(hotel.id);
        setHotels(prev =>
            prev.filter(h => h.id !== hotel.id)
        );

    };

    return (
        <AdminPageContainer
            title="Quản lý khách sạn"
            subtitle="Quản lý thông tin, trạng thái và danh sách khách sạn."
            breadcrumbs={[
                {
                    label: "Quản trị",
                    href: "/admin",
                },
                {
                    label: "Khách sạn",
                },
            ]}
        >
            <AdminPageHeader />
            <DataTable
                columns={columns}
                fields={fields}
                data={hotels}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                deleteLabel={(row) => row.name}
            />
        </AdminPageContainer>
    );
}

export default HotelManagement;
