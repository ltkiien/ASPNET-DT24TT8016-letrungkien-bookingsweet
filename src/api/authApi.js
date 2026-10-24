const API_URL = import.meta.env.VITE_BACKEND_URL + "/Auth";
export const login = async (email, password) => {


    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
    }

    return data;
};

export const register = async (
    fullName,
    email,
    password,
    phone
) => {
    const response = await fetch(
        `${API_URL}/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullName,
                email,
                password,
                phone,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Đăng ký thất bại"
        );
    }

    return data;
};


export async function logoutApi() {
  const token = getToken();

  try {
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export async function getMe() {
  const token =
    localStorage.getItem("token") ||
    JSON.parse(localStorage.getItem("user") || "null")?.token ||
    JSON.parse(localStorage.getItem("user") || "null")?.accessToken;
  if (!token) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông tin tài khoản.");
  }

  return response.json();
}