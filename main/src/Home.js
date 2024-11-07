import React from "react";
import { Box, AppBar, Toolbar, Typography, Button, Container, Card, CardContent } from "@mui/material";
import { Link } from "react-router-dom";
import backgroundImage from "./images/duplo24.jpg";

function Home() {
  const sectionStyle = {
    width: '100%',
    minHeight: '100vh',  // Ensure the section covers the whole viewport height
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <Box style={sectionStyle}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: "#2E3B55" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tasky
          </Typography>
          <Button color="inherit" component={Link} to="/about">About Us</Button>
          <Button color="inherit" component={Link} to="/login">Login</Button>
          <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/signup" 
            sx={{ marginLeft: 'auto' }}
          >
            Get Started
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ textAlign: "center", paddingTop: 10 }}>
        <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.5)', padding: 4, borderRadius: 2 }}>
          <Typography variant="h3" gutterBottom>
            Welcome to Tasky
          </Typography>
          <Typography variant="h6" color="inherit" paragraph>
            Tasky is your ultimate task management tool to help you manage your domestic tasks.
            By enabling you request for services online depending on your location and providers next to you.
          </Typography>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ marginTop: 10, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Why Choose Tasky?
        </Typography>
        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={4} marginTop={5}>
          {/* Card 1: Easy to Use */}
          <Card sx={{ width: 300, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Easy to Use
              </Typography>
              <Typography variant="body1">
                Tasky is simple and intuitive, designed for anyone to start using immediately without a steep learning curve.
              </Typography>
            </CardContent>
          </Card>

          {/* Card 2: Collaborate Seamlessly */}
          <Card sx={{ width: 300, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Collaborate Seamlessly
              </Typography>
              <Typography variant="body1">
                Collaborate with your team and track task progress in real-time, improving your productivity and workflow.
              </Typography>
            </CardContent>
          </Card>

          {/* Card 3: Secure and Reliable */}
          <Card sx={{ width: 300, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Secure and Reliable
              </Typography>
              <Typography variant="body1">
                Tasky keeps your data secure, ensuring that you can manage your tasks with peace of mind.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
