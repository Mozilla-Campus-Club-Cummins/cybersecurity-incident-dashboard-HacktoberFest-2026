import { useState } from "react";
import api from "../services/api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setMessage("");

        try {
            const body = new URLSearchParams();
            body.append("username", username);
            body.append("password", password);

            const response = await api.post("/login", body);

            localStorage.setItem("token", response.data.access_token);
            window.location.href = "/dashboard";
        } catch (error) {
            console.error("Login failed:", error);

            setMessage(
                error.response?.data?.detail ||
                "Login request failed. Please try again."
            );
        }
    }

    return (
        <main>
            <h1>AI Cybersecurity Incident Dashboard</h1>

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="login-username">Username</label>
                    <input
                        id="login-username"
                        type="text"
                        name="username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="add-button">
                    Login
                </button>

                {message && (
                    <p className="error" role="alert">
                        {message}
                    </p>
                )}
            </form>
        </main>
    );
}

export default Login;