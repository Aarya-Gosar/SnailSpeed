// Location.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

function Location() {
  const [locations, setLocations] = useState([
    {
      name: "Grandma's House",
      googleMapsLink: "https://www.google.com/maps/place/Grandma's+House/@...", // Replace with actual link
      distance: "2.5 miles away",
    },
    {
      name: "Grocery Store",
      googleMapsLink: "https://www.google.com/maps/place/Grocery+Store/@...", // Replace with actual link
      distance: "1.2 miles away",
    },
    {
      name: "Doctor's Office",
      googleMapsLink: "https://www.google.com/maps/place/Doctor's+Office/@...", // Replace with actual link
      distance: "5 miles away",
    },
  ]);
  const [newLocationName, setNewLocationName] = useState("");
  const [newGoogleMapsLink, setNewGoogleMapsLink] = useState("");

  const handleAddLocation = () => {
    if (newLocationName && newGoogleMapsLink) {
      setLocations([
        ...locations,
        {
          name: newLocationName,
          googleMapsLink: newGoogleMapsLink,
          distance: "Unknown distance", // You can calculate distance later
        },
      ]);
      setNewLocationName("");
      setNewGoogleMapsLink("");
    } else {
      alert("Please enter a location name and Google Maps link.");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-4">Familiar Locations</h1>
      <ul>
        {locations.map((location, index) => (
          <li key={index} className="border p-4 rounded-md space-y-2">
            <h2 className="text-xl font-semibold">{location.name}</h2>
            <a
              href={location.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on Google Maps
            </a>
            <p className="text-gray-400">{location.distance}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input
          type="text"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          placeholder="Location Name"
          className="w-full p-2 border rounded-md bg-gray-800 text-gray-100"
        />
        <input
          type="text"
          value={newGoogleMapsLink}
          onChange={(e) => setNewGoogleMapsLink(e.target.value)}
          placeholder="Google Maps Link"
          className="w-full p-2 border rounded-md bg-gray-800 text-gray-100"
        />
        <Button
          onClick={handleAddLocation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add Location
        </Button>
      </div>
    </div>
  );
}

export default Location;
