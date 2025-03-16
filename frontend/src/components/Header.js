import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ toggleSidebar }) {
  const navigate = useNavigate(); // Utilisation du hook useNavigate pour la redirection

  const handleLogout = () => {
    // Supprimer le token du localStorage ou sessionStorage
    localStorage.removeItem('authToken');  // Vous pouvez aussi utiliser sessionStorage selon votre choix

    // Rediriger vers la page d'accueil après la déconnexion
    navigate('/');
  };

  return (
    <header className="header">
      <div className="left-section">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          &#9776;
        </button>

        <img src="/logo.png" alt="Logo" className="logo" />
        <h1 className="app-title">TelnetHolding</h1>
      </div>
      
      <button className="logout-btn" onClick={handleLogout}>
        Se déconnecter
      </button>

      <style jsx>{`
        /* Global styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
        }

        /* Styles du Header */
        .header {
          background-color: #333;
          color: white;
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          width: 100%;
        }

        .left-section {
          display: flex;
          align-items: center;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          font-size: 30px;
          color: white;
          cursor: pointer;
        }

        /* Styles du logo */
        .logo {
          height: 40px; /* Ajustez la taille du logo */
          margin-right: 15px; /* Espacement entre le logo et le titre */
        }

        .app-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0; /* Supprimer l'espacement par défaut */
        }

        .logout-btn {
          background-color: #e74c3c;
          border: none;
          color: white;
          padding: 8px 15px;
          font-size: 16px;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s;
        }

        .logout-btn:hover {
          background-color: #c0392b;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .app-title {
            font-size: 20px;
          }

          .sidebar-toggle {
            font-size: 28px;
          }

          .logout-btn {
            font-size: 14px;
            padding: 6px 12px;
          }

          .logo {
            height: 30px; /* Ajuster la taille du logo pour les petits écrans */
          }
        }

        @media (max-width: 480px) {
          .sidebar-toggle {
            font-size: 24px;
          }

          .logout-btn {
            font-size: 12px;
            padding: 5px 10px;
          }

          .logo {
            height: 25px; /* Encore plus petit sur les très petits écrans */
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
