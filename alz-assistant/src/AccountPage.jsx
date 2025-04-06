// AccountPage.jsx
import React, { useState, useEffect } from "react";
import { usePapaParse } from "react-papaparse";

function AccountPage() {
  const [accountData, setAccountData] = useState(null);
  const { readRemoteFile } = usePapaParse();

  useEffect(() => {
    readRemoteFile("data.csv", {
      header: true,
      complete: (results) => {
        setAccountData(results.data);
      },
      error: (error) => {
        console.error("Error reading CSV:", error);
      },
    });
  }, [readRemoteFile]);

  if (!accountData) {
    return <p className="text-center mt-8">Loading account information...</p>;
  }

  if (accountData.length === 0) {
    return <p className="text-center mt-8">No account information found.</p>;
  }

  const data = accountData[0];

  // Parse JSON strings from columns
  let personalInfo = {};
  let emotionalMedical = {};
  let locationVoice = {};
  let routineReminders = {};
  let peopleData = [];
  let objectsLocations = [];

  try {
    personalInfo = JSON.parse(data["Personal Information"] || "{}");
    emotionalMedical = JSON.parse(data["Emotional & Medical"] || "{}");
    locationVoice = JSON.parse(data["Location & Voice Prompt"] || "{}");
    routineReminders = JSON.parse(data["Routine & Reminders"] || "{}");

    // People You Know
    const emergencyContacts = data["Emergency Contacts"].split(";");
    peopleData = emergencyContacts.map((contact) => {
      const [name, details] = contact.split(":");
      return {
        name: name.trim(),
        relationship: details ? details.trim() : "Unknown",
      };
    });

    //Objects and Locations
    objectsLocations = data["Objects and Locations"].split(";");

  } catch (e) {
    console.error("Error parsing data:", e);
    return <p className="text-center mt-8">Error loading account data.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8">Your Account Information</h1>

      <div className="space-y-6">
        <div className="border p-4 rounded-md">
          <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
          <p>
            <strong>Full Name:</strong> {personalInfo["Full Name"]}
          </p>
          <p>
            <strong>Date of Birth:</strong> {personalInfo["Date of Birth"]}
          </p>
          <p>
            <strong>Health Conditions:</strong> {personalInfo["Health Conditions"]}
          </p>
          <p>
            <strong>Medications:</strong> {personalInfo["Medications"]}
          </p>
          <p>
            <strong>Daily Routine Summary:</strong> {personalInfo["Daily Routine Summary"]}
          </p>
        </div>

        <div className="border p-4 rounded-md">
          <h2 className="text-2xl font-semibold mb-4">Emotional & Medical</h2>
          <p>
            <strong>Emotional Triggers:</strong> {emotionalMedical["Emotional Triggers"]}
          </p>
          <p>
            <strong>Comforting Methods:</strong> {emotionalMedical["Comforting Methods"]}
          </p>
          <p>
            <strong>Medical History:</strong> {emotionalMedical["Medical History"]}
          </p>
        </div>

        <div className="border p-4 rounded-md">
          <h2 className="text-2xl font-semibold mb-4">Location & Voice Prompt</h2>
          <p>
            <strong>Home Address:</strong> {locationVoice["Home Address"]}
          </p>
          <p>
            <strong>Preferred Hospital:</strong> {locationVoice["Preferred Hospital"]}
          </p>
          <p>
            <strong>Voice Prompt Script:</strong> {locationVoice["Voice Prompt Script"]}
          </p>
        </div>

        <div className="border p-4 rounded-md">
          <h2 className="text-2xl font-semibold mb-4">Emergency Contacts</h2>
          <ul>
            {peopleData.map((person) => (
              <li key={person.name}>
                {person.name} ({person.relationship})
              </li>
            ))}
          </ul>
        </div>

        <div className="border p-4 rounded-md">
          <h2 className="text-2xl font-semibold mb-4">Routine & Reminders</h2>
          <p>
            <strong>Memory Description:</strong> {routineReminders["Memory Description"]}
          </p>
          <p>
            <strong>Safety Notes:</strong> {routineReminders["Safety Notes"]}
          </p>
          <p>
            <strong>Uploaded Image:</strong> {routineReminders["Uploaded Image"]}
          </p>
        </div>

        <div className="border p-4 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Objects and Locations</h2>
            <ul>
              {objectsLocations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
      </div>
    </div>
  );
}

export default AccountPage;
