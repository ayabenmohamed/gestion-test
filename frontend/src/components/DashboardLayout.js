import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app">
      <Header toggleSidebar={toggleSidebar} />
      <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} /> {/* Passer l'état de la Sidebar */}
        <div className="app-content">
          {children} {/* Affichage du contenu dynamique */}
        </div>
      </div>

      <style jsx>{`
        /* Layout styles */
        .app-container {
          display: flex;
          height: calc(100vh - 60px); /* Ajuste la hauteur du contenu */
        }

        .app-content {
          margin-left: 250px;
          padding: 20px;
          flex-grow: 1;
          transition: margin-left 0.3s ease;
        }

        @media (max-width: 768px) {
          .app-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default DashboardLayout;
