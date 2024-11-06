import React, { useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { Link } from "react-router-dom";
import backgroundImage from "./images/duplo24.jpg";
const ProviderRequests = () => {
    const [requests, setRequests] = useState([]);

    // Fetch requests made to the provider
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/provider-requests', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                // Log the raw response for debugging
                console.log('Raw Response:', response);

                const data = await response.json();

                // Log the parsed JSON data
                console.log('Parsed Data:', data);

                setRequests(data);
            } catch (error) {
                console.error('Error fetching provider requests:', error);
            }
        };

        fetchRequests();
    }, []);

    
    // Function to handle accepting a request
    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/requests/accept/${requestId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                alert('Request accepted successfully!');
                notifyRequester(requestId); // Placeholder function to notify the requester
                setRequests(requests.filter(request => request.requestId !== requestId)); // Remove accepted request from list
            } else {
                console.error('Error accepting request:', await response.json());
            }
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    // Function to handle declining a request
    const handleDeclineRequest = async (requestId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/requests/${requestId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                alert('Request declined successfully!');
                setRequests(requests.filter(request => request.requestId !== requestId)); // Remove declined request from list
            } else {
                console.error('Error declining request:', await response.json());
            }
        } catch (error) {
            console.error('Error declining request:', error);
        }
    };

    // Placeholder function to notify the requester
    const notifyRequester = async (requestId) => {
        // You would implement notification logic here (e.g., sending an email)
        console.log(`Notifying requester for accepted request ID: ${requestId}`);
    };

    return (
        <Box marginTop={4}>
            <Typography variant="h6">Service Requests</Typography>
            <TableContainer component={Paper} style={{ marginTop: '16px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Request ID</TableCell>
                            <TableCell>Service Name</TableCell>
                            <TableCell>Requester Name</TableCell>
                            <TableCell>Requester Email</TableCell>
                            <TableCell>Respond</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.requestId}>
                                <TableCell>{request.requestId}</TableCell>
                                <TableCell>{request.serviceName}</TableCell>
                                <TableCell>{`${request.requesterFirstName} ${request.requesterLastName}`}</TableCell>
                                <TableCell>{request.requesterEmail}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleAcceptRequest(request.requestId)}
                                        style={{ marginRight: 8 }}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleDeclineRequest(request.requestId)}
                                    >
                                        Decline
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ProviderRequests;
