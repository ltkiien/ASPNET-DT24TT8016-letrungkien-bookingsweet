
import { useEffect, useState } from "react";
import {createRoom, getAllRooms, updateRoom} from "../../api/roomsApi";
import DataTable from "./common/DataTable";
import AdminPageContainer from "./layout/AdminPageContainer";
import AdminPageHeader from "./common/AdminPageHeader";

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
  { name: "name", label: "Tên khách sạn", required: true },
  { name: "city", label: "Thành phố", required: true },
  { name: "starRating", label: "Hạng sao", type: "select", required: true, options: [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n} sao` })) },
  { name: "phone", label: "Điện thoại", type: "tel", pattern: "^[0-9+\\s-]{8,15}$", patternMessage: "Số điện thoại không hợp lệ" },
  { name: "email", label: "Email", type: "email" },
  { name: "status", label: "Trạng thái", type: "select", required: true, defaultValue: "active", options: Object.entries(statusMap).map(([value, { label }]) => ({ value, label })) },
  { name: "address", label: "Địa chỉ", type: "textarea" },
];

const columns = [
  { key: "code", label: "Mã", width: 110 },
  { key: "name", label: "Tên khách sạn", render: (v) => <span className="fw-medium">{v}</span> },
  { key: "city", label: "Thành phố" },
  { key: "starRating", label: "Hạng sao", align: "center", render: (v) => "★".repeat(v) },
  { key: "phone", label: "Điện thoại", sortable: false },
  { key: "status", label: "Trạng thái", align: "center", render: (v) => <StatusBadge value={v} /> },
];


function RoomManagement() {
    const [rooms, setRooms] = useState([]);

    const loads = async () => {
        const data = await getAllRooms();
        setRooms(data);
    }

    useEffect(() => {
    loads();
  }, []);

    const handleCreate = async (payload) => {
        const result = await createRoom(payload);
        const newRoom = result?.data;
        if (!newRoom) {
        throw new Error("API không trả về thông tin phòng.");
        }
        loads();
    };

    const handleUpdate = async (payload) => {
        const result = await updateRoom(payload.id, payload);
        const newRoom = result?.data;
        console.log("API response:", result);
        if (!newRoom) {
        throw new Error("API không trả về thông tin phòng.");
        }
        setRooms((prev) => [newRoom, ...prev]);
    };

    const handleDelete = () => {

        if (!confirmed) return;

        setRooms(prev =>
            prev.filter(h => h.id !== room.id)
        );

        setSelected(null);
    };

    return (
        <AdminPageContainer
            title="Quản lý phòng"
            subtitle="Quản lý thông tin, trạng thái và danh sách phòng."
            breadcrumbs={[
                {
                    label: "Quản trị",
                    href: "/admin",
                },
                {
                    label: "phòng",
                },
            ]}
        >
            <AdminPageHeader />
            <DataTable
                columns={columns}
                fields={fields}
                data={rooms}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                deleteLabel={(row) => row.name}
            />
        </AdminPageContainer>
    );
}

export default RoomManagement;
