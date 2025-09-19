'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, DollarSign, Calendar, Gift, GraduationCap, Users, Activity as ActivityIcon, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { contracts } from '@/abi';

interface SavingsGoalCardProps {
  title: string;
  icon: React.ReactNode;
  weekly: string;
  nextPayday: string;
  member: number;
  amountTarget: number;
}

interface HouseRentItem {
  monthly: number;
  duration: string;
  status: 'active' | 'completed';
}

interface ActivityItem {
  type: string;
  description: string;
  amount: number;
  status: 'successful' | 'pending' | 'failed';
}

interface CircleData {
  address: string;
  name: string;
  contributionAmount: string;
  cycleDuration: string;
  memberCount: number;
  currentMembers: number;
  poolBalance: string;
  totalYieldEarned: string;
  phase: string;
  creator: string;
  createdAt: string;
}

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  title,
  icon,
  weekly,
  nextPayday,
  member,
  amountTarget
}) => {
  return (
    <div className="bg-black-900 border border-gray-800 rounded-lg p-4 hover:border-teal-400/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-green-400">{icon}</div>
        <h3 className="text-white font-medium">{title}</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Cycle Duration</span>
          <span className="text-white text-sm">{weekly}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Next Cycle</span>
          <span className="text-white text-sm">{nextPayday}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Members</span>
          <span className="text-white text-sm">{member}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Contribution</span>
          <span className="text-white text-sm">${amountTarget} USDT</span>
        </div>
      </div>
    </div>
  );
};

