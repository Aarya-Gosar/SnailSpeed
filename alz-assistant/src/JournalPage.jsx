// JournalPage.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

function JournalPage() {
  const [journalEntry, setJournalEntry] = useState("");

  const handleJournalSubmit = () => {
    const element = document.createElement("a");
    const file = new Blob([journalEntry], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "journal_entry.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-4">Journal Your Day</h1>
      <textarea
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
        className="w-full h-64 p-2 border rounded-md bg-gray-800 text-gray-100"
        placeholder="Write your journal entry here..."
      />
      <Button onClick={handleJournalSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
        Submit Journal
      </Button>
    </div>
  );
}

export default JournalPage;
