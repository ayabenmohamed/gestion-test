import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post("http://localhost:5000/login", { email, password });

            if (res.data.token) {
                // Stocker le token dans le localStorage
                localStorage.setItem("token", res.data.token);

                // Décoder le token pour obtenir les informations de l'utilisateur
                const decodedToken = JSON.parse(atob(res.data.token.split(".")[1]));

                // Stocker les informations de l'utilisateur dans le localStorage
                localStorage.setItem("user", JSON.stringify({
                    id: decodedToken.id,
                    role: decodedToken.role,
                }));

                alert("✅ Connexion réussie !");
                navigate("/dashboard");
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setError("❌ Ce compte est désactivé. Contactez l'administrateur.");
            } else {
                setError("❌ Email ou mot de passe incorrect");
            }
        }
    };

    const styles = {
        container: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundImage: "url('/photo3.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
        },
        card: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "400px",
        },
        title: {
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "20px",
            textAlign: "left",
            color: "#333",
        },
        inputContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
        },
        input: {
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginBottom: "15px",
            fontSize: "16px",
            width: "100%",
            outline: "none",
        },
        button: {
            backgroundColor: "#007BFF",
            color: "#fff",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            width: "100%",
            transition: "background-color 0.3s ease",
        },
        buttonHover: {
            backgroundColor: "#0056b3",
        },
        errorText: {
            color: "#e74c3c",
            textAlign: "left",
            marginBottom: "10px",
        },
        link: {
            textAlign: "left",
            marginTop: "10px",
            color: "#007BFF",
            cursor: "pointer",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Connexion</h2>

                {error && <p style={styles.errorText}>{error}</p>}

                <form onSubmit={handleLogin} style={styles.inputContainer}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />

                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />

                    <button
                        type="submit"
                        style={styles.button}
                        onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
                        onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;