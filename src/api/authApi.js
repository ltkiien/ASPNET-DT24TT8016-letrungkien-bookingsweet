export const login = async (email, password) => {

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/Auth/login`, {
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
        `${import.meta.env.VITE_BACKEND_URL}/Auth/register`,
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
