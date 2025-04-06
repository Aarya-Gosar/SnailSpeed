import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';

const MemoraSetup = () => {
  const [page, setPage] = useState(0);
  const [routineEvents, setRoutineEvents] = useState({});
  const [selectedHour, setSelectedHour] = useState(null);
  const [eventText, setEventText] = useState("");
  const [healthConditions, setHealthConditions] = useState([]);
  const [medicationList, setMedicationList] = useState([]);
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [medicationTimes, setMedicationTimes] = useState({});
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: "", relationship: "", phone: "", notes: "" });
  const [objectsLocations, setObjectsLocations] = useState([]);
  const [newObjectLocation, setNewObjectLocation] = useState({ object: "", location: "" });
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dailyRoutineSummary, setDailyRoutineSummary] = useState("");
  const [emotionalTriggers, setEmotionalTriggers] = useState("");
  const [comfortingMethods, setComfortingMethods] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [preferredHospital, setPreferredHospital] = useState("");
  const [voicePromptScript, setVoicePromptScript] = useState("");
  const [memoryDescription, setMemoryDescription] = useState("");
  const [safetyNotes, setSafetyNotes] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  const handleHourClick = (hour) => {
    setSelectedHour(hour);
    setEventText(routineEvents[hour] || "");
  };

  const saveEvent = () => {
    setRoutineEvents({ ...routineEvents, [selectedHour]: eventText });
    setSelectedHour(null);
    setEventText("");
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setHealthConditions([...healthConditions, newCondition.trim()]);
      setNewCondition("");
    }
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setMedicationList([...medicationList, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const updateMedicationTime = (med, index, value) => {
    const updatedTimes = medicationTimes[med] ? [...medicationTimes[med]] : [];
    updatedTimes[index] = value;
    setMedicationTimes({ ...medicationTimes, [med]: updatedTimes });
  };

  const addMedicationTimeField = (med) => {
    const updatedTimes = medicationTimes[med] ? [...medicationTimes[med], ""] : [""];
    setMedicationTimes({ ...medicationTimes, [med]: updatedTimes });
  };

  const updateNewContact = (field, value) => {
    setNewContact({ ...newContact, [field]: value });
  };

  const addEmergencyContact = () => {
    if (newContact.name.trim() && newContact.relationship && newContact.phone.trim()) {
      setEmergencyContacts([...emergencyContacts, newContact]);
      setNewContact({ name: "", relationship: "", phone: "", notes: "" });
    }
  };

  const updateNewObjectLocation = (field, value) => {
    setNewObjectLocation({ ...newObjectLocation, [field]: value });
  };

  const addObjectLocation = () => {
    if (newObjectLocation.object.trim() && newObjectLocation.location.trim()) {
      setObjectsLocations([...objectsLocations, newObjectLocation]);
      setNewObjectLocation({ object: "", location: "" });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setUploadedImage(file);
  };

  const handleFinishSetup = async () => {
    const personalInfo = {
      "Full Name": fullName,
      "Date of Birth": dateOfBirth,
      "Health Conditions": healthConditions.join(", "),
      "Medications": medicationList.map(med => {
        const times = medicationTimes[med]?.join(", ") || "";
        return `${med}: ${times}`;
      }).join("; "),
      "Daily Routine Summary": dailyRoutineSummary,
    };

    const emotionalMedical = {
      "Emotional Triggers": emotionalTriggers,
      "Comforting Methods": comfortingMethods,
      "Medical History": medicalHistory,
    };

    const locationVoice = {
      "Home Address": homeAddress,
      "Preferred Hospital": preferredHospital,
      "Voice Prompt Script": voicePromptScript,
    };

    const emergencyContactsFormatted = emergencyContacts.map(contact => {
      return `${contact.name} (${contact.relationship}): ${contact.phone} - ${contact.notes}`;
    }).join("; ");

    const routineReminders = {
      "Routine Events": JSON.stringify(routineEvents),
      "Memory Description": memoryDescription,
      "Safety Notes": safetyNotes,
      "Uploaded Image": uploadedImage?.name || "No Image Uploaded",
    };

    const objectsLocationsFormatted = objectsLocations.map(item => {
      return `${item.object} - ${item.location}`;
    }).join("; ");

    const data = {
      "Personal Information": JSON.stringify(personalInfo),
      "Emotional & Medical": JSON.stringify(emotionalMedical),
      "Location & Voice Prompt": JSON.stringify(locationVoice),
      "Emergency Contacts": emergencyContactsFormatted,
      "Routine & Reminders": JSON.stringify(routineReminders),
      "Objects and Locations": objectsLocationsFormatted,
    };

    const csv = Papa.unparse({
      fields: Object.keys(data),
      data: [Object.values(data)],
    });

    const zip = new JSZip();
    zip.file("setup_data.csv", csv);

    if (uploadedImage) {
      zip.file(uploadedImage.name, uploadedImage);
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, "setup_data.zip");
    });

    setPage(7);
  };

  useEffect(() => {
    window.addEventListener('scroll', function () {
      const parallax = document.querySelector('.parallax');
      if (parallax) {
        let scrollPosition = window.pageYOffset;
        parallax.style.backgroundPositionY = scrollPosition * 0.7 + 'px';
      }
    });
    return () => window.removeEventListener('scroll', () => { });
  }, []);

  const menuVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  if (page === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl font-extrabold mb-4">Welcome to Memora Setup</h1>
        <p className="text-lg text-gray-400 mb-8">Let's configure Memora for personalized assistance.</p>
        <Button onClick={() => setPage(1)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full">
          Start Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-800 text-gray-100">
      <motion.div
        className="w-64 bg-gray-900 text-gray-100 p-4 fixed top-0 left-0 h-full z-50"
        initial="closed"
        animate={menuOpen ? 'open' : 'closed'}
        variants={menuVariants}
        transition={{ duration: 0.3 }}
      >
        <Button onClick={() => setMenuOpen(!menuOpen)} className="mb-4">
          {menuOpen ? 'Close Menu' : 'Open Menu'}
        </Button>
        <ul className="space-y-2">
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => setPage(7)}>Home</li>
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => setPage(1)}>Setup</li>
        </ul>
      </motion.div>

      <div className="flex-1 transition-all duration-300 p-6" style={{ marginLeft: menuOpen ? '256px' : '0' }}>
        <AnimatePresence>
          {page === 7 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="bg-gray-700 rounded-xl shadow-2xl p-8">
                <h1 className="text-3xl font-semibold mb-6">Memora Setup Complete, {fullName || 'User'}!</h1>
                <p className="text-gray-300 mb-8">Here's a summary of your setup:</p>

                <div className="space-y-4">
                  <div className="border-b border-gray-600 pb-4">
                    <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
                    <p><strong>Full Name:</strong> {fullName || "None"}</p>
                    <p><strong>Date of Birth:</strong> {dateOfBirth || "None"}</p>
                    <p><strong>Health Conditions:</strong> {healthConditions.join(", ") || "None"}</p>
                    <p><strong>Medications:</strong> {medicationList.map(med => {
                      const times = medicationTimes[med]?.join(", ") || "None";
                      return `${med}: ${times}`;
                    }).join("; ") || "None"}</p>
                    <p><strong>Daily Routine Summary:</strong> {dailyRoutineSummary || "None"}</p>
                  </div>

                  <div className="border-b border-gray-600 pb-4">
                    <h2 className="text-xl font-semibold mb-2">Emotional & Medical</h2>
                    <p><strong>Emotional Triggers:</strong> {emotionalTriggers || "None"}</p>
                    <p><strong>Comforting Methods:</strong> {comfortingMethods || "None"}</p>
                    <p><strong>Medical History:</strong> {medicalHistory || "None"}</p>
                  </div>

                  <div className="border-b border-gray-600 pb-4">
                    <h2 className="text-xl font-semibold mb-2">Location & Voice</h2>
                    <p><strong>Home Address:</strong> {homeAddress || "None"}</p>
                    <p><strong>Preferred Hospital:</strong> {preferredHospital || "None"}</p>
                    <p><strong>Voice Prompt:</strong> {voicePromptScript || "None"}</p>
                  </div>

                  <div className="border-b border-gray-600 pb-4">
                    <h2 className="text-xl font-semibold mb-2">Emergency Contacts</h2>
                    <ul>
                      {emergencyContacts.map((contact, index) => (
                        <li key={index}>
                          <strong>{contact.name}</strong> ({contact.relationship}) - {contact.phone} {contact.notes && `- ${contact.notes}`}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-b border-gray-600 pb-4">
                    <h2 className="text-xl font-semibold mb-2">Routine & Reminders</h2>
                    <ul>
                      {Object.entries(routineEvents).map(([time, event]) => (
                        <li key={time}><strong>{time}</strong>: {event}</li>
                      ))}
                    </ul>
                    <p><strong>Memory Description:</strong> {memoryDescription || "None"}</p>
                    <p><strong>Safety Notes:</strong> {safetyNotes || "None"}</p>
                    <p><strong>Uploaded Image:</strong> {uploadedImage?.name || "None"}</p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-2">Objects & Locations</h2>
                    <ul>
                      {objectsLocations.map((item, index) => (
                        <li key={index}><strong>{item.object}</strong>: {item.location}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {page >= 1 && page <= 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="bg-gray-700 rounded-xl shadow-2xl p-8">
                {page === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
                    <Input placeholder="Full Name" className="bg-gray-800 text-gray-100" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <Input placeholder="Date of Birth" className="bg-gray-800 text-gray-100" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />

                    <div>
                      <Input placeholder="Add Known Health Condition" value={newCondition} onChange={(e) => setNewCondition(e.target.value)} className="bg-gray-800 text-gray-100" />
                      <Button onClick={addCondition} className="bg-blue-600 hover:bg-blue-700 text-white">Add Condition</Button>
                      <ul className="list-disc pl-5">
                        {healthConditions.map((cond, idx) => <li key={idx}>{cond}</li>)}
                      </ul>
                    </div>

                    <div>
                      <Input placeholder="Add Medication" value={newMedication} onChange={(e) => setNewMedication(e.target.value)} className="bg-gray-800 text-gray-100" />
                      <Button onClick={addMedication} className="bg-blue-600 hover:bg-blue-700 text-white">Add Medication</Button>
                      <div>
                        {medicationList.map((med, idx) => (
                          <div key={idx}>
                            <div className="font-medium">{med}</div>
                            {(medicationTimes[med] || []).map((time, index) => (
                              <Select key={index} onValueChange={(value) => updateMedicationTime(med, index, value)}>
                                <SelectTrigger className="bg-gray-800 text-gray-100">
                                  <SelectValue placeholder="Select Time" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-gray-100">
                                  {hours.map((hour) => (
                                    <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ))}
                            <Button onClick={() => addMedicationTimeField(med)} size="sm" variant="outline" className="bg-gray-700 hover:bg-gray-600 text-white">+ Add Time</Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Textarea placeholder="Daily Routine Summary" className="bg-gray-800 text-gray-100" value={dailyRoutineSummary} onChange={(e) => setDailyRoutineSummary(e.target.value)} />
                    <Button onClick={() => setPage(2)} className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button>
                  </div>
                )}

                {page === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">Emotional & Medical Information</h2>
                    <Textarea placeholder="Emotional Triggers" className="bg-gray-800 text-gray-100" value={emotionalTriggers} onChange={(e) => setEmotionalTriggers(e.target.value)} />
                    <Textarea placeholder="Comforting Methods" className="bg-gray-800 text-gray-100" value={comfortingMethods} onChange={(e) => setComfortingMethods(e.target.value)} />
                    <Textarea placeholder="Medical History (Surgeries, Allergies)" className="bg-gray-800 text-gray-100" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} />
                    <Button onClick={() => setPage(1)} className="bg-gray-600 hover:bg-gray-700 text-white">Back</Button>
                    <Button onClick={() => setPage(3)} className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button>
                  </div>
                )}

                {page === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">Location & Voice Prompt</h2>
                    <Input placeholder="Home Address" className="bg-gray-800 text-gray-100" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} />
                    <Input placeholder="Preferred Hospital / Doctor" className="bg-gray-800 text-gray-100" value={preferredHospital} onChange={(e) => setPreferredHospital(e.target.value)} />
                    <Textarea placeholder="Voice Prompt Script (Used when AI responds)" className="bg-gray-800 text-gray-100" value={voicePromptScript} onChange={(e) => setVoicePromptScript(e.target.value)} />
                    <Button onClick={() => setPage(2)} className="bg-gray-600 hover:bg-gray-700 text-white">Back</Button>
                    <Button onClick={() => setPage(4)} className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button>
                  </div>
                )}

                {page === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">Emergency Contacts</h2>
                    <Input placeholder="Name" className="bg-gray-800 text-gray-100" value={newContact.name} onChange={(e) => updateNewContact("name", e.target.value)} />
                    <Select onValueChange={(value) => updateNewContact("relationship", value)}>
                      <SelectTrigger className="bg-gray-800 text-gray-100">
                        <SelectValue placeholder="Relationship" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-gray-100">
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="caregiver">Caregiver</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Phone Number" className="bg-gray-800 text-gray-100" value={newContact.phone} onChange={(e) => updateNewContact("phone", e.target.value)} />
                    <Textarea placeholder="Important Notes for Emergency" className="bg-gray-800 text-gray-100" value={newContact.notes} onChange={(e) => updateNewContact("notes", e.target.value)} />
                    <Button onClick={addEmergencyContact} className="bg-blue-600 hover:bg-blue-700 text-white">+ Add Contact</Button>

                    <ul className="list-disc pl-5">
                      {emergencyContacts.map((contact, index) => (
                        <li key={index}>
                          <strong>{contact.name}</strong> ({contact.relationship}) - {contact.phone}
                          {contact.notes && <div className="text-sm text-gray-400">Note: {contact.notes}</div>}
                        </li>
                      ))}
                    </ul>

                    <Button onClick={() => setPage(3)} className="bg-gray-600 hover:bg-gray-700 text-white">Back</Button>
                    <Button onClick={() => setPage(5)} className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button>
                  </div>
                )}

                {page === 5 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">Routine & Reminders</h2>
                    <div className="grid grid-cols-6 gap-2">
                      {hours.map((hour) => (
                        <Button key={hour} variant="outline" onClick={() => handleHourClick(hour)} className="bg-gray-800 hover:bg-gray-700 text-gray-100">{hour}</Button>
                      ))}
                    </div>

                    {selectedHour && (
                      <div className="bg-gray-800 rounded p-4">
                        <h3 className="text-lg font-medium mb-2">Add Event for {selectedHour}</h3>
                        <Textarea value={eventText} onChange={(e) => setEventText(e.target.value)} className="bg-gray-700 text-gray-100" placeholder="Describe event/reminder" />
                        <Button onClick={saveEvent} className="bg-blue-600 hover:bg-blue-700 text-white">Save Event</Button>
                        <Button variant="outline" onClick={() => setSelectedHour(null)} className="bg-gray-600 hover:bg-gray-700 text-white">Cancel</Button>
                      </div>
                    )}

                    <h3 className="text-xl font-medium mt-6 mb-2">Uploaded Faces & Memories</h3>
                    <Input type="file" accept="image/*" className="bg-gray-800 text-gray-100" onChange={handleImageUpload} />
                    <Textarea placeholder="Story or Memory Description" className="bg-gray-800 text-gray-100" value={memoryDescription} onChange={(e) => setMemoryDescription(e.target.value)} />

                    <h3 className="text-xl font-medium mt-6 mb-2">Safety Notes</h3>
                    <Textarea placeholder="Special safety instructions or known issues" className="bg-gray-800 text-gray-100" value={safetyNotes} onChange={(e) => setSafetyNotes(e.target.value)} />

                    <Button onClick={() => setPage(4)} className="bg-gray-600 hover:bg-gray-700 text-white">Back</Button>
                    <Button onClick={() => setPage(6)} className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button>
                  </div>
                )}

                {page === 6 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">Objects and Locations</h2>
                    <Input placeholder="Object Name" className="bg-gray-800 text-gray-100" value={newObjectLocation.object} onChange={(e) => updateNewObjectLocation("object", e.target.value)} />
                    <Input placeholder="Location" className="bg-gray-800 text-gray-100" value={newObjectLocation.location} onChange={(e) => updateNewObjectLocation("location", e.target.value)} />
                    <Button onClick={addObjectLocation} className="bg-blue-600 hover:bg-blue-700 text-white">+ Add Object and Location</Button>

                    <ul className="list-disc pl-5">
                      {objectsLocations.map((item, index) => (
                        <li key={index}>
                          <strong>{item.object}</strong> - {item.location}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => setPage(5)} className="bg-gray-600 hover:bg-gray-700 text-white">Back</Button>
                    <Button onClick={handleFinishSetup} className="bg-red-600 hover:bg-red-700 text-white">Finish Setup</Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemoraSetup;
