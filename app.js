import mysql from "mysql";

// Create a MySQL connection
const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "mamdoot222",
	database: "freelancer",
});

// Connect to the MySQL server
connection.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL:", err);
		return;
	}

	console.log("Connected to MySQL");

	// SQL query to create the User table
	const createUserTableQuery = `
        CREATE TABLE IF NOT EXISTS User (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE,
            email VARCHAR(100) UNIQUE,
            password_hash VARCHAR(255),
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            user_type ENUM('client', 'freelancer'),
            profile_picture VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

	connection.query(createUserTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating User table:", err);
		} else {
			console.log("User table created successfully.");
		}
	});

	const createUserProfilesTableQuery = `
        CREATE TABLE IF NOT EXISTS UserProfiles (
            profile_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            title VARCHAR(100),
            description TEXT,
            hourly_rate DECIMAL(10, 2),
            skills VARCHAR(255),
            location VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES User(user_id)
        )
    `;

	// Execute the SQL query to create the UserProfiles table
	connection.query(createUserProfilesTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating UserProfiles table:", err);
		} else {
			console.log("UserProfiles table created successfully.");
		}
	});
	const createJobsTableQuery = `
        CREATE TABLE IF NOT EXISTS Jobs (
            job_id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT,
            title VARCHAR(100),
            description TEXT,
            budget DECIMAL(10, 2),
            status ENUM('open', 'closed', 'in_progress'),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES User(user_id)
        )
    `;

	// Execute the SQL query to create the Jobs table
	connection.query(createJobsTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating Jobs table:", err);
		} else {
			console.log("Jobs table created successfully.");
		}
	});
	// SQL query to create the Proposals table
	const createProposalsTableQuery = `
        CREATE TABLE IF NOT EXISTS Proposals (
            proposal_id INT AUTO_INCREMENT PRIMARY KEY,
            job_id INT,
            freelancer_id INT,
            cover_letter TEXT,
            proposed_rate DECIMAL(10, 2),
            status ENUM('submitted', 'accepted', 'rejected'),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (job_id) REFERENCES Jobs(job_id),
            FOREIGN KEY (freelancer_id) REFERENCES User(user_id)
        )
    `;

	// Execute the SQL query to create the Proposals table
	connection.query(createProposalsTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating Proposals table:", err);
		} else {
			console.log("Proposals table created successfully.");
		}
	});
	const createContractsTableQuery = `
    CREATE TABLE IF NOT EXISTS Contracts (
        contract_id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT,
        user_id INT,
        start_date DATE,
        end_date DATE,
        amount DECIMAL(10, 2),
        status ENUM('active', 'completed', 'cancelled'),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES Jobs(job_id),
        FOREIGN KEY (user_id) REFERENCES User(user_id)
    )
`;

	// Execute the SQL query to create the Contracts table
	connection.query(createContractsTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating Contracts table:", err);
		} else {
			console.log("Contracts table created successfully.");
		}
	});
	const createPaymentsTableQuery = `
CREATE TABLE IF NOT EXISTS Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT,
    amount DECIMAL(10, 2),
    payment_date DATE,
    status ENUM('pending', 'completed', 'failed'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES Contracts(contract_id)
)
`;

	// Execute the SQL query to create the Payments table
	connection.query(createPaymentsTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating Payments table:", err);
		} else {
			console.log("Payments table created successfully.");
		}
	});

	const createReviewsTableQuery = `
CREATE TABLE IF NOT EXISTS Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT,
    user_id INT,
    rating INT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES Contracts(contract_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
)
`;

	// Execute the SQL query to create the Reviews table
	connection.query(createReviewsTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating Reviews table:", err);
		} else {
			console.log("Reviews table created successfully.");
		}
	});
	// SQL query to create the Messages table
	const createMessagesTableQuery = `
        CREATE TABLE IF NOT EXISTS Messages (
            message_id INT AUTO_INCREMENT PRIMARY KEY,
            contract_id INT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (contract_id) REFERENCES Contracts(contract_id)
        )
    `;

	// Execute the SQL query to create the Messages table
	connection.query(createMessagesTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating Messages table:", err);
		} else {
			console.log("Messages table created successfully.");
		}

		// Close the connection
	});
	const createCategoriesTableQuery = `
        CREATE TABLE IF NOT EXISTS Categories (
            category_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            description TEXT
        )
    `;

	// Execute the SQL query to create the Categories table
	connection.query(createCategoriesTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating Categories table:", err);
		} else {
			console.log("Categories table created successfully.");
		}
	});
	// SQL query to create the JobCategories table
	const createJobCategoriesTableQuery = `
  CREATE TABLE IF NOT EXISTS JobCategories (
      job_id INT,
      category_id INT,
      PRIMARY KEY (job_id, category_id),
      FOREIGN KEY (job_id) REFERENCES Jobs(job_id),
      FOREIGN KEY (category_id) REFERENCES Categories(category_id)
  )
`;

	// Execute the SQL query to create the JobCategories table
	connection.query(createJobCategoriesTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating JobCategories table:", err);
		} else {
			console.log("JobCategories table created successfully.");
		}
	});
	// SQL query to create the Skills table
	const createSkillsTableQuery = `
        CREATE TABLE IF NOT EXISTS Skills (
            skill_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100)
        )
    `;

	// Execute the SQL query to create the Skills table
	connection.query(createSkillsTableQuery, (err, result) => {
		if (err) {
			console.error("Error creating Skills table:", err);
		} else {
			console.log("Skills table created successfully.");
		}
	});
        // SQL query to create the UserSkills table
        const createUserSkillsTableQuery = `
        CREATE TABLE IF NOT EXISTS UserSkills (
            user_id INT,
            skill_id INT,
            FOREIGN KEY (user_id) REFERENCES User(user_id),
            FOREIGN KEY (skill_id) REFERENCES Skills(skill_id)
        )
    `;

    // Execute the SQL query to create the UserSkills table
    connection.query(createUserSkillsTableQuery, (err, result) => {
        if (err) {
            console.error("Error creating UserSkills table:", err);
        } else {
            console.log("UserSkills table created successfully.");
        }

        // Close the connection
        connection.end();
    });
});

export default connection;
