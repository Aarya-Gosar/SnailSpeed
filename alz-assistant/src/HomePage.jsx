// HomePage.jsx
import React, { useState } from "react";
import { usePapaParse } from "react-papaparse";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import JSZip from "jszip";
import { motion } from "framer-motion";

const localizer = momentLocalizer(moment);

function HomePage() {
  const [fileData, setFileData] = useState(null);
  const [images, setImages] = useState({});
  const [showData, setShowData] = useState(false);
  const { readString } = usePapaParse();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/zip") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const zip = new JSZip();
        const content = await zip.loadAsync(e.target.result);
        const csvFile = Object.values(content.files).find((f) =>
          f.name.endsWith(".csv")
        );
        if (csvFile) {
          const csvString = await csvFile.async("string");
          readString(csvString, {
            header: true,
            complete: (results) => {
              setFileData(results.data);
              setShowData(true);
            },
          });
        }
        const imageFiles = Object.values(content.files).filter((f) =>
          f.name.match(/\.(jpe?g|png|gif)$/i)
        );
        const imagePromises = imageFiles.map(async (f) => {
          const imageData = await f.async("base64");
          return [f.name, `data:image/${f.name.split(".").pop()};base64,${imageData}`];
        });
        const imageEntries = await Promise.all(imagePromises);
        setImages(Object.fromEntries(imageEntries));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const renderDataDisplay = () => {
    if (!showData) {
      return (
        <div className="flex justify-center items-center h-full">
          <input
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            className="mb-4 p-2 border rounded-md"
          />
        </div>
      );
    }

    if (!fileData || fileData.length === 0) {
      return <p className="text-gray-400 text-center">No data to display.</p>;
    }

    const data = fileData[0];

    let personalInfo = {};
    let routineReminders = {};
    try {
      personalInfo = JSON.parse(data["Personal Information"] || "{}");
      routineReminders = JSON.parse(data["Routine & Reminders"] || "{}");
    } catch (e) {
      console.error("Error parsing JSON:", e);
    }

    let events = [];
    try {
      const routineEvents = JSON.parse(routineReminders["Routine Events"] || "{}");
      events = Object.entries(routineEvents).map(([time, title]) => ({
        title: title,
        start: moment(time, "HH:mm").toDate(),
        end: moment(time, "HH:mm").add(1, "hours").toDate(),
      }));
    } catch (e) {
      console.error("Error parsing Routine Events:", e);
    }

    let medicationData = [];
    try {
      medicationData = personalInfo.Medications.split(";")
        .filter((med) => med)
        .map((med) => ({
          name: med.split(":")[0].trim(),
          quantity: 1,
        }));
    } catch (e) {
      console.error("Error parsing Medications:", e);
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="space-y-6">
          {Object.entries(images).map(([name, src]) => (
            <motion.div
              key={name}
              whileHover={{ scale: 1.05 }}
              className="rounded-md overflow-hidden shadow-md"
            >
              <img src={src} alt={name} className="w-full" />
              <p className="p-4 text-lg text-center">Do you remember this?</p>
            </motion.div>
          ))}
          <div className="p-4 rounded-md shadow-md">
            <h3 className="text-2xl font-semibold mb-2">Memory</h3>
            <p className="text-lg">{routineReminders["Memory Description"]}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-lg">
              <strong>Today's Routine:</strong> {personalInfo["Daily Routine Summary"]}
            </p>
            <p className="text-lg">
              <strong>Medications:</strong> {personalInfo["Medications"]}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-green-500">Your Calendar</h3>
            <div style={{ height: 400 }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-purple-500">Medication Overview</h3>
            <LineChart width={600} height={300} data={medicationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="quantity" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-8 text-white text-center">Hi, how's your day been?</h1>
      {renderDataDisplay()}
    </div>
  );
}

export default HomePage;
