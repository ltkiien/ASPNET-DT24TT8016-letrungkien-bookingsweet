const token = localStorage.getItem("token");

const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/Admin/dashboard`,
    {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);