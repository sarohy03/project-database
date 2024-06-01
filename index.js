import express from "express";
import mysql from "mysql";
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mamdoot222",
    database: "freelancer",
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM user WHERE email = ? AND password_hash = ?";
    connection.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length > 0) {
            return res.json("Success");
        } else {
            return res.status(401).json("Invalid email or password");
        }
    });
});

app.post('/signup', (req, res) => {
    const checkEmailQuery = "SELECT COUNT(*) AS count FROM user WHERE email = ?";
    const insertUserQuery = "INSERT INTO user (email, name, password_hash) VALUES (?, ?, ?)";

    connection.query(checkEmailQuery, [req.body.email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error' });
        }
        if (results[0].count > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        } else {
            const values = [
                req.body.email,
                req.body.name,
                req.body.password
            ];
            connection.query(insertUserQuery, values, (err, data) => {
                if (err) {
                    return res.status(500).json({ error: 'Database query error' });
                }
                return res.json({ message: 'User created successfully' });
            });
        }
    });
});

app.listen(8800, () => {
    console.log("Server is running on port 8800");
});
