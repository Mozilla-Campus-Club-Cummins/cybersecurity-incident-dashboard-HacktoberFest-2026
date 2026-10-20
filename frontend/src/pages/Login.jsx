import { useState } from "react";
import api from "../services/api";
import "./Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();

        if (isLoading) return;

        setMessage("");
        setIsLoading(true);

        try {
            const body = new URLSearchParams();
            body.append("username", username);
            body.append("password", password);

            const response = await api.post("/login", body);

            if (!response.data?.access_token) {
                setMessage("Unable to complete login. Please try again.");
                return;
            }

            localStorage.setItem("token", response.data.access_token);
            window.location.href = "/dashboard";
        } catch (error) {
            const status = error.response?.status;

            if (status === 400 || status === 401 || status === 403) {
                setMessage("Incorrect username or password. Please try again.");
            } else if (!error.response) {
                setMessage(
                    "Unable to connect to the server. Please check your connection and try again."
                );
            } else if (status >= 500) {
                setMessage(
                    "The server is temporarily unavailable. Please try again later."
                );
            } else {
                setMessage("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
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
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setMessage("");
                        }}
                        required
                        disabled={isLoading}
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
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setMessage("");
                        }}
                        required
                        disabled={isLoading}
                    />
                </div>

                {message && (
                    <div className="login-error" role="alert">
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    className="add-button login-submit"
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </main>
    );
}

export default Login;