// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button"; // Assuming your Button component
import HomePage from './HomePage';
import SetupForm from './SetupForm'; // Assuming you have SetupForm
import JournalPage from './JournalPage'; // Assuming you have JournalPage
import Location from './Location'; // Assuming you have Location
import AccountPage from './AccountPage'; // Import AccountPage

function App() {
  const [menuOpen, setMenuOpen] = useState(true);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-300 flex">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3 }}
              className="w-64 bg-gray-800 p-4"
            >
              <button onClick={toggleMenu} className="mb-4">
                {menuOpen ? "Close Menu" : "Open Menu"}
              </button>
              <ul className="space-y-2">
                <Link to="/">
                  <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                    <Button variant="ghost" className="w-full justify-start">
                      Home
                    </Button>
                  </li>
                </Link>
                <Link to="/location">
                  <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                    <Button variant="ghost" className="w-full justify-start">
                      Familiar Locations
                    </Button>
                  </li>
                </Link>
                <Link to="/setup">
                  <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                    <Button variant="ghost" className="w-full justify-start">
                      Setup
                    </Button>
                  </li>
                </Link>
                <Link to="/about">
                  <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                    <Button variant="ghost" className="w-full justify-start">
                      About
                    </Button>
                  </li>
                </Link>
                <Link to="/account">
                  <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                    <Button variant="ghost" className="w-full justify-start">
                      Your Account
                    </Button>
                  </li>
                </Link>
                <Link to="/journal">
                  <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                    <Button variant="ghost" className="w-full justify-start">
                      Journal Your Day
                    </Button>
                  </li>
                </Link>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="flex-1 overflow-y-auto transition-all duration-300 p-6"
          style={{ marginLeft: menuOpen ? "256px" : "0" }}
        >
          <button onClick={toggleMenu} className="mb-4 md:hidden">
            {menuOpen ? "Close Menu" : "Open Menu"}
          </button>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<SetupForm />} />
            <Route path="/about" element={<div className="space-y-4">
                <h1 className="text-3xl font-bold mb-4">About Memora</h1>
                <p className="text-gray-300">
                  Memora is designed to assist individuals with memory challenges, offering personalized support and reminders.
                </p>
                <p className="text-gray-300">
                  It helps manage daily routines, medications, and important contacts.
                </p>
                <p className="text-gray-300">
                  Our goal is to improve the quality of life by providing reliable and easy-to-use assistance.
                </p>
              </div>} />
            <Route path="/account" element={<AccountPage />} /> {/* Render AccountPage component */}
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/location" element={<Location />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
