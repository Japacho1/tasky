const express = require("express");
const mysql = require("mysql2/promise"); // Use promise-based version for async/await
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "your_jwt_secret"; // Change this to a secure secret for production

// MySQL connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "2003",
  database: "tasky",
};

// Helper function to create a pool
const createPool = () => {
  return mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
};

const pool = createPool(); // Create the connection pool

// Middleware for JWT verification
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  console.log('Authorization token:', token); // Log the token

  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err); // Log the error
      return res.status(401).json({ message: "Unauthorized", error: err.message });
    }
    console.log('Decoded user:', decoded); // Log the decoded user info
    req.user = decoded;
    next();
  });
};

// Middleware to check roles
const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: `Access denied: Requires ${role} role.` });
    }
  };
};

// User registration endpoint
app.post("/signup", async (req, res) => {
  const { password, f_name, l_name, username, email, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (f_name, l_name, username, email, password, role, rating, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`;

    const [result] = await pool.execute(query, [f_name, l_name, username, email, hash, role]);

    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// User login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT id, f_name, l_name, username, email, password, role FROM users WHERE email = ?";
  try {
    const [data] = await pool.execute(sql, [email]);

    if (data.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, data[0].password);
    if (match) {
      const { id, f_name, l_name, username, role } = data[0];
      const token = jwt.sign({ id, f_name, l_name, username, email, role }, JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({ message: "Login successful", token, role });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Endpoint to update provider location
app.post("/api/update-location", verifyToken, async (req, res) => {
  const { latitude, longitude } = req.body;
  const providerEmail = req.user.email;

  const sql = "UPDATE users SET latitude = ?, longitude = ? WHERE email = ?";
  try {
    const [result] = await pool.execute(sql, [latitude, longitude, providerEmail]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Location updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Endpoint to get all services for the dropdown
app.get("/api/services", async (req, res) => {
  const sql = "SELECT * FROM services";
  try {
    const [data] = await pool.execute(sql);
    res.status(200).json(data);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Fetch services by specific provider ID
app.get('/api/providers/:providerId/services', async (req, res) => {
  const providerId = req.params.providerId;

  const query = `
    SELECT s.id, s.name 
    FROM provider_services ps
    JOIN services s ON ps.service_id = s.id
    WHERE ps.provider_id = ?
  `;

  try {
    const [data] = await pool.execute(query, [providerId]);
    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "No services found for this provider" });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Endpoint to create a new service request
app.post('/api/requests', verifyToken, async (req, res) => {
  const { providerId, serviceId } = req.body;
  const userId = req.user.id; // Get the ID of the user making the request

  // Validate input
  if (!providerId || !serviceId) {
    return res.status(400).json({ message: "Provider ID and Service ID are required" });
  }

  const query = `INSERT INTO requests (user_id, provider_id, service_id) VALUES (?, ?, ?)`;

  try {
    const [result] = await pool.execute(query, [userId, providerId, serviceId]);
    res.status(201).json({ message: "Request created successfully", requestId: result.insertId });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Endpoint to update provider services
app.post("/api/provider-services", verifyToken, async (req, res) => {
  const providerId = req.user.id;
  const { serviceIds } = req.body;

  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({ message: "No services selected" });
  }

  try {
    await pool.beginTransaction();

    const deleteQuery = "DELETE FROM provider_services WHERE provider_id = ?";
    await pool.execute(deleteQuery, [providerId]);

    const insertQuery = "INSERT INTO provider_services (provider_id, service_id) VALUES ?";
    const values = serviceIds.map((serviceId) => [providerId, serviceId]);

    await pool.query(insertQuery, [values]);

    await pool.commit();

    res.status(200).json({ message: "Services updated successfully" });
  } catch (err) {
    console.error("Error updating services:", err);
    await pool.rollback();
    res.status(500).json({ message: "Error updating services", error: err.message });
  }
});
app.post("/api/providers-by-service", async (req, res) => {
  const { serviceIds } = req.body;

  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({ message: "Service IDs must be an array and cannot be empty" });
  }

  const query = `
    SELECT u.id, u.f_name, u.l_name, u.username, u.email, AVG(r.rating) as average_rating
    FROM users u
    JOIN provider_services ps ON u.id = ps.provider_id
    LEFT JOIN ratings r ON u.id = r.provider_id
    WHERE ps.service_id IN (${serviceIds.map(() => '?').join(', ')}) AND u.role = 'provider'
    GROUP BY u.id
  `;

  try {
    const [data] = await pool.execute(query, serviceIds);
    res.status(200).json(data);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Endpoint to get services offered by a specific provider
app.get('/api/provider-services', verifyToken, async (req, res) => {
  const providerId = req.user.id;

  const query = `
    SELECT s.id, s.name 
    FROM provider_services ps
    JOIN services s ON ps.service_id = s.id
    WHERE ps.provider_id = ?
  `;

  try {
    const [data] = await pool.execute(query, [providerId]);
    res.status(200).json(data);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Endpoint to fetch all providers with their services and average ratings
app.get('/api/providers', async (req, res) => {
  const query = `
    SELECT u.id, u.f_name, u.l_name, u.username, u.email, 
           GROUP_CONCAT(DISTINCT ps.service_id) as service_ids,
           AVG(r.rating) as average_rating
    FROM users u
    LEFT JOIN provider_services ps ON u.id = ps.provider_id
    LEFT JOIN ratings r ON u.id = r.provider_id
    WHERE u.role = 'provider'
    GROUP BY u.id
  `;

  try {
    const [data] = await pool.execute(query);
    res.status(200).json(data);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
