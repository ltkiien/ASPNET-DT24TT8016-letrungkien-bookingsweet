
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/Bookings`;

function getToken() {
  const directToken = localStorage.getItem("token");
  if (directToken) return directToken;

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  return user?.token || user?.accessToken || "";
}

async function request(url, options = {}) {
  const token = getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || `Yêu cầu thất bại (${response.status})`
    );
  }

  return result;
}

export function createBookings(data) {
  return request(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyBookings() {
  return request(`${API_URL}/my-bookings`);
}

export function getBookingById(id) {
  return request(`${API_URL}/${id}`);
}

export function cancelBooking(id) {
  return request(`${API_URL}/${id}/cancel`, {
    method: "PUT",
  });
}

export function getAllBookings() {
  return request(API_URL);
}
