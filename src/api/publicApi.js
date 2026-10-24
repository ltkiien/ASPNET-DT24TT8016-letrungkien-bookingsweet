const API_URL = import.meta.env.VITE_BACKEND_URL;

export async function getHotels() {
  const response = await fetch(`${API_URL}/Hotels/public`);

  if (!response.ok) {
    throw new Error("Không thể tải danh sách khách sạn");
  }

  return response.json();
}

export async function getRoomsByHotel(hotelId) {
    
  const response = await fetch(
    `${API_URL}/hotels/${hotelId}/rooms`
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách phòng");
  }

  return response.json();
}
export async function getRooms() {
    
  const response = await fetch(
    `${API_URL}/Rooms/public`
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách phòng");
  }

  return response.json();
}

export async function getOccupiedRooms() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/Rooms/public/occupied`
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách phòng đang có người ở");
  }

  return response.json();
}