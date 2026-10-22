const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

const ROOMS_URL = `${API_BASE_URL}/rooms`;

function getToken() {
  const directToken = localStorage.getItem("token");
  if (directToken) return directToken;

  const user = JSON.parse(localStorage.getItem("user") || "null");

  return user?.token || user?.accessToken || "";
}

function getAuthHeaders(token, includeContentType = true) {
  return {
    ...(includeContentType ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response, errorMessage) {
  const result = await response.json().catch(() => null);
  console.log("API response:", result);

  if (!response.ok) {
    const validationErrors = result?.errors
      ? Object.values(result.errors).flat().join(" ")
      : "";

    throw new Error(
      validationErrors ||
      result?.message ||
      result?.title ||
      `${errorMessage} (HTTP ${response.status}).`
    );
  }
  console.log("API response:", result);


  return result;
}

// GET ALL ROOMS
// GET /api/rooms
export async function getAllRooms() {
  const token = getToken();

  const response = await fetch(ROOMS_URL, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  const result = await handleResponse(
    response,
    "Không thể lấy danh sách phòng"
  );

  return Array.isArray(result) ? result : result?.data ?? [];
}

// GET ROOMS BY HOTEL
// GET /api/hotels/{hotelId}/rooms
export async function getRoomsByHotel(hotelId) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/hotels/${hotelId}/rooms`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );

  const result = await handleResponse(
    response,
    "Không thể lấy danh sách phòng của khách sạn"
  );

  return Array.isArray(result) ? result : result?.data ?? [];
}

// GET ROOM BY ID
// GET /api/hotels/{hotelId}/rooms/{roomId}
export async function getRoomById(hotelId, roomId) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/hotels/${hotelId}/rooms/${roomId}`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );

  return await handleResponse(
    response,
    "Không thể lấy thông tin phòng"
  );
}

// CREATE ROOM
// POST /api/hotels/{hotelId}/rooms
export async function createRoom(hotelId, roomData) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/hotels/${hotelId}/rooms`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(roomData),
    }
  );

  return await handleResponse(
    response,
    "Không thể thêm phòng"
  );
}

// UPDATE ROOM
// PUT /api/hotels/{hotelId}/rooms/{roomId}
export async function updateRoom(hotelId, roomId, roomData) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/hotels/${hotelId}/rooms/${roomId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(roomData),
    }
  );

  return await handleResponse(
    response,
    "Không thể cập nhật phòng"
  );
}

// DELETE ROOM
// DELETE /api/hotels/{hotelId}/rooms/{roomId}
export async function deleteRoom(hotelId, roomId) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/hotels/${hotelId}/rooms/${roomId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(token, false),
    }
  );

  return await handleResponse(
    response,
    "Không thể xóa phòng"
  );
}
