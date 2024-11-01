import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

const ServiceTable = ({ services, selectedServices, onUpdateServices }) => {
    // Function to handle adding/removing a service
    const handleServiceToggle = (serviceId) => {
        let updatedServices = [...selectedServices];
        if (updatedServices.includes(serviceId)) {
            updatedServices = updatedServices.filter(id => id !== serviceId); // Remove service
        } else {
            updatedServices.push(serviceId); // Add service
        }
        onUpdateServices(updatedServices); // Update the selected services in parent component
    };

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Service Name</TableCell>
                    <TableCell align="center">Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {services.map((service) => (
                    <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell align="center">
                            <Button
                                variant={selectedServices.includes(service.id) ? 'contained' : 'outlined'}
                                color={selectedServices.includes(service.id) ? 'secondary' : 'primary'}
                                onClick={() => handleServiceToggle(service.id)}
                            >
                                {selectedServices.includes(service.id) ? 'Remove' : 'Add'}
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default ServiceTable;
