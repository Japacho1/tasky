import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();
        axios.post('http://localhost:8081/login', { email, password })
            .then(res => {
               window.alert('Login response:', res.data); // Log full response
                if (res.data.token) {
                    localStorage.setItem('token', res.data.token); // Store the token
                    const userRole = res.data.role; // Get the user role from response
                    console.log('User Role:', userRole); // Log the user role
    
                    if (userRole === 'provider') {
                        navigate('/provider-dashboard'); // Redirect to Provider Dashboard
                    } else {
                        navigate('/homepage'); // Redirect to Requester Homepage
                    }
                } else {
                    console.log('No token found in response');
                }
            })
            .catch(err => {
                window.alert('Login error:', err.response ? err.response.data : err);
            });
    }
    

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Box 
                    display="flex" 
                    flexDirection={"column"} 
                    maxWidth={400} 
                    alignItems={"center"} 
                    justifyContent={"center"} 
                    margin={"auto"}
                    marginTop={5}
                    padding={3}
                    borderRadius={5}
                    boxShadow={"5px 5px 10px #ccc"}
                    sx={{
                        ":hover": {
                            boxShadow: "10px 10px 20px #ccc"
                        }
                    }}
                >
                    <Typography variant="h2" padding={3} textAlign="center">Login</Typography>
                    <TextField 
                        margin="normal" 
                        type="email" 
                        variant="outlined" 
                        placeholder="Email" 
                        onChange={e => setEmail(e.target.value)}
                    />
                    <TextField 
                        margin="normal" 
                        type="password" 
                        variant="outlined" 
                        placeholder="Password" 
                        onChange={e => setPassword(e.target.value)}
                    />
                    <Button 
                        sx={{ marginTop: 3, borderRadius: 3 }} 
                        variant="contained" 
                        color="warning" 
                        type="submit"
                    >
                        Login
                    </Button>
                    <Button 
                        sx={{ marginTop: 3, borderRadius: 3 }} 
                        component={Link} 
                        to="/signup"
                    >
                        Don't have an account? Signup
                    </Button>
                </Box>
            </form>
        </div>
    );
}

export default Login;
