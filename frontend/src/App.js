import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import QuestionPage from "./pages/QuestionPage";
import DashboardLayout from "./components/DashboardLayout"; // Importer le Layout du Dashboard
import './App.css';
import Management from "./pages/Management";
import GestionTests from "./pages/GestionTests";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import AddQuestionPage from "./pages/AddQuestionPage"; // Importer la nouvelle page AddQuestionPage
import ManageQuestionsPage from "./pages/ManageQuestionsPage"; // Importer la nouvelle page ManageQuestionsPage

function App() {
  return (
    <Router>
      <Routes>
        {/* Rediriger l'utilisateur vers la page de connexion lorsqu'il accède à la racine */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/edit-user/:id" element={<EditUser />} />

        {/* Appliquer le DashboardLayout uniquement à certaines pages */}
        <Route 
          path="/dashboard" 
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route 
          path="/QuestionPage" 
          element={
            <DashboardLayout>
              <QuestionPage />
            </DashboardLayout>
          }
        />
        <Route 
          path="/GestionTests" 
          element={
            <DashboardLayout>
              <GestionTests />
            </DashboardLayout>
          }
        />
        <Route 
          path="/Management" 
          element={
            <DashboardLayout>
              <Management />
            </DashboardLayout>
          }
        />
        {/* Ajouter les routes pour les nouvelles pages */}
        <Route 
          path="/add-question" 
          element={
            <DashboardLayout>
              <AddQuestionPage />
            </DashboardLayout>
          }
        />
        <Route 
          path="/manage-questions" 
          element={
            <DashboardLayout>
              <ManageQuestionsPage />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;