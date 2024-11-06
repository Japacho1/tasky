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


// In your Express server
app.post("/api/update-location", verifyToken, async (req, res) => {
  const { latitude, longitude, current_town } = req.body; // Accept current_town from request
  const providerEmail = req.user.email;

  try {
      const sql = "UPDATE users SET latitude = ?, longitude = ?, current_town = ? WHERE email = ?";
      const [result] = await pool.execute(sql, [latitude, longitude, current_town, providerEmail]);
      
      if (result.affectedRows > 0) {
          res.status(200).json({ message: "Location updated successfully" });
      } else {
          res.status(404).json({ message: "User not found" });
      }
  } catch (err) {
      console.error("Error during location update:", err.message);
      res.status(500).json({ message: "Database error", error: err.message });
  }
});



app.post("/api/update-requester-location", verifyToken, async (req, res) => {
  // Extract values and ensure they are not undefined
  const latitude = req.body.latitude || null;
  const longitude = req.body.longitude || null;
  const current_town = req.body.city || null;
  const requesterEmail = req.user.email;

  // Log values for debugging
  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);
  console.log("Current Town:", current_town);

  try {
      const sql = "UPDATE users SET latitude = ?, longitude = ?, current_town = ? WHERE email = ?";
      const [result] = await pool.execute(sql, [latitude, longitude, current_town, requesterEmail]);

      if (result.affectedRows > 0) {
          res.status(200).json({ message: "Location updated successfully" });
      } else {
          res.status(404).json({ message: "User not found" });
      }
  } catch (err) {
      console.error("Error during requester location update:", err.message);
      res.status(500).json({ message: "Database error", error: err.message });
  }
});


// Endpoint to update provider location

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

// Endpoint to get requests for a specific provider
app.get('/api/provider-requests', verifyToken, async (req, res) => {
  const providerId = req.user.id; // Extract provider ID from the token

  const query = `
    SELECT r.id AS requestId, r.service_id AS serviceId, u.f_name AS requesterFirstName, u.l_name AS requesterLastName, u.email AS requesterEmail, s.name AS serviceName
    FROM requests r
    JOIN users u ON r.user_id = u.id
    JOIN services s ON r.service_id = s.id
    WHERE r.provider_id = ?
  `;

  try {
    const [rows] = await pool.execute(query, [providerId]);
    res.status(200).json(rows); // Send back the list of requests
  } catch (err) {
    console.error("Error retrieving provider requests:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});





// Decline (delete) request endpoint
app.delete('/api/requests/:id', verifyToken, async (req, res) => {
  const requestId = req.params.id;
  
  try {
      await pool.execute(`DELETE FROM requests WHERE id = ?`, [requestId]);
      res.status(200).json({ message: "Request declined successfully" });
  } catch (error) {
      console.error("Error deleting request:", error);
      res.status(500).json({ message: "Database error", error: error.message });
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


// Assuming you're using Express and a MySQL database

app.get('/api/providers/:id/average-rating',  async (req, res) => {
  const { id } = req.params;

  try {
    // Query to calculate the average rating for the provider
    const [rows] = await pool.query(
      `SELECT AVG(rating) AS avgRating FROM provider_ratings WHERE provider_id = ?`,
      [id]
    );

    if (rows.length > 0 && rows[0].avgRating !== null) {
      res.json({ avgRating: rows[0].avgRating });
    } else {
      res.json({ avgRating: null }); // No ratings available
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch average rating' });
  }
});

app.post("/api/providers-by-service", async (req, res) => {
  const { serviceIds, city } = req.body;

  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({ message: "Service IDs must be an array and cannot be empty" });
  }

  if (!city) {
    return res.status(400).json({ message: "City is required to filter providers by location" });
  }

  // Updated SQL query to include filtering by `current_town`
  const query = `
    SELECT u.id, u.f_name, u.l_name, u.username, u.email, u.current_town, AVG(r.rating) as average_rating
    FROM users u
    JOIN provider_services ps ON u.id = ps.provider_id
    LEFT JOIN ratings r ON u.id = r.provider_id
    WHERE ps.service_id IN (${serviceIds.map(() => '?').join(', ')})
      AND u.role = 'provider'
      AND u.current_town = ?
    GROUP BY u.id
  `;

  try {
    // Adding the city to the parameters list for the query
    const params = [...serviceIds, city];
    const [data] = await pool.execute(query, params);
    res.status(200).json(data);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});


// In your Express backend (e.g., ratingsController.js)
app.post('/api/ratings', verifyToken, async (req, res) => {
  const { providerId, rating } = req.body;
  const requesterId = req.user.id; // Ensure this is coming from the authenticated user

  try {
      await pool.query(`INSERT INTO provider_ratings (provider_id, requester_id, rating) VALUES (?, ?, ?)`, 
          [providerId, requesterId, rating]);
      
      // Update average rating in `users` table
      const [average] = await pool.query(`SELECT AVG(rating) AS avgRating FROM provider_ratings WHERE provider_id = ?`, [providerId]);
      await pool.query(`UPDATE users SET rating = ? WHERE id = ?`, [average.avgRating, providerId]);

      res.json({ message: "Rating submitted successfully" });
  } catch (error) {
      res.status(500).json({ error: 'Error submitting rating' });
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
// Accept request endpoint
// Accept request endpoint
app.post('/api/requests/accept/:id', verifyToken, async (req, res) => {
  const requestId = req.params.id;

  const query = `UPDATE requests SET status = 'accepted' WHERE id = ?`;

  try {
      const [result] = await pool.execute(query, [requestId]);
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Request not found" });
      }
      res.status(200).json({ message: "Request accepted successfully" });
  } catch (err) {
      console.error("Error accepting request:", err);
      res.status(500).json({ message: "Database error", error: err.message });
  }
});
// MyRequests API endpoint
app.get('/api/my-requests', verifyToken, async (req, res) => {
  const userId = req.user.id; // Assuming user ID is stored in the token
  const query = `
      SELECT r.id, r.request_date, r.status, s.name AS serviceName
      FROM requests r
      JOIN services s ON r.service_id = s.id
      WHERE r.user_id = ?
  `;
  
  try {
      const [requests] = await pool.execute(query, [userId]);
      res.json(requests);
  } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Cancel request endpoint
app.delete('/api/requests/:id', verifyToken, async (req, res) => {
  const requestId = req.params.id;

  const query = `DELETE FROM requests WHERE id = ? AND user_id = ?`; // Ensure that the request can only be deleted by its creator
  const userId = req.user.id; // Get the ID of the user making the request

  try {
      const [result] = await pool.execute(query, [requestId, userId]);
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Request not found or you do not have permission to delete this request." });
      }
      res.status(200).json({ message: "Request canceled successfully" });
  } catch (err) {
      console.error("Error canceling request:", err);
      res.status(500).json({ message: "Database error", error: err.message });
  }
});

// In your main Express file (e.g., app.js or server.js)
app.get('/api/providers-with-location', async (req, res) => {
  try {
      const query = `
          SELECT id, f_name, l_name, latitude, longitude, current_town 
          FROM users 
          WHERE role = 'provider';
      `;
      const [results] = await pool.execute(query);
      res.json(results);
  } catch (error) {
      console.error('Error fetching providers with location:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to update provider location





// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
