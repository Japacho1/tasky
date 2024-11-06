import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
} from '@mui/material';

const MyRequests = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/my-requests', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setRequests(data);
            } catch (error) {
                console.error('Error fetching requests:', error);
            }
        };

        fetchRequests();
    }, []);

    // Function to handle request cancellation
    const handleCancelRequest = async (requestId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/requests/${requestId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                // Remove the canceled request from the state
                setRequests((prevRequests) => prevRequests.filter(request => request.id !== requestId));
                console.log('Request canceled successfully');
            } else {
                const errorData = await response.json();
                console.error('Error canceling request:', errorData);
            }
        } catch (error) {
            console.error('Error canceling request:', error);
        }
    };

    return (
        <Box marginTop={4}>
            
            <Typography variant="h6">My Service Requests</Typography>
            <TableContainer component={Paper} style={{ marginTop: '16px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Request ID</TableCell>
                            <TableCell>Service Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Request Date</TableCell>
                            <TableCell>Actions</TableCell> {/* New actions column */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell>{request.serviceName}</TableCell>
                                <TableCell>{request.status}</TableCell>
                                <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleCancelRequest(request.id)} // Call cancel handler
                                    >
                                        Cancel
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

export default MyRequests;
