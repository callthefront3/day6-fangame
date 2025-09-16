import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(express.json());

// Database
let db_Day6TypingPractice;
(async () => {
  db_Day6TypingPractice = await open({
    filename: "./assets/Day6TypingPractice/score.db",
    driver: sqlite3.Database
  });

  await db_Day6TypingPractice.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT,
      character INTEGER,
      score INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();


// ▶▶▶ Introduce Page
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

// ▶▶▶ Day6TypingPractice Game
app.get('/day6-typing-practice', (req, res) => {
    res.sendFile(__dirname + "/Day6TypingPractice.html");
})


app.post("/day6-typing-practice/submit-score", async (req, res) => {
  const { nickname, character, score } = req.body;
  if (!nickname || score == null) {
    return res.status(400).json({ error: "Invalid data" });
  }

  await db_Day6TypingPractice.run(
    "INSERT INTO scores (nickname, character, score) VALUES (?, ?, ?)",
    [nickname, character, score]
  );

  res.json({ success: true });
});

app.get("/day6-typing-practice/daily-rank", async (req, res) => {
    try {
        const rows = await db_Day6TypingPractice.all(`
            SELECT nickname, character, score
            FROM scores
            WHERE DATE(datetime(created_at, '+9 hours')) = DATE('now', '+9 hours')
            ORDER BY score DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching daily scores");
    }
});

// ▶▶▶ SaveHearts Game
app.get('/save-hearts', (req, res) => {
    res.sendFile(__dirname + "/SaveHearts.html");
})




app.listen(port, () => {
     console.log(`Listening on port ${port}`);
})