import React from "react";
import { Box, AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";
import backgroundImage from "./images/duplo24.jpg";

function Home() {

  const sectionStyle = {

    width: '100%',
    height: '100vh',
    backgroundImage: 'url(${backgroundImage})',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
  return (
    <Box style = {sectionStyle}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: "#2E3B55" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tasky
          </Typography>
          <Button color="inherit" component={Link} to="/about">About Us</Button>
          <Button color="inherit" component={Link} to="/login">Login</Button>
          <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ textAlign: "center", paddingTop: 10 }}>
        <Typography variant="h3" gutterBottom>
          Welcome to Tasky
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Tasky is your ultimate task management tool to help you stay organized and achieve more.
          Manage your tasks efficiently and collaborate with your team in real-time.
        </Typography>
        <Button variant="contained" size="large" color="primary" sx={{ marginTop: 5 }} component={Link} to="/signup">
          Get Started
        </Button>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ marginTop: 10, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Why Choose Tasky?
        </Typography>
        <Box display="flex" justifyContent="space-around" flexWrap="wrap" marginTop={5}>
          <Box width={300} textAlign="center" padding={2}>
            <Typography variant="h6" gutterBottom>
              Easy to Use
            </Typography>
            <Typography variant="body1">
              Tasky is simple and intuitive, designed for anyone to start using immediately without a steep learning curve.
            </Typography>
          </Box>
          <Box width={300} textAlign="center" padding={2}>
            <Typography variant="h6" gutterBottom>
              Collaborate Seamlessly
            </Typography>
            <Typography variant="body1">
              Collaborate with your team and track task progress in real-time, improving your productivity and workflow.
            </Typography>
          </Box>
          <Box width={300} textAlign="center" padding={2}>
            <Typography variant="h6" gutterBottom>
              Secure and Reliable
            </Typography>
            <Typography variant="body1">
              Tasky keeps your data secure, ensuring that you can manage your tasks with peace of mind.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;