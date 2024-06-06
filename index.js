import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "mamdoot222",
	database: "freelancer",
});

connection.connect((err) => {
	if (err) {
		console.error("Error connecting to the database:", err);
		return;
	}
	console.log("Connected to the database");
});
app.post("/profileSelectionType", (req, res) => {
    const { userId, userType } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    if (!userType) {
        return res.status(400).json({ error: "Missing userType" });
    }

    const updateUserTypeQuery = `
        UPDATE User
        SET user_type = ?
        WHERE user_id = ?
    `;

    connection.query(updateUserTypeQuery, [userType, userId], (err, results) => {
        if (err) {
            return res
                .status(500)
                .json({ error: "Database query error", details: err });
        }
        return res.json({
            message: "User type updated successfully",
        });
    });
});

// Insert user profile
app.post("/profileSelection", (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    const insertProfileQuery = `
        INSERT INTO userprofileS (user_id)
        VALUES (?)
    `;

    connection.query(insertProfileQuery, [userId], (err, results) => {
        if (err) {
            return res
                .status(500)
                .json({ error: "Database query error", details: err });
        }
        return res.json({
            message: "Profile created successfully",
        });
    });
});
app.post("/login", (req, res) => {
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
app.post("/profileSelection", (req, res) => {
	const MakeProfile = "Select ";
});
app.post("/signup", (req, res) => {
	const checkEmailQuery = "SELECT COUNT(*) AS count FROM user WHERE email = ?";
	const insertUserQuery =
		"INSERT INTO user (email, name, password_hash) VALUES (?, ?, ?)";
	const getUserIdQuery = "SELECT LAST_INSERT_ID() AS userId"; // Query to get the last inserted user ID

	connection.query(checkEmailQuery, [req.body.email], (err, results) => {
		if (err) {
			return res.status(500).json({ error: "Database query error" });
		}
		if (results[0].count > 0) {
			return res.status(400).json({ error: "Email already exists" });
		} else {
			const values = [req.body.email, req.body.name, req.body.password];
			connection.query(insertUserQuery, values, (err, data) => {
				if (err) {
					return res.status(500).json({ error: "Database query error" });
				}
				connection.query(getUserIdQuery, (err, result) => {
					if (err) {
						return res.status(500).json({ error: "Database query error" });
					}
					const userId = result[0].userId;
					return res.json({
						message: "User created successfully",
						userId: userId,
					});
				});
			});
		}
	});
});

app.listen(8800, () => {
	console.log("Server is running on port 8800");
});
