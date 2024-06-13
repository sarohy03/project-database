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
app.post("/login", (req, res) => {
    const sql = "SELECT * FROM user WHERE email = ? AND password_hash = ?";
    connection.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length > 0) {
            const userType = data[0].user_type;  
            const userId= data[0].user_id;
            return res.json({status: "Success", user_type: userType,userId:userId});
        } else {
            return res.status(401).json("Invalid email or password");
        }
    });
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


app.get('/AllgetJobs', (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const getJobsQuery = `
        SELECT j.job_id, j.title, j.description, j.budget, j.status, j.created_at
        FROM Jobs AS j
        LEFT JOIN Proposals AS p ON j.job_id = p.job_id AND p.freelancer_id = ?
        WHERE p.freelancer_id IS NULL
        and j.status='open';
    `;

    connection.query(getJobsQuery, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error', details: err });
        }

        return res.status(200).json({ jobs: results });
    });
});

app.get('/GetProposals', (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const getJobsQuery = `
        SELECT j.job_id, j.title, j.description, j.budget, j.status, j.created_at, p.cover_letter,p.proposed_rate, p.status as st,p.created_at
        FROM Jobs AS j
        JOIN Proposals AS p ON j.job_id = p.job_id AND p.freelancer_id = ?;
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


app.post("/InsertProposal", (req, res) => {
	const { userId, jobId, description, hourlyRate} = req.body;

	if (!jobId|| !description || !hourlyRate || !userId) {
		return res.status(400).json({ message: "All fields are required" });
	}
    const status='submitted'
	const query =
		"INSERT INTO proposals (job_id, freelancer_id, cover_letter, proposed_rate, status) VALUES (?, ?, ?, ?, ?)";
	const values = [jobId,userId, description, hourlyRate ,status];

	connection.query(query, values, (err, result) => {
		if (err) {
            console.log(err)
			return res.status(500).json({ error: err.message });
		}
		res
			.status(201)
			.json({ message: "Profile created", profileId: result.insertId });
	});
});


app.post('/CategoriesCreation', async (req, res) => {
    const { jobId, categories } = req.body;

  
    if (!jobId || !categories) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    const sql= 'insert into JobCategories values(?,?)'
    const values=[jobId, categories]
    connection.query(sql,values ,(err,data)=>{
        console.log(err, data)
        if (err) {
			return res
				.status(500)
				.json({ error: "Database query error", details: err });
		}
		return res.status(201).json({
            message: "Category added"
        })
    })
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

        // Get the last inserted job ID
        const jobIdQuery = "SELECT LAST_INSERT_ID() AS jobId";
        connection.query(jobIdQuery, (err, jobIdResult) => {
            if (err) {
                return res.status(500).json({ error: "Database query error" });
            }

            const jobId = jobIdResult[0].jobId;

            // Respond with success message and the inserted job ID
            res.status(201).json({ message: "Job created", jobId: jobId });
        });
    });
});


app.listen(8800, () => {
	console.log("Server is running on port 8800");
});
