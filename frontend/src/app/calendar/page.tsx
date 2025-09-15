'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function InteractiveCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedContributionIndex, setSelectedContributionIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample contributions data
  const contributions = [
    {
      name: "Christmas Contribution",
      amount: "$500",
      status: "Weekly - 6wk",
      progress: 75,
      color: "bg-green-500",
      details: {
        target: "$2000",
        round: "3/6",
        nextPayout: "Dec 25, 2024",
        members: 8
      }
    },
    {
      name: "House Rent",
      amount: "$1200",
      status: "Monthly - 6mo",
      progress: 45,
      color: "bg-blue-500",
      details: {
        target: "$7200",
        round: "2/6",
        nextPayout: "Jan 15, 2025",
        members: 6
      }
    },
    {
      name: "My Family",
      amount: "$300",
      status: "Monthly - 8mo",
      progress: 85,
      color: "bg-purple-500",
      details: {
        target: "$2400",
        round: "6/8",
        nextPayout: "Oct 30, 2024",
        members: 4
      }
    },
    {
      name: "School Union",
      amount: "$800",
      status: "Weekly - 10wk",
      progress: 30,
      color: "bg-yellow-500",
      details: {
        target: "$8000",
        round: "3/10",
        nextPayout: "Sept 14, 2024",
        members: 10
      }
    },
    {
      name: "Mom's Birthday Party",
      amount: "$200",
      status: "Weekly - 8wk",
      progress: 60,
      color: "bg-pink-500",
      details: {
        target: "$1600",
        round: "4/8",
        nextPayout: "Sept 27, 2024",
        members: 5
      }
    },
    {
      name: "Student Loan",
      amount: "$1500",
      status: "Bi-weekly - 12wk",
      progress: 90,
      color: "bg-red-500",
      details: {
        target: "$18000",
        round: "10/12",
        nextPayout: "Sept 20, 2024",
        members: 1
      }
    }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Contribution navigation
  const goToPreviousContribution = () => {
    setSelectedContributionIndex(prev => 
      prev === 0 ? contributions.length - 1 : prev - 1
    );
  };

  const goToNextContribution = () => {
    setSelectedContributionIndex(prev => 
      prev === contributions.length - 1 ? 0 : prev + 1
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const currentContribution = contributions[selectedContributionIndex];
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-center items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs">📊</span>
            </div>
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs">⚙️</span>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs">❓</span>
            </div>
          </div>
          <div className="bg-purple-600 px-3 py-1 rounded text-sm">
            16 x 16
          </div>
          <input 
            type="search" 
            placeholder="Search..." 
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm w-48"
          />
          <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
            <span className="text-xs">🔔</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column - Calendar */}
        <div className="col-span-7">
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={goToPreviousMonth}
                    className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={goToNextMonth}
                    className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
            
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 p-3">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div key={index} className="h-12 flex items-center justify-center">
                  {day && (
                    <button
                      className={`w-10 h-10 text-sm rounded-lg text-center transition-all font-medium flex items-center justify-center ${
                        isCurrentMonth && day === today.getDate()
                          ? 'bg-purple-600 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Contribution Level */}
        <div className="col-span-5">
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6 h-full">
            <h3 className="text-lg font-semibold mb-6">Contribution Level - {currentContribution.name}</h3>
            
            {/* Progress Circle */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-700/50"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${currentContribution.progress * 2.2} ${100 * 2.2}`}
                    className={`${currentContribution.color.replace('bg-', 'text-')}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{currentContribution.progress}%</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Amount Target:</p>
                  <p className="text-lg font-semibold">{currentContribution.details.target}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Current Amount:</p>
                  <p className="text-lg font-semibold">{currentContribution.amount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Contribution Round:</p>
                  <p className="text-lg font-semibold">{currentContribution.details.round}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Members:</p>
                  <p className="text-lg font-semibold">{currentContribution.details.members}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Next Payout:</p>
                  <p className="text-lg font-semibold text-blue-400">{currentContribution.details.nextPayout}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Progress Bar:</p>
                <div className="w-full h-3 bg-gray-700/50 rounded-full">
                  <div 
                    className={`h-full ${currentContribution.color} rounded-full transition-all`}
                    style={{width: `${currentContribution.progress}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Contribution View */}
      <div className="mt-6">
        <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Contribution View</h3>
          </div>
          
          <div className="grid grid-cols-6 gap-4">
            {contributions.map((contribution, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  index === selectedContributionIndex 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedContributionIndex(index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${contribution.color}`}></div>
                    <span className="text-sm font-medium">{contribution.name}</span>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                    {contribution.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">{contribution.amount}</span>
                  <span className="text-xs text-gray-400">{contribution.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700/50 rounded-full">
                  <div 
                    className={`h-full ${contribution.color} rounded-full transition-all`}
                    style={{width: `${contribution.progress}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}