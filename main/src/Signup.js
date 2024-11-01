import React, { useState } from "react";
import { Box, Button, TextField, Typography, Container, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import axios from "axios";

function Signup() {
  const [f_name, setFName] = useState("");
  const [l_name, setLName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("requester"); // Default role
  const [error, setError] = useState(""); // To manage error messages

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic password validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Send sign-up data to the backend
    axios.post("http://localhost:8081/signup", {
      f_name,
      l_name,
      username,
      email,
      password,
      role // Include the selected role
    })
      .then((res) => {
        alert("User registered successfully!");
        console.log(res.data);
        // Optionally redirect to login or another page here
      })
      .catch((err) => {
        console.error("Error signing up:", err);
        setError(err.response?.data?.message || "Error during signup. Please try again."); // Display error message
      });
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", marginTop: 10 }}>
      <Typography variant="h4" gutterBottom>
        Sign Up for Tasky
      </Typography>
      {error && <Typography color="error">{error}</Typography>} {/* Display error message */}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="First Name"
          variant="outlined"
          margin="normal"
          onChange={(e) => setFName(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Last Name"
          variant="outlined"
          margin="normal"
          onChange={(e) => setLName(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          margin="normal"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          margin="normal"
          type="email" // Added type for better validation
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          type="password"
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Confirm Password"
          variant="outlined"
          type="password"
          margin="normal"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        {/* Role Selection */}
        <FormControl component="fieldset" sx={{ marginTop: 2 }}>
          <Typography variant="h6">I want to be a:</Typography>
          <RadioGroup 
            row 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <FormControlLabel value="requester" control={<Radio />} label="Requester" />
            <FormControlLabel value="provider" control={<Radio />} label="Provider" />
          </RadioGroup>
        </FormControl>

        <Button variant="contained" type="submit" color="primary" sx={{ marginTop: 2 }}>
          Sign Up
        </Button>
      </form>
    </Container>
  );
}

export default Signup;
