export const login = async (email, password) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/Auth/login`, {
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