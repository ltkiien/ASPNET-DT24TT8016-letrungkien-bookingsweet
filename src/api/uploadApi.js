
const API_URL = import.meta.env.VITE_BACKEND_URL;

function getToken() {
  const directToken = localStorage.getItem("token");
  if (directToken) return directToken;

  const user = JSON.parse(localStorage.getItem("user") || "null");

  return user?.token || user?.accessToken || "";
}

export async function uploadImage(file) {
  if (!file) {
    throw new Error("Vui lòng chọn hình ảnh.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();

  const response = await fetch(`${API_URL}/Upload/image`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || `Upload ảnh thất bại (${response.status}).`
    );
  }

  return result;
}
