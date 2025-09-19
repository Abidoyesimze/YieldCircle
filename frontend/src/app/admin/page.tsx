'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { contracts } from '@/abi';

export default function SchoolFeesDashboard() {
  const { address, isConnected } = useAccount();
  const [selectedDate, setSelectedDate] = useState(24);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user's created circles from smart contracts
  useEffect(() => {
    const fetchUserCircles = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        // Get provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Connect to SimpleYieldCircleFactory contract
        const factoryContract = new ethers.Contract(
          contracts.SimpleYieldCircleFactory.address,
          contracts.SimpleYieldCircleFactory.abi,
          signer
        );

        // Get all circles created by this user
        const userCircles = await factoryContract.getUserCircles(address);
        
        // Fetch details for each circle
        const circleDetails = await Promise.all(
          userCircles.map(async (circleAddress: string) => {
            try {
              const circleContract = new ethers.Contract(
                circleAddress,
                contracts.YieldCircle.abi,
                signer
              );

              // Get basic circle info
              const circleInfo = await circleContract.getCircleInfo();
              const memberCount = await circleContract.getMemberCount();
              const poolBalance = await circleContract.getPoolBalance();
              const totalYieldEarned = await circleContract.getTotalYieldEarned();
              const phase = await circleContract.getCurrentPhase();

              // Get members data
              const [memberAddresses, memberNames] = await circleContract.getMembers();
              const members = await Promise.all(
                memberAddresses.map(async (memberAddress: string, index: number) => {
                  try {
                    const memberInfo = await circleContract.getMemberInfo(memberAddress);
                    return {
                      address: memberAddress,
                      name: memberNames[index] || `Member ${index + 1}`,
                      payoutPosition: Number(memberInfo.payoutPosition),
                      hasContributed: memberInfo.hasContributed,
                      hasReceivedPayout: memberInfo.hasReceivedPayout,
                      totalContributions: ethers.formatUnits(memberInfo.totalContributions, 6),
                      joinedTimestamp: new Date(Number(memberInfo.joinedTimestamp) * 1000),
                      isActive: memberInfo.isActive
                    };
                  } catch (error) {
                    console.error(`Error fetching member ${memberAddress}:`, error);
                    return {
                      address: memberAddress,
                      name: `Member ${index + 1}`,
                      payoutPosition: 0,
                      hasContributed: false,
                      hasReceivedPayout: false,
                      totalContributions: '0',
                      joinedTimestamp: new Date(),
                      isActive: true
                    };
                  }
                })
              );

              // Get activity events (last 10 events)
              const filter = circleContract.filters.ContributionMade();
              const events = await circleContract.queryFilter(filter, -1000); // Last 1000 blocks
              const activity = events.slice(-10).map(event => {
                const eventLog = event as any; // Type assertion for event args
                return {
                  type: 'Contribution Made',
                  member: eventLog.args?.member || 'Unknown',
                  amount: ethers.formatUnits(eventLog.args?.amount || 0, 6),
                  cycle: Number(eventLog.args?.cycle || 0),
                  date: new Date(Number(event.blockNumber) * 12000), // Approximate block time
                  status: 'Successful',
                  txHash: event.transactionHash
                };
              });

              return {
                address: circleAddress,
                name: circleInfo.name,
                contributionAmount: ethers.formatUnits(circleInfo.contributionAmount, 6),
                cycleDuration: Number(circleInfo.cycleDuration) / (24 * 60 * 60), // Convert to days
                memberCount: Number(memberCount),
                poolBalance: ethers.formatUnits(poolBalance, 6),
                totalYieldEarned: ethers.formatUnits(totalYieldEarned, 6),
                phase: phase,
                creator: circleInfo.creator,
                createdAt: new Date(Number(circleInfo.createdAt) * 1000).toLocaleDateString(),
                members: members,
                activity: activity
              };
            } catch (error) {
              console.error(`Error fetching circle ${circleAddress}:`, error);
              return null;
            }
          })
        );

        // Filter out null results and set circles
        setCircles(circleDetails.filter(circle => circle !== null));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user circles:', error);
        setLoading(false);
      }
    };

    fetchUserCircles();
  }, [address]);

  // Helper function to get member status and color
  const getMemberStatus = (member: any) => {
    if (member.hasReceivedPayout) return { status: 'Completed', color: 'bg-green-500', progress: 100 };
    if (member.hasContributed) return { status: 'Contributed', color: 'bg-blue-500', progress: 75 };
    if (member.isActive) return { status: 'Active', color: 'bg-teal-500', progress: 50 };
    return { status: 'Inactive', color: 'bg-gray-500', progress: 25 };
  };

  // Helper function to format activity items
  const formatActivityItems = (activity: any[]) => {
    return activity.map(item => ({
      type: item.type,
      amount: `$${item.amount}`,
      date: item.date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      status: item.status,
      color: item.status === 'Successful' ? 'text-green-500' : 'text-red-500'
    }));
  };

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

  // Use real data if available, otherwise show empty state
  const currentCircle = circles.length > 0 ? circles[0] : null;
  const circleName = currentCircle ? currentCircle.name : 'No Circles Created';
  const contributionAmount = currentCircle ? `${currentCircle.contributionAmount} USDT` : '0 USDT';
  const poolBalance = currentCircle ? currentCircle.poolBalance : '0.00';
  const totalYield = currentCircle ? currentCircle.totalYieldEarned : '0.00';
  const members = currentCircle ? currentCircle.members : [];
  const activityItems = currentCircle ? formatActivityItems(currentCircle.activity) : [];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Please connect your wallet to view your created circles.</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-teal-400 text-black px-6 py-2 rounded-lg hover:bg-teal-300 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your circles...</p>
        </div>
      </div>
    );
  }

  if (circles.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Created Circles</h1>
            <p className="text-gray-400">Manage and monitor your yield circles</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <button 
              onClick={() => window.location.href = '/create'}
              className="bg-teal-400 text-black px-6 py-2 rounded-lg hover:bg-teal-300 transition-colors"
            >
              Create New Circle
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-2xl font-semibold mb-4">No Circles Created Yet</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Create your first yield circle to start earning with friends and family. 
            Set up contribution amounts, invite members, and watch your savings grow.
          </p>
          <button 
            onClick={() => window.location.href = '/create'}
            className="bg-teal-400 text-black px-8 py-3 rounded-lg hover:bg-teal-300 transition-colors font-semibold"
          >
            Create Your First Circle
          </button>
        </div>
      </div>
    );
  }

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
            {circles.length} x {circles.length}
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

      {/* Circle Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">{circleName}</h2>
        <p className="text-gray-400 text-sm">Monthly - {contributionAmount} per member</p>
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
                <p className="text-2xl font-bold">${poolBalance}</p>
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
                <p className="text-2xl font-bold">${poolBalance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Stats Cards */}
        <div className="col-span-3 space-y-4">
          {/* Reward */}
          <div className="bgblack-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs">Reward</p>
                <p className="text-lg font-semibold">{totalYield}%</p>
              </div>
              <div className="text-teal-400 text-xl">✦</div>
            </div>
          </div>

          {/* Next Payout */}
          <div className="bg-black-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs">Next Payout</p>
                <p className="text-lg font-semibold">Sept. 24</p>
              </div>
              <div className="text-blue-400 text-xl">∞</div>
            </div>
          </div>

          {/* Exit APY */}
          <div className="bg-black-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs">Exit APY</p>
                <p className="text-lg font-semibold">0%</p>
              </div>
              <div className="text-green-400 text-xl">$</div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-black-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-4">
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
          <div className="bg-black-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6 h-full">
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
        <div className="bg-black-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Members ({members.length})</h3>
          <div className="space-y-5">
            {members.length > 0 ? (
              members.map((member: any, index: number) => {
                const memberStatus = getMemberStatus(member);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${memberStatus.color}`}></div>
                        <span className="text-sm font-medium">{member.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                        {memberStatus.status}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700/50 rounded-full">
                      <div 
                        className={`h-full ${memberStatus.color} rounded-full transition-all`} 
                        style={{width: `${memberStatus.progress}%`}}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Position: {member.payoutPosition} | Total: ${member.totalContributions}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No members yet</p>
                <p className="text-xs mt-2">Members will appear here when they join</p>
              </div>
            )}
          </div>
        </div>

        {/* Contribution Level Card */}
        <div className="bg-black-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6">
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
                  strokeDasharray={`${currentCircle ? (parseFloat(poolBalance) / (parseFloat(contributionAmount) * members.length)) * 100 * 2.2 : 0} ${100 * 2.2}`}
                  className="text-yellow-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {currentCircle ? Math.round((parseFloat(poolBalance) / (parseFloat(contributionAmount) * members.length)) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Amount Target:</span>
              <span className="font-medium">${currentCircle ? (parseFloat(contributionAmount) * members.length).toFixed(2) : '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Balance:</span>
              <span className="font-medium">${poolBalance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Members:</span>
              <span className="font-medium">{members.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-700/50 rounded-full">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all" 
                style={{
                  width: `${currentCircle ? Math.min((parseFloat(poolBalance) / (parseFloat(contributionAmount) * members.length)) * 100, 100) : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="bg-black-900/80 backdrop-blur border border-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Activity ({activityItems.length})</h3>
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
                  strokeDasharray={`${activityItems.length > 0 ? Math.min(activityItems.length * 10, 100) * 2.2 : 0} ${100 * 2.2}`}
                  className="text-green-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{activityItems.length}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {activityItems.length > 0 ? (
              activityItems.map((item, index) => (
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
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No activity yet</p>
                <p className="text-xs mt-2">Contributions will appear here</p>
              </div>
            )}
            {activityItems.length > 0 && (
              <div className="flex items-center justify-center mt-4">
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                  <span>See more</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}