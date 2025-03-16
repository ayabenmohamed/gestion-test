import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [updatedQuestion, setUpdatedQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answers: [],
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des questions :', err);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette question ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      console.error("Erreur lors de la suppression de la question :", err);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question.id);
    setUpdatedQuestion({
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answers: question.correct_answers || [],
    });
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        question_text: updatedQuestion.question_text,
        option_a: updatedQuestion.option_a,
        option_b: updatedQuestion.option_b,
        option_c: updatedQuestion.option_c,
        option_d: updatedQuestion.option_d,
        correct_answers: updatedQuestion.correct_answers,
      };

      await axios.put(`http://localhost:5000/api/questions/${editingQuestion}`, dataToSend);

      // Réinitialiser l'état après la modification
      setEditingQuestion(null);
      setUpdatedQuestion({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answers: [],
      });

      fetchQuestions(); // Recharger les questions après la modification
      alert('Question modifiée avec succès!');
    } catch (err) {
      console.error("Erreur lors de la modification de la question :", err);
    }
  };

  const toggleCorrectAnswer = (option) => {
    setUpdatedQuestion((prev) => {
      const updatedCorrectAnswers = prev.correct_answers.includes(option)
        ? prev.correct_answers.filter((ans) => ans !== option)
        : [...prev.correct_answers, option];
      return { ...prev, correct_answers: updatedCorrectAnswers };
    });
  };

  const toggleExpandQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestion des Questions</h1>

      {/* Formulaire de modification */}
      {editingQuestion && (
        <form onSubmit={handleUpdateQuestion} style={styles.form}>
          <textarea
            placeholder="Question"
            value={updatedQuestion.question_text}
            onChange={(e) => setUpdatedQuestion({ ...updatedQuestion, question_text: e.target.value })}
            required
            style={styles.textarea}
          />
          {['A', 'B', 'C', 'D'].map((letter) => (
            <div key={letter} style={styles.optionContainer}>
              <input
                type="checkbox"
                checked={updatedQuestion.correct_answers.includes(`option_${letter.toLowerCase()}`)}
                onChange={() => toggleCorrectAnswer(`option_${letter.toLowerCase()}`)}
                style={styles.checkbox}
              />
              <input
                type="text"
                placeholder={`Option ${letter}`}
                value={updatedQuestion[`option_${letter.toLowerCase()}`]}
                onChange={(e) =>
                  setUpdatedQuestion({ ...updatedQuestion, [`option_${letter.toLowerCase()}`]: e.target.value })
                }
                required
                style={styles.input}
              />
            </div>
          ))}
          <button type="submit" style={styles.submitButton}>
            Enregistrer les modifications
          </button>
          <button
            type="button"
            onClick={() => setEditingQuestion(null)}
            style={styles.cancelButton}
          >
            Annuler
          </button>
        </form>
      )}

      {/* Liste des questions */}
      <ul style={styles.questionList}>
        {questions.map((question, index) => (
          <li key={question.id} style={styles.questionItem}>
            <div>
              <strong>Q{index + 1}</strong>: 
              {question.question_text.length > 50 ? (
                <>
                  {expandedQuestion === question.id
                    ? question.question_text
                    : question.question_text.substring(0, 50) + '...'}
                  <button
                    onClick={() => toggleExpandQuestion(question.id)}
                    style={styles.toggleButton}
                  >
                    {expandedQuestion === question.id ? 'Réduire' : 'Voir plus'}
                  </button>
                </>
              ) : (
                question.question_text
              )}
            </div>

            <div>
              {['option_a', 'option_b', 'option_c', 'option_d'].map((option) => (
                <div key={option} style={styles.optionContainer}>
                  {question[option].length > 30 ? (
                    <>
                      {expandedQuestion === question.id
                        ? question[option]
                        : question[option].substring(0, 30) + '...'}
                    </>
                  ) : (
                    question[option]
                  )}
                </div>
              ))}
            </div>

            <div>
              <strong>Réponses correctes: </strong>
              {Array.isArray(question.correct_answers) && question.correct_answers.length > 0 ? (
                <span>
                  {question.correct_answers.map((ans) =>
                    ans.replace('option_', '').toUpperCase()
                  ).join(', ')}
                </span>
              ) : (
                <span>Aucune réponse correcte définie</span>
              )}
            </div>

            <div>
              <button onClick={() => handleEditQuestion(question)} style={styles.editButton}>
                Modifier
              </button>
              <button onClick={() => handleDeleteQuestion(question.id)} style={styles.deleteButton}>
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
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
  cancelButton: { backgroundColor: '#ffc107', color: 'white', padding: '10px', borderRadius: '4px' },
  questionList: { listStyleType: 'none', padding: '0' },
  questionItem: { padding: '10px', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '10px' },
  toggleButton: { border: 'none', background: 'none', color: '#007bff', cursor: 'pointer' },
  editButton: { backgroundColor: '#007bff', color: 'white', padding: '5px', borderRadius: '4px' },
  deleteButton: { backgroundColor: '#dc3545', color: 'white', padding: '5px', borderRadius: '4px' },
  optionContainer: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
  checkbox: { marginRight: '10px' },
};

export default ManageQuestionsPage;