const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Passez à `true` si vous utilisez HTTPS
      httpOnly: true, // Empêche l'accès au cookie via JavaScript
      maxAge: 1000 * 60 * 60, // Durée de vie du cookie (1 heure)
    },
  })
);

// Connexion à la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pfe"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion MySQL :", err);
    return;
  }
  console.log("✅ Connecté à MySQL !");
  createAdminIfNotExists();
});

// Créer un admin par défaut s'il n'existe pas
async function createAdminIfNotExists() {
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";

  try {
    const [results] = await db.promise().query("SELECT * FROM users WHERE email = ?", [adminEmail]);
    if (results.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.promise().query(
        "INSERT INTO users (firstname, lastname, email, password, role, isActive) VALUES (?, ?, ?, ?, ?, ?)",
        ["Admin", "SuperUser", adminEmail, hashedPassword, "admin", true]
      );
      console.log("🛠 Administrateur créé avec succès !");
    } else {
      console.log("ℹ️ L'administrateur existe déjà.");
    }
  } catch (err) {
    console.error("❌ Erreur lors de la création de l'admin :", err);
  }
}

// 🔹 Gestion des utilisateurs

// Inscription d'un utilisateur
app.post("/api/signup", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query(
      "INSERT INTO users (firstname, lastname, email, password, role, isActive) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, hashedPassword, "utilisateur", true]
    );
    res.status(201).json({ message: "Utilisateur ajouté avec succès" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: "❌ Email et mot de passe requis" });
  }

  try {
      const [results] = await db
          .promise()
          .query("SELECT * FROM users WHERE email = ?", [email]);

      if (results.length === 0) {
          return res.status(401).json({ message: "❌ Utilisateur non trouvé" });
      }

      const user = results[0];

      // Vérifier si l'utilisateur est désactivé
      if (!user.isActive) {
          return res.status(403).json({ message: "❌ Compte désactivé. Contactez l'administrateur." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          return res.status(401).json({ message: "❌ Mot de passe incorrect" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

      req.session.token = token;
      req.session.userId = user.id;

      res.json({ message: "✅ Connexion réussie", token });
  } catch (err) {
      console.error("❌ Erreur lors de la connexion :", err);
      res.status(500).json({ message: "❌ Erreur serveur" });
  }
});

// Exemple de route pour récupérer un utilisateur par son ID
app.get("/users/:id?", async (req, res) => {
  const { id } = req.params;

  try {
    let query;
    let params = [];

    if (id) {
      // Récupérer un utilisateur spécifique par ID
      query = "SELECT id, firstname, lastname, email, role, isActive FROM users WHERE id = ?";
      params = [id];
    } else {
      // Récupérer tous les utilisateurs
      query = "SELECT id, firstname, lastname, email, role, isActive FROM users";
    }

    const [results] = await db.promise().query(query, params);

    if (id && results.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Retourner l'utilisateur ou la liste des utilisateurs
    res.status(200).json(id ? results[0] : results);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des utilisateurs :", err);
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});

// Modifier un utilisateur
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;  // Récupérer l'ID de l'utilisateur à partir des paramètres de l'URL
  const { firstname, lastname, email, role, isActive, password } = req.body;  // Récupérer les nouvelles informations de l'utilisateur

  try {
    let query = "UPDATE users SET firstname = ?, lastname = ?, email = ?, role = ?, isActive = ? WHERE id = ?";
    let params = [firstname, lastname, email, role, isActive, id];

    // Si un mot de passe est fourni, on l'ajoute à la requête
    if (password) {
      query = "UPDATE users SET firstname = ?, lastname = ?, email = ?, role = ?, isActive = ?, password = ? WHERE id = ?";
      params.push(password);
    }

    const [result] = await db.promise().query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });  // Utilisateur non trouvé
    }

    res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour de l'utilisateur :", err);
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});


// Supprimer un utilisateur
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "✅ Utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});

// Activer/Désactiver un utilisateur
app.put("/users/:id/status", async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    await db.promise().query("UPDATE users SET isActive = ? WHERE id = ?", [isActive, id]);
    res.json({ message: "✅ Statut utilisateur mis à jour" });
  } catch (err) {
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});

app.get("/api/questions", async (req, res) => {
  try {
    const [questions] = await db.promise().query(`
      SELECT q.*, u.firstname, u.lastname 
      FROM questions q
      LEFT JOIN users u ON q.created_by = u.id
    `);
    const questionsWithAnswers = await Promise.all(questions.map(async (question) => {
      const [correctAnswers] = await db.promise().query(
        "SELECT correct_answer FROM correct_answers WHERE question_id = ?",
        [question.id]
      );
      return {
        ...question,
        correct_answers: correctAnswers.map((a) => a.correct_answer),
      };
    }));
    res.json(questionsWithAnswers);
  } catch (err) {
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});

app.post("/api/questions", async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_answers, created_by } = req.body;

  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answers || correct_answers.length === 0) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires" });
  }

  try {
    // Insérer la question avec le statut par défaut "en attente"
    const [result] = await db.promise().query(
      "INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, created_by, statut) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [question_text, option_a, option_b, option_c, option_d, created_by, "en attente"] // Ajout du statut par défaut
    );
    const questionId = result.insertId;

    // Insérer les réponses correctes
    for (const answer of correct_answers) {
      await db.promise().query(
        "INSERT INTO correct_answers (question_id, correct_answer) VALUES (?, ?)",
        [questionId, answer]
      );
    }

    res.status(201).json({ message: "✅ Question ajoutée avec succès", id: questionId });
  } catch (err) {
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});

