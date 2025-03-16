import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Management = () => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Récupérer la liste des utilisateurs
    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Vous devez être connecté !");
                navigate("/");
                return;
            }

            const res = await axios.get("http://localhost:5000/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        } catch (err) {
            setMessage("❌ Erreur lors du chargement des utilisateurs");
        }
    }, [navigate]);

    // Activer/Désactiver un utilisateur
    const toggleUserStatus = async (userId, currentStatus) => {
        // Message de confirmation
        const confirmAction = window.confirm(
            currentStatus
                ? "Êtes-vous sûr de vouloir désactiver cet utilisateur ?"
                : "Êtes-vous sûr de vouloir activer cet utilisateur ?"
        );

        // Si l'utilisateur annule, ne rien faire
        if (!confirmAction) return;

        try {
            const userToToggle = users.find((user) => user.id === userId);

            // Empêcher l'activation/désactivation de l'admin
            if (userToToggle.role === "admin") {
                setMessage("⛔ Vous ne pouvez pas modifier le statut d'un administrateur.");
                return;
            }

            const newStatus = !currentStatus;
            const token = localStorage.getItem("token");

            await axios.put(
                `http://localhost:5000/users/${userId}/status`,
                { isActive: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, isActive: newStatus } : user
                )
            );

            setMessage(newStatus ? "✅ Utilisateur activé !" : "❌ Utilisateur désactivé !");
        } catch (err) {
            if (err.response?.status === 403) {
                setMessage("⛔ Vous n'avez pas la permission de modifier cet utilisateur");
            } else {
                setMessage("❌ Erreur lors de la mise à jour du statut !");
            }
        }
    };

    // Supprimer un utilisateur (sauf l'admin)
    const handleDeleteUser = async (userId) => {
        // Confirmation avant suppression
        const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");
        if (!confirmDelete) return;

        try {
            const userToDelete = users.find((user) => user.id === userId);

            // Empêcher la suppression de l'admin
            if (userToDelete.role === "admin") {
                setMessage("⛔ Vous ne pouvez pas supprimer un administrateur.");
                return;
            }

            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("✅ Utilisateur supprimé avec succès !");
            fetchUsers(); // Rafraîchir la liste après suppression
        } catch (err) {
            if (err.response?.status === 403) {
                setMessage("⛔ Vous n'avez pas la permission de supprimer cet utilisateur");
            } else {
                setMessage("❌ Erreur lors de la suppression de l'utilisateur");
            }
        }
    };

    // Rediriger vers la page d'ajout d'utilisateur
    const handleAddUser = () => {
        navigate("/add-user");
    };

    // Rediriger vers la page de modification d'utilisateur
    const handleEditUser = (user) => {
        navigate(`/edit-user/${user.id}`);
    };

    // Filtrer les utilisateurs en fonction du terme de recherche
    const filteredUsers = users.filter((user) =>
        `${user.firstname} ${user.lastname} ${user.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    // Limiter l'affichage à 20 utilisateurs
    const displayedUsers = filteredUsers.slice(0, 20);

    // Charger les utilisateurs au montage du composant
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vous devez être connecté !");
            navigate("/");
        } else {
            fetchUsers();
        }
    }, [fetchUsers, navigate]);

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Gestion des utilisateurs</h1>

            {/* Bouton Ajouter un utilisateur */}
            <button
                onClick={handleAddUser}
                style={styles.addButton}
            >
                Ajouter un utilisateur
            </button>

            {/* Barre de recherche */}
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            {/* Affichage des messages */}
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

            {/* Avertissement si la liste est tronquée */}
            {filteredUsers.length > 20 && (
                <div style={{ ...styles.message, backgroundColor: "#fff3cd", color: "#856404" }}>
                    ⚠️ Seuls les 20 premiers utilisateurs sont affichés. Utilisez la recherche pour affiner les résultats.
                </div>
            )}

            {/* Tableau des utilisateurs */}
            <h2>Liste des utilisateurs</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Nom</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Rôle</th>
                        <th style={styles.th}>Statut</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedUsers.map((user) => (
                        <tr key={user.id} style={styles.tr}>
                            <td style={styles.td}>{user.firstname} {user.lastname}</td>
                            <td style={styles.td}>{user.email}</td>
                            <td style={styles.td}>{user.role}</td>
                            <td style={styles.td}>
                                {user.isActive ? (
                                    <span style={{ color: "green" }}>Actif</span>
                                ) : (
                                    <span style={{ color: "red" }}>Désactivé</span>
                                )}
                            </td>
                            <td style={styles.td}>
                                <div style={styles.actions}>
                                    {/* Bouton Modifier */}
                                    {user.role !== "admin" && (
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            style={{
                                                ...styles.actionButton,
                                                backgroundColor: "#ffc107",
                                                color: "#000",
                                                width: "100px", // Largeur fixe
                                            }}
                                        >
                                            Modifier
                                        </button>
                                    )}

                                    {/* Bouton Supprimer */}
                                    {user.role !== "admin" && (
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            style={{
                                                ...styles.actionButton,
                                                backgroundColor: "#dc3545",
                                                width: "100px", // Largeur fixe
                                            }}
                                        >
                                            Supprimer
                                        </button>
                                    )}

                                    {/* Bouton Activer/Désactiver */}
                                    {user.role !== "admin" && (
                                        <button
                                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                                            style={{
                                                ...styles.actionButton,
                                                backgroundColor: user.isActive ? "#dc3545" : "#28a745",
                                                marginLeft: "auto", // Pousse le bouton à droite
                                                width: "100px", // Largeur fixe
                                            }}
                                        >
                                            {user.isActive ? "Désactiver" : "Activer"}
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Styles pour le composant
const styles = {
    container: {
        maxWidth: "1000px",
        margin: "50px auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    title: {
        textAlign: "center",
        marginBottom: "20px",
        fontSize: "24px",
        fontWeight: "bold",
    },
    addButton: {
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "16px",
        cursor: "pointer",
        marginBottom: "20px",
    },
    searchContainer: {
        marginBottom: "20px",
    },
    searchInput: {
        width: "100%",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "16px",
    },
    message: {
        padding: "10px",
        borderRadius: "4px",
        marginBottom: "20px",
        textAlign: "center",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "#fff",
        borderRadius: "8px",
        overflow: "hidden",
    },
    th: {
        padding: "12px",
        backgroundColor: "#007bff",
        color: "#fff",
        textAlign: "left",
    },
    tr: {
        borderBottom: "1px solid #ddd",
    },
    td: {
        padding: "12px",
        textAlign: "left",
    },
    actions: {
        display: "flex",
        gap: "5px",
        alignItems: "center", // Aligner verticalement les boutons
    },
    actionButton: {
        padding: "5px 10px",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "14px",
        cursor: "pointer",
    },
};

export default Management;