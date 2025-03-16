import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditUser = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        role: "utilisateur",
        isActive: true,
        password: "",
    });
    const [changePassword, setChangePassword] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://localhost:5000/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data) {
                    setFormData(res.data); // Ensure data exists before setting state
                } else {
                    setMessage("❌ L'utilisateur n'existe pas.");
                }
            } catch (err) {
                setMessage("❌ Erreur lors du chargement de l'utilisateur");
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            const dataToSend = { ...formData };
            if (!changePassword) {
                delete dataToSend.password; // Remove password if not changing
            }

            const res = await axios.put(`http://localhost:5000/users/${id}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 200) {
                setMessage("✅ Utilisateur mis à jour avec succès");
                setTimeout(() => navigate("/management"), 1500);
            }
        } catch (err) {
            setMessage("❌ Erreur lors de la mise à jour de l'utilisateur");
        }
    };

    const handleCancel = () => {
        navigate("/management");
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Modifier un utilisateur</h1>

            {message && (
                <div
                    style={{
                        ...styles.message,
                        backgroundColor: message.includes("❌") ? "#ffebee" : "#e8f5e9",
                        color: message.includes("❌") ? "#c62828" : "#2e7d32",
                    }}
                >
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Prénom</label>
                    <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Nom</label>
                    <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Rôle</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        <option value="utilisateur">Utilisateur</option>
                        <option value="Recruteur">Recruteur</option>
                        <option value="Administrateur">Administrateur</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        <input
                            type="checkbox"
                            checked={changePassword}
                            onChange={() => setChangePassword(!changePassword)}
                        />
                        Changer le mot de passe
                    </label>
                </div>

                {changePassword && (
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Nouveau mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                )}

                <div style={styles.buttonContainer}>
                    <button type="submit" style={styles.buttonPrimary}>
                        Modifier
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={styles.buttonSecondary}
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    title: {
        textAlign: "center",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
    },
    formGroup: {
        marginBottom: "15px",
    },
    label: {
        display: "block",
        marginBottom: "5px",
        fontWeight: "bold",
    },
    input: {
        width: "100%",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "16px",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
        marginTop: "20px",
    },
    buttonPrimary: {
        flex: 1,
        padding: "10px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "16px",
        cursor: "pointer",
    },
    buttonSecondary: {
        flex: 1,
        padding: "10px",
        backgroundColor: "#6c757d",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "16px",
        cursor: "pointer",
    },
    message: {
        padding: "10px",
        borderRadius: "4px",
        marginBottom: "20px",
        textAlign: "center",
    },
};

export default EditUser;
