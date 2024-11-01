import React, { useEffect, useState } from "react";

const Services = ({ providerId }) => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/provider-services?providerId=${providerId}`);
      if (!response.ok) throw new Error(`Error fetching services: ${response.statusText}`);
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [providerId]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Services Offered:</h3>
      <ul>
        {services.map(service => (
          <li key={service.id}>{service.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Services;