// Modifier une question (y compris le statut)
app.put("/api/questions/:id", async (req, res) => {
  const { id } = req.params;
  const { question_text, option_a, option_b, option_c, option_d, correct_answers, statut } = req.body;

  // Vérifier que tous les champs obligatoires sont présents
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answers || correct_answers.length === 0) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires" });
  }

  try {
    // Vérifier si la question existe
    const [question] = await db.promise().query("SELECT * FROM questions WHERE id = ?", [id]);
    if (question.length === 0) {
      return res.status(404).json({ message: "❌ Question non trouvée" });
    }

    // Mettre à jour la question
    await db.promise().query(
      "UPDATE questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, statut = ? WHERE id = ?",
      [question_text, option_a, option_b, option_c, option_d, statut, id]
    );

    // Supprimer les anciennes réponses correctes
    await db.promise().query("DELETE FROM correct_answers WHERE question_id = ?", [id]);

    // Ajouter les nouvelles réponses correctes
    for (const answer of correct_answers) {
      await db.promise().query(
        "INSERT INTO correct_answers (question_id, correct_answer) VALUES (?, ?)",
        [id, answer]
      );
    }

    // Réponse réussie
    res.json({ message: "✅ Question mise à jour avec succès" });
  } catch (err) {
    console.error("❌ Erreur lors de la modification de la question :", err);
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});

app.delete("/api/questions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Supprimer les réponses correctes associées
    await db.promise().query("DELETE FROM correct_answers WHERE question_id = ?", [id]);

    // Supprimer la question
    await db.promise().query("DELETE FROM questions WHERE id = ?", [id]);

    res.json({ message: "✅ Question supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});  

// Récupérer tous les tests
app.get("/api/tests", async (req, res) => {
    try {
        const [tests] = await db.promise().query("SELECT * FROM tests");
        const testsWithQuestions = await Promise.all(tests.map(async (test) => {
            const [questions] = await db.promise().query(
                `SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d 
                 FROM questions q
                 JOIN test_questions tq ON q.id = tq.question_id
                 WHERE tq.test_id = ?`,
                [test.id]
            );
            return {
                ...test,
                questions,
            };
        }));
        res.json(testsWithQuestions);
    } catch (err) {
        res.status(500).json({ message: "❌ Erreur serveur" });
    }
});

// Ajouter un nouveau test
app.post("/api/tests", async (req, res) => {
    const { title, description, question_ids } = req.body;

    if (!title || !question_ids || question_ids.length === 0) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    try {
        // Insérer le test
        const [result] = await db.promise().query(
            "INSERT INTO tests (title, description) VALUES (?, ?)",
            [title, description]
        );
        const testId = result.insertId;

        // Associer les questions au test
        for (const questionId of question_ids) {
            await db.promise().query(
                "INSERT INTO test_questions (test_id, question_id) VALUES (?, ?)",
                [testId, questionId]
            );
        }

        res.status(201).json({ message: "✅ Test ajouté avec succès", id: testId });
    } catch (err) {
        res.status(500).json({ message: "❌ Erreur serveur" });
    }
});

// Modifier un test
app.put("/api/tests/:id", async (req, res) => {
    const { id } = req.params;
    const { title, description, question_ids } = req.body;

    if (!title || !question_ids || question_ids.length === 0) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    try {
        // Mettre à jour le test
        await db.promise().query(
            "UPDATE tests SET title = ?, description = ? WHERE id = ?",
            [title, description, id]
        );

        // Supprimer les anciennes associations de questions
        await db.promise().query("DELETE FROM test_questions WHERE test_id = ?", [id]);

        // Ajouter les nouvelles associations de questions
        for (const questionId of question_ids) {
            await db.promise().query(
                "INSERT INTO test_questions (test_id, question_id) VALUES (?, ?)",
                [id, questionId]
            );
        }

        res.json({ message: "✅ Test mis à jour avec succès" });
    } catch (err) {
        res.status(500).json({ message: "❌ Erreur serveur" });
    }
});

// Supprimer un test
app.delete("/api/tests/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await db.promise().query("DELETE FROM tests WHERE id = ?", [id]);
        res.json({ message: "✅ Test supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ message: "❌ Erreur serveur" });
    }
});

// 🔹 Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});