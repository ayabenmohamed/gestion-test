import React, { useState } from 'react';
import axios from 'axios';

const AddQuestionPage = () => {
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answers: [], // Tableau pour stocker les réponses correctes
    created_by: 1, // Remplacez par l'ID de l'utilisateur connecté
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        question_text: newQuestion.question_text,
        option_a: newQuestion.option_a,
        option_b: newQuestion.option_b,
        option_c: newQuestion.option_c,
        option_d: newQuestion.option_d,
        correct_answers: newQuestion.correct_answers, // Envoyer les réponses correctes
        created_by: newQuestion.created_by, // Ajout de l'utilisateur créateur
      };

      const response = await axios.post('http://localhost:5000/api/questions', dataToSend);

      // Réinitialiser l'état après l'ajout
      setNewQuestion({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answers: [],
        created_by: 1, // Réinitialiser l'utilisateur créateur
      });

      alert('Question ajoutée avec succès!');
      console.log('Réponse du serveur :', response.data);
    } catch (err) {
      console.error("Erreur lors de l'ajout de la question :", err);
      alert("Erreur lors de l'ajout de la question. Veuillez réessayer.");
    }
  };

  // Fonction pour gérer les cases à cocher
  const toggleCorrectAnswer = (option) => {
    setNewQuestion((prev) => {
      const updatedCorrectAnswers = prev.correct_answers.includes(option)
        ? prev.correct_answers.filter((ans) => ans !== option) // Retirer l'option si déjà présente
        : [...prev.correct_answers, option]; // Ajouter l'option si absente
      return { ...prev, correct_answers: updatedCorrectAnswers };
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Ajouter une Question</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Champ pour la question */}
        <textarea
          placeholder="Question"
          value={newQuestion.question_text}
          onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
          required
          style={styles.textarea}
        />

        {/* Options et cases à cocher pour les réponses correctes */}
        {['A', 'B', 'C', 'D'].map((letter) => (
          <div key={letter} style={styles.optionContainer}>
            <input
              type="checkbox"
              checked={newQuestion.correct_answers.includes(`option_${letter.toLowerCase()}`)}
              onChange={() => toggleCorrectAnswer(`option_${letter.toLowerCase()}`)}
              style={styles.checkbox}
            />
            <input
              type="text"
              placeholder={`Option ${letter}`}
              value={newQuestion[`option_${letter.toLowerCase()}`]}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, [`option_${letter.toLowerCase()}`]: e.target.value })
              }
              required
              style={styles.input}
            />
          </div>
        ))}

        {/* Bouton pour soumettre le formulaire */}
        <button type="submit" style={styles.submitButton}>
          Ajouter
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  title: { textAlign: 'center', color: '#333' },
  form: { marginBottom: '20px', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' },
  textarea: { width: '100%', padding: '10px', borderRadius: '4px', height: '80px' },
  input: { width: '100%', padding: '10px', borderRadius: '4px', marginBottom: '10px' },
  submitButton: { backgroundColor: '#28a745', color: 'white', padding: '10px', borderRadius: '4px' },
  optionContainer: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
  checkbox: { marginRight: '10px' },
};

export default AddQuestionPage;