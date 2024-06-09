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

// Assuming you have Express and SQL Server setup similar to this:
app.get("/getUserName/:userId", (req, res) => {
	const { userId } = req.params;

	if (!userId) {
		return res.status(400).json({ error: "Missing userId" });
	}

	const getUserQuery = `
      SELECT name
      FROM User
      WHERE user_id = ?
    `;

	connection.query(getUserQuery, [userId], (err, results) => {
		if (err) {
			return res
				.status(500)
				.json({ error: "Database query error", details: err });
		}

		if (results.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.json({
			userName: results[0].name,
		});
	});
});

app.get('/getJobs', (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const getJobsQuery = `
        SELECT title, description, budget, status, created_at
        FROM Jobs
        WHERE client_id = ?
    `;

    connection.query(getJobsQuery, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error', details: err });
        }

        return res.status(200).json({ jobs: results });
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
app.post("/insertinprofile", (req, res) => {
	const { userId, title, description, hourlyRate, address, skill } = req.body;

	if (!title || !description || !hourlyRate || !address || !skill || !userId) {
		return res.status(400).json({ message: "All fields are required" });
	}

	const query =
		"INSERT INTO UserProfiles (user_id,title, description, hourly_rate, location, skills) VALUES (?, ?, ?, ?, ?, ?)";
	const values = [userId, title, description, hourlyRate, address, skill];

	connection.query(query, values, (err, result) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res
			.status(201)
			.json({ message: "Profile created", profileId: result.insertId });
	});
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
app.post("/jobcreation", (req, res) => {
	const { client_id, title, description, Budget, status } = req.body;

	// Check if all required fields are provided
	if (!client_id || !title || !description || !Budget || !status) {
		return res.status(400).json({ message: "All fields are required" });
	}

	// Define the query with a default status of 'open'
	const query =
		"INSERT INTO jobs (client_id, title, description, budget, status) VALUES (?, ?, ?, ?, ?)";

	// Set the values including the default status 'open'
	const values = [client_id, title, description, Budget, status];

	// Execute the query
	connection.query(query, values, (err, result) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}

		// Respond with success message and the inserted profile ID
		res
			.status(201)
			.json({ message: "Profile created", profileId: result.insertId });
	});
});

app.listen(8800, () => {
	console.log("Server is running on port 8800");
});
