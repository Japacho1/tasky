import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import Services from "./Services";
import Rating from "./Rating";

const ProviderProfile = () => {
  const { id: providerId } = useParams(); // Extract provider ID from URL params
  const [provider, setProvider] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [error, setError] = useState("");

  // Fetch provider details
  const fetchProviderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/providers/${providerId}`);
      if (!response.ok) throw new Error(`Error fetching provider details: ${response.statusText}`);
      const data = await response.json();
      setProvider(data);
      fetchAverageRating(providerId);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch average rating
  const fetchAverageRating = async (id) => {
    try {
      const response = await fetch(`http://localhost:8081/api/provider-ratings/${id}`);
      if (!response.ok) throw new Error(`Error fetching average rating: ${response.statusText}`);
      const data = await response.json();
      setAverageRating(data.average_rating);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProviderDetails();
  }, [providerId]); // Use providerId as a dependency

  if (error) return <div>Error: {error}</div>;

  if (!provider) return <div>Loading provider details...</div>;

  return (
    <div>
      <h2>{provider.username}'s Profile</h2>
      <p>Name: {provider.f_name} {provider.l_name}</p>
      <p>Email: {provider.email}</p>
      <p>Average Rating: {averageRating.toFixed(1)}</p>
      <Services providerId={provider.id} />
      <Rating providerId={provider.id} />
    </div>
  );
};

export default ProviderProfile;
