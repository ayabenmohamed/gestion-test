import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "utilisateur",
        isActive: true,
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérifier la confirmation du mot de passe
        if (formData.password !== formData.confirmPassword) {
            setMessage("❌ Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/signup",
                {
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    isActive: formData.isActive,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 201) {
                setMessage("✅ Utilisateur ajouté avec succès !");
                setTimeout(() => {
                    navigate("/management"); // Redirection vers la page de gestion
                }, 1500);
            }
        } catch (err) {
            if (err.response?.status === 400) {
                setMessage("❌ Cet email est déjà utilisé.");
            } else {
                setMessage("❌ Erreur lors de l'ajout de l'utilisateur.");
            }
        }
    };

    const handleCancel = () => {
        navigate("/management"); // Redirection vers la page de gestion
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Ajouter un utilisateur</h1>

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
                    <label style={styles.label}>Mot de passe</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Confirmer le mot de passe</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
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

                <div style={styles.buttonGroup}>
                    <button type="submit" style={styles.button}>
                        Ajouter
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{ ...styles.button, backgroundColor: "#6c757d" }}
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

// Styles pour le composant
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
    button: {
        width: "48%",
        padding: "10px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "16px",
        cursor: "pointer",
        marginTop: "10px",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
    },
    message: {
        padding: "10px",
        borderRadius: "4px",
        marginBottom: "20px",
        textAlign: "center",
    },
};

export default AddUser;