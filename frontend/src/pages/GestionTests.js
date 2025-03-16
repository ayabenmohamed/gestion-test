import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GestionTests = () => {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    question_ids: [],
  });
  const [editingTest, setEditingTest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Récupérer tous les tests et les questions
  useEffect(() => {
    const fetchData = async () => {
      await fetchTests();
      await fetchQuestions();
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tests');
      setTests(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des tests :', err);
      setTests([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des questions :', err);
      setQuestions([]);
    }
  };

  // Ajouter ou modifier un test
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await axios.put(`http://localhost:5000/api/tests/${editingTest.id}`, newTest);
      } else {
        await axios.post('http://localhost:5000/api/tests', newTest);
      }
      setNewTest({
        title: '',
        description: '',
        question_ids: [],
      });
      setEditingTest(null);
      fetchTests(); // Rafraîchir la liste des tests
    } catch (err) {
      console.error('Erreur lors de l\'ajout/modification du test :', err);
    }
  };

  // Supprimer un test
  const handleDeleteTest = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tests/${id}`);
      fetchTests(); // Rafraîchir la liste des tests
    } catch (err) {
      console.error('Erreur lors de la suppression du test :', err);
    }
  };

  // Pré-remplir le formulaire pour la modification
  const handleEditTest = (test) => {
    setEditingTest(test);
    setNewTest({
      title: test.title,
      description: test.description,
      question_ids: test.questions?.map((q) => q.id) || [],
    });
  };

  // Gérer la sélection des questions
  const handleQuestionSelection = (e) => {
    const { value, checked } = e.target;
    setNewTest((prev) => ({
      ...prev,
      question_ids: checked
        ? [...(prev.question_ids || []), parseInt(value)]
        : (prev.question_ids || []).filter((id) => id !== parseInt(value)),
    }));
  };

  if (loading) {
    return <div style={styles.loading}>Chargement en cours...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestion des Tests</h1>

      {/* Formulaire pour ajouter ou modifier un test */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Titre du test"
          value={newTest.title}
          onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Description du test"
          value={newTest.description}
          onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
          style={styles.textarea}
        />
        <div style={styles.questionList}>
          <h3>Sélectionnez les questions :</h3>
          {questions.map((question) => (
            <label key={question.id} style={styles.questionItem}>
              <input
                type="checkbox"
                value={question.id}
                checked={newTest.question_ids?.includes(question.id)}
                onChange={handleQuestionSelection}
              />
              {question.question_text}
            </label>
          ))}
        </div>
        <button type="submit" style={styles.submitButton}>
          {editingTest ? 'Modifier' : 'Ajouter'}
        </button>
        {editingTest && (
          <button type="button" onClick={() => setEditingTest(null)} style={styles.cancelButton}>
            Annuler
          </button>
        )}
      </form>

      {/* Liste des tests */}
      <ul style={styles.testList}>
        {tests.map((test) => (
          <li key={test.id} style={styles.testItem}>
            <div style={styles.testContent}>
              <h3>{test.title}</h3>
              <p>{test.description}</p>
              <ul>
                {test.questions?.map((question) => (
                  <li key={question.id}>{question.question_text}</li>
                ))}
              </ul>
            </div>
            <div style={styles.testActions}>
              <button onClick={() => handleEditTest(test)} style={styles.editButton}>
                Modifier
              </button>
              <button onClick={() => handleDeleteTest(test.id)} style={styles.deleteButton}>
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Styles CSS intégrés
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#333',
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
    height: '100px',
    fontSize: '16px',
  },
  questionList: {
    marginBottom: '10px',
  },
  questionItem: {
    display: 'block',
    marginBottom: '5px',
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginLeft: '10px',
  },
  testList: {
    listStyleType: 'none',
    padding: '0',
  },
  testItem: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testContent: {
    flex: 1,
  },
  testActions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    marginTop: '20px',
  },
};

export default GestionTests;