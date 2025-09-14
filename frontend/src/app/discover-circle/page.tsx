'use client';

import React from 'react';
import { ChevronRight, DollarSign, Calendar, Gift, GraduationCap, Users, Activity as ActivityIcon } from 'lucide-react';

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

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  title,
  icon,
  weekly,
  nextPayday,
  member,
  amountTarget
}) => {
  return (
    <div className="bg-black-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-green-400">{icon}</div>
        <h3 className="text-white font-medium">{title}</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Weekly</span>
          <span className="text-white text-sm">{weekly}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Next payday</span>
          <span className="text-white text-sm">{nextPayday}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Member</span>
          <span className="text-white text-sm">{member}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Amount Target</span>
          <span className="text-white text-sm">{amountTarget}</span>
        </div>
      </div>
    </div>
  );
};

const DiscoverCircleCard: React.FC = () => {
  const houseRentItems: HouseRentItem[] = [
    { monthly: 20, duration: '6 month', status: 'active' },
    { monthly: 20, duration: '6 month', status: 'active' },
    { monthly: 20, duration: '6 month', status: 'completed' },
    { monthly: 20, duration: '6 month', status: 'completed' }
  ];

  return (
    <div className="bg-black-900 border border-black-800 rounded-lg p-4">
      <h3 className="text-white font-medium mb-4">Discover Circle</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {houseRentItems.map((item, index) => (
          <div key={index} className="space-y-3">
            <div className="text-center">
              <div className="text-white text-xs mb-1">HOUSE RENT</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Monthly</span>
                <span className="text-white text-xs">${item.monthly}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Duration</span>
                <span className="text-white text-xs">{item.duration}</span>
              </div>
            </div>
            
            <button 
              className={`w-full py-2 px-3 rounded text-xs font-medium ${
                item.status === 'active' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}
            >
              {item.status === 'active' ? 'Start Discovery' : 'Start Discovery'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityCard: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      type: 'Transfer from Amila',
      description: 'Sept 07, 19:30:06',
      amount: 200,
      status: 'successful'
    },
    {
      type: 'Transfer to Collins',
      description: 'Sept 07, 19:30:06',
      amount: 200,
      status: 'failed'
    },
    {
      type: 'Transfer to Gbadamos',
      description: 'Sept 07, 19:30:06',
      amount: 200,
      status: 'successful'
    }
  ];

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
      <h3 className="text-white font-medium mb-4">Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
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
        ))}
        
        <button className="flex items-center justify-center gap-2 w-full mt-4 text-gray-400 hover:text-white transition-colors">
          <span className="text-sm">See more</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const FinancialDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-black p-6">
      {/* Grid pattern background */}
      <div className="fixed inset-0 opacity-10">
        <div className="w-full h-full"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Top section - Savings Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SavingsGoalCard
            title="School Fee"
            icon={<GraduationCap size={20} />}
            weekly="0/52"
            nextPayday="Sept. 24"
            member={0}
            amountTarget={0}
          />
          
          <SavingsGoalCard
            title="Mom's Birthday Party"
            icon={<Gift size={20} />}
            weekly="0/52"
            nextPayday="Sept. 24"
            member={0}
            amountTarget={0}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SavingsGoalCard
            title="Christmas Contribution"
            icon={<Gift size={20} />}
            weekly="0/52"
            nextPayday="Sept. 24"
            member={0}
            amountTarget={0}
          />
          
          <SavingsGoalCard
            title="Student"
            icon={<GraduationCap size={20} />}
            weekly="0/52"
            nextPayday="Sept. 24"
            member={0}
            amountTarget={0}
          />
        </div>
        
        {/* Bottom section - Discover Circle and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DiscoverCircleCard />
          <ActivityCard />
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;