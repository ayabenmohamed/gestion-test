import React, { useEffect, useState } from "react";

const TemporaryMessage = ({ message, duration = 3000 }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Définir un timer pour masquer le message après la durée spécifiée
        const timer = setTimeout(() => {
            setVisible(false);
        }, duration);

        // Nettoyer le timer si le composant est démonté avant la fin du délai
        return () => clearTimeout(timer);
    }, [duration, message]); // Ajouter `message` comme dépendance pour réinitialiser le timer si le message change

    // Si le message n'est plus visible, ne rien afficher
    if (!visible) return null;

    return (
        <p
            style={{
                color: message.includes("❌") ? "#d32f2f" : "#155724",
                backgroundColor: message.includes("❌") ? "#f8d7da" : "#d4edda",
                padding: "10px",
                borderRadius: "4px",
            }}
        >
            {message}
        </p>
    );
};

export default TemporaryMessage;