import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ isOpen }) {
    // Récupérer les informations de l'utilisateur depuis le localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user ? user.role : null; // Rôle de l'utilisateur (utilisateur, recruteur ou admin)

    return (
        <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-nav">
                <ul>
                    {/* Lien Accueil visible pour tous */}
                    <li><Link to="/" className="sidebar-link">Accueil</Link></li>

                    {/* Lien Tableau de bord visible pour tous */}
                    <li><Link to="/dashboard" className="sidebar-link">Tableau de bord</Link></li>

                    {/* Lien Gestion d'un utilisateur visible uniquement pour l'admin */}
                    {role === 'admin' && (
                        <li><Link to="/Management" className="sidebar-link">Gestion d'un utilisateur</Link></li>
                    )}

                    {/* Lien Gestion des tests visible uniquement pour le recruteur */}
                    {role === 'recruteur' && (
                        <li><Link to="/GestionTests" className="sidebar-link">Gestion des tests</Link></li>
                    )}
                    {role === 'recruteur' && (
                        <li><Link to="/add-question" className="sidebar-link">Gestion des tests</Link></li>
                    )}
                    {role === 'recruteur' && (
                        <li><Link to="/manage-questions" className="sidebar-link">Gestion des tests</Link></li>
                    )}

                    {/* Lien Gestion des questions visible pour l'utilisateur et le recruteur */}
                    {(role === 'utilisateur' || role === 'recruteur') && (
                        <li><Link to="/QuestionPage" className="sidebar-link">Gestion des questions</Link></li>
                    )}
                </ul>
            </div>
            <style jsx>{`
                /* Styles de base de la Sidebar */
                .sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 250px;
                    background-color: #333;
                    color: white;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transform: translateX(-250px);
                    transition: transform 0.3s ease;
                }

                .sidebar.open {
                    transform: translateX(0);
                }

                .sidebar-nav ul {
                    list-style-type: none;
                    padding: 0;
                }

                .sidebar-nav li {
                    margin: 15px 0;
                }

                .sidebar-link {
                    color: white;
                    text-decoration: none;
                    font-size: 18px;
                    font-weight: 500;
                    transition: color 0.3s;
                }

                .sidebar-link:hover {
                    color: #ffa500; /* Change color on hover */
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .sidebar {
                        width: 200px;
                    }

                    .sidebar-nav li {
                        margin: 10px 0;
                    }

                    .sidebar-link {
                        font-size: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .sidebar {
                        width: 180px;
                    }

                    .sidebar-nav li {
                        margin: 8px 0;
                    }

                    .sidebar-link {
                        font-size: 14px;
                    }
                }
            `}</style>
        </nav>
    );
}

export default Sidebar;