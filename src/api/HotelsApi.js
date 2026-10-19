const API_URL = `${import.meta.env.VITE_BACKEND_URL}/Hotels`;

function getToken() {
  const directToken = localStorage.getItem("token");
  if (directToken) return directToken;

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  return user?.token || user?.accessToken || "";
}

export async function createHotel(hotelData) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(hotelData),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const validationErrors = result?.errors
      ? Object.values(result.errors).flat().join(" ")
      : "";

    throw new Error(
      validationErrors ||
      result?.message ||
      result?.title ||
      `Không thể thêm khách sạn (HTTP ${response.status}).`
    );
  }

  return result;
}

export async function getAllHotels() {
  const token = getToken();

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
      result?.title ||
      `Không thể lấy danh sách khách sạn (HTTP ${response.status})`
    );
  }

  // Hỗ trợ cả response dạng { data: [...] } và trả về mảng trực tiếp
  return Array.isArray(result) ? result : result?.data ?? [];
}

export async function updateHotel(id, hotelData) {
  const token = getToken();
  const response = await fetch(
    `http://localhost:5198/api/Hotels/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(hotelData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Cập nhật khách sạn thất bại"
    );
  }

  return result;
}

export const deleteHotel = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || `Xóa khách sạn thất bại (${response.status})`
    );
  }

  return result;
};