const DiscoverCircleCard: React.FC<{ circles: CircleData[] }> = ({ circles }) => {
  // Show first 4 circles or fill with empty states
  const displayCircles = circles.slice(0, 4);
  const emptySlots = Math.max(0, 4 - circles.length);

  return (
    <div className="bg-black-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-white font-medium mb-4">Available Circles ({circles.length})</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {displayCircles.map((circle, index) => (
          <div key={index} className="space-y-3">
            <div className="text-center">
              <div className="text-white text-xs mb-1 truncate">{circle.name.toUpperCase()}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Contribution</span>
                <span className="text-white text-xs">${circle.contributionAmount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Duration</span>
                <span className="text-white text-xs">{circle.cycleDuration} days</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Members</span>
                <span className="text-white text-xs">{circle.currentMembers}/{circle.memberCount}</span>
              </div>
            </div>
            
            <button 
              className={`w-full py-2 px-3 rounded text-xs font-medium ${
                circle.currentMembers < circle.memberCount
                  ? 'bg-teal-500 text-white hover:bg-teal-600' 
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
              disabled={circle.currentMembers >= circle.memberCount}
            >
              {circle.currentMembers < circle.memberCount ? 'Join Circle' : 'Circle Full'}
            </button>
          </div>
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div key={`empty-${index}`} className="space-y-3">
            <div className="text-center">
              <div className="text-gray-600 text-xs mb-1">NO CIRCLES</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Contribution</span>
                <span className="text-gray-500 text-xs">-</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Duration</span>
                <span className="text-gray-500 text-xs">-</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Members</span>
                <span className="text-gray-500 text-xs">-</span>
              </div>
            </div>
            
            <button 
              className="w-full py-2 px-3 rounded text-xs font-medium bg-gray-700 text-gray-400 cursor-not-allowed"
              disabled
            >
              No Circles
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityCard: React.FC<{ circles: CircleData[] }> = ({ circles }) => {
  // Generate activity from circles data
  const activities: ActivityItem[] = circles.slice(0, 3).map(circle => ({
    type: `Circle Created: ${circle.name}`,
    description: circle.createdAt,
    amount: parseFloat(circle.contributionAmount),
    status: circle.currentMembers < circle.memberCount ? 'pending' : 'successful' as 'successful' | 'pending' | 'failed'
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-white font-medium mb-4">Recent Activity ({activities.length})</h3>
      
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'successful' ? 'bg-green-400' : 
                  activity.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
                <div>
                  <div className="text-white text-sm font-medium">{activity.type}</div>
                  <div className="text-gray-400 text-xs">{activity.description}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white text-sm font-medium">${activity.amount}</div>
                <div className={`text-xs capitalize ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>No recent activity</p>
            <p className="text-xs mt-2">Circle activities will appear here</p>
          </div>
        )}
        
        {activities.length > 0 && (
          <button className="flex items-center justify-center gap-2 w-full mt-4 text-gray-400 hover:text-white transition-colors">
            <span className="text-sm">See more</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const FinancialDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all circles from smart contracts
  useEffect(() => {
    const fetchAllCircles = async () => {
      if (!isConnected) {
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

        // Get circle count first
        const circleCount = await factoryContract.getCircleCount();
        
        // Get all circles by accessing the public array
        const allCircles = [];
        for (let i = 0; i < circleCount; i++) {
          const circleAddress = await factoryContract.allCircles(i);
          allCircles.push(circleAddress);
        }
        
        // Fetch details for each circle
        const circleDetails = await Promise.all(
          allCircles.map(async (circleAddress: string) => {
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

              return {
                address: circleAddress,
                name: circleInfo.name,
                contributionAmount: ethers.formatUnits(circleInfo.contributionAmount, 6),
                cycleDuration: (Number(circleInfo.cycleDuration) / (24 * 60 * 60)).toString(), // Convert to days
                memberCount: Number(memberCount),
                currentMembers: Number(memberCount), // For now, assume all members are active
                poolBalance: ethers.formatUnits(poolBalance, 6),
                totalYieldEarned: ethers.formatUnits(totalYieldEarned, 6),
                phase: phase,
                creator: circleInfo.creator,
                createdAt: new Date(Number(circleInfo.createdAt) * 1000).toLocaleDateString()
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
        console.error('Error fetching circles:', error);
        setError('Failed to load circles');
        setLoading(false);
      }
    };

    fetchAllCircles();
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Please connect your wallet to discover yield circles.</p>
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
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 mx-auto mb-4"></div>
            {/* Inner spinning ring */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-teal-400 border-r-purple-400 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-teal-400 rounded-full"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-teal-400">Discovering Circles</h2>
          <p className="text-gray-400 mb-4">Fetching available circles from the blockchain...</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="animate-pulse">●</div>
            <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</div>
            <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-teal-400 text-black px-6 py-2 rounded-lg hover:bg-teal-300 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get top 4 circles for display
  const topCircles = circles.slice(0, 4);

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Grid pattern background */}
      <div className="fixed inset-0 opacity-10">
        <div className="w-full h-full"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Discover Yield Circles</h1>
          <p className="text-gray-400">Find and join yield circles created by the community</p>
        </div>

        {/* Top section - Featured Circles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {topCircles.slice(0, 2).map((circle, index) => (
            <SavingsGoalCard
              key={index}
              title={circle.name}
              icon={<GraduationCap size={20} />}
              weekly={`${circle.cycleDuration} days`}
              nextPayday={circle.createdAt}
              member={circle.currentMembers}
              amountTarget={parseFloat(circle.contributionAmount)}
            />
          ))}
          
          {/* Fill remaining slots if needed */}
          {topCircles.length < 2 && (
            <SavingsGoalCard
              title="No Circles Available"
              icon={<GraduationCap size={20} />}
              weekly="0 days"
              nextPayday="N/A"
              member={0}
              amountTarget={0}
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {topCircles.slice(2, 4).map((circle, index) => (
            <SavingsGoalCard
              key={index + 2}
              title={circle.name}
              icon={<Gift size={20} />}
              weekly={`${circle.cycleDuration} days`}
              nextPayday={circle.createdAt}
              member={circle.currentMembers}
              amountTarget={parseFloat(circle.contributionAmount)}
            />
          ))}
          
          {/* Fill remaining slots if needed */}
          {topCircles.length < 4 && topCircles.length >= 2 && (
            <SavingsGoalCard
              title="No More Circles"
              icon={<Gift size={20} />}
              weekly="0 days"
              nextPayday="N/A"
              member={0}
              amountTarget={0}
            />
          )}
        </div>
        
        {/* Bottom section - Discover Circle and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DiscoverCircleCard circles={circles} />
          <ActivityCard circles={circles} />
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;