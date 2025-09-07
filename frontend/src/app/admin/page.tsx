'use client';

import React, { useState, useEffect } from 'react';

export default function SchoolFeesDashboard() {
  const [selectedDate, setSelectedDate] = useState(24);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample data matching the Figma
  const members = [
    { name: 'Calculs', status: 'Initiate', color: 'bg-teal-500', progress: 75 },
    { name: 'Samuel', status: 'Sold', color: 'bg-blue-500', progress: 60 },
    { name: 'Annie', status: 'Buy', color: 'bg-purple-500', progress: 45 },
    { name: 'Similoluwa', status: 'New', color: 'bg-green-500', progress: 80 }
  ];

  const activityItems = [
    { type: 'Transfer from Annie', amount: '$200', date: 'Sept 07, 19:30:06', status: 'Successful', color: 'text-green-500' },
    { type: 'Transfer to Calculs', amount: '$200', date: 'Sept 07, 19:30:06', status: 'Failed', color: 'text-red-500' },
    { type: 'Transfer to Similoluwa', amount: '$200', date: 'Sept 07, 19:30:06', status: 'Pending', color: 'text-yellow-500' }
  ];

  const generateCalendar = () => {
    const year = 2024;
    const month = 8; // September (0-indexed)
    const daysInMonth = 30;
    
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return { dayNames, days };
  };

  const { dayNames, days } = generateCalendar();

  return (
    <div className="min-h-screen bg-black text-white p-6" >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        
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

      {/* School Fees Circle Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">School Fees Circle</h2>
        <p className="text-gray-400 text-sm">Monthly - 1003 USDT per member</p>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        
        {/* Left Column - Balance Cards */}
        <div className="col-span-3 space-y-4">
          {/* USDT Balance */}
          <div className="relative">
            <div className="absolute inset-0 rounded-lg" style={{
              background: 'linear-gradient(90deg, #DA35E9 0%, #7AC2BC 50%, #1AF29B 100%)',
              padding: '1px'
            }}>
              <div className="bg-gray-900/90 backdrop-blur rounded-lg p-4">
                <p className="text-teal-400 text-xs mb-2">USDT Balance</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </div>

          {/* Circle Balance */}
          <div className="relative">
            <div className="absolute inset-0 rounded-lg" style={{
              background: 'linear-gradient(90deg, #DA35E9 0%, #7AC2BC 50%, #1AF29B 100%)',
              padding: '1px'
            }}>
              <div className="bg-gray-900/90 backdrop-blur rounded-lg p-4">
                <p className="text-purple-400 text-xs mb-2">Circle Balance</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Stats Cards */}
        <div className="col-span-3 space-y-4">
          {/* Reward */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs">Reward</p>
                <p className="text-lg font-semibold">0%</p>
              </div>
              <div className="text-teal-400 text-xl">✦</div>
            </div>
          </div>

          {/* Next Payout */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs">Next Payout</p>
                <p className="text-lg font-semibold">Sept. 24</p>
              </div>
              <div className="text-blue-400 text-xl">∞</div>
            </div>
          </div>

          {/* Exit APY */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs">Exit APY</p>
                <p className="text-lg font-semibold">0%</p>
              </div>
              <div className="text-green-400 text-xl">$</div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs">Risk Level</p>
                <p className="text-lg font-semibold">Low</p>
              </div>
              <div className="text-green-400 text-xl">📈</div>
            </div>
          </div>
        </div>

        {/* Right Column - Calendar */}
        <div className="col-span-6">
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">September</h3>
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
            
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {[...Array(3)].map((_, i) => (
                <div key={`empty-${i}`} className="p-3"></div>
              ))}
              
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`p-3 text-sm rounded-lg text-center transition-all font-medium ${
                    day === 7
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : day === 24
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Three Cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* Members Card */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Members</h3>
          <div className="space-y-5">
            {members.map((member, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${member.color}`}></div>
                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                    {member.status}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-700/50 rounded-full">
                  <div 
                    className={`h-full ${member.color} rounded-full transition-all`} 
                    style={{width: `${member.progress}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution Level Card */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Contribution Level</h3>
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
                  strokeDasharray={`${87 * 2.2} ${100 * 2.2}`}
                  className="text-yellow-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">87%</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Amount Target:</span>
              <span className="font-medium">$2000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contribution Round:</span>
              <span className="font-medium">0/6</span>
            </div>
            <div className="w-full h-2 bg-gray-700/50 rounded-full">
              <div className="h-full bg-purple-500 rounded-full" style={{width: '87%'}}></div>
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Activity</h3>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
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
                  strokeDasharray={`${87 * 2.2} ${100 * 2.2}`}
                  className="text-green-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">87%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {activityItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'Successful' ? 'bg-green-500' :
                    item.status === 'Failed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="text-xs font-medium">{item.type}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{item.amount}</p>
                  <p className={`text-xs ${item.color}`}>{item.status}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center mt-4">
              <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <span>See more</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}