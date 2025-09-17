"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { CheckCircle, AlertCircle, Users, DollarSign, Clock, UserPlus } from "lucide-react"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { contracts } from "@/abi"

export default function JoinCirclePage() {
  const { address, isConnected } = useAccount()
  const [circleData, setCircleData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [invitationCode, setInvitationCode] = useState<string | null>(null)
  const [circleId, setCircleId] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const id = urlParams.get('circleId')
    
    if (code && id) {
      setInvitationCode(code)
      setCircleId(id)
      // In a real implementation, you'd fetch circle data from your backend/contract
      // For now, we'll simulate the data
      simulateCircleData(id)
    } else {
      setError("Invalid invitation link")
      setIsLoading(false)
    }
  }, [])

  const simulateCircleData = (id: string) => {
    // Simulate fetching circle data
    setTimeout(() => {
      setCircleData({
        id: id,
        name: "Family Savings Circle",
        contributionAmount: "100",
        cycleDuration: "30",
        memberCount: "5",
        currentMembers: 2,
        members: [
          "0x1234567890123456789012345678901234567890",
          "0x0987654321098765432109876543210987654321"
        ],
        creator: "0x1234567890123456789012345678901234567890",
        status: "active",
        totalPool: "500"
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleJoinCircle = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first")
      return
    }

    if (!circleData) {
      setError("Circle data not found")
      return
    }

    try {
      setIsJoining(true)
      
      console.log("Joining circle:", {
        circleId: circleData.id,
        member: address,
        contributionAmount: circleData.contributionAmount,
      })
      
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Create contract instance
      const circleContract = new ethers.Contract(
        circleData.id, // Circle address from invitation
        contracts.YieldCircle.abi,
        signer
      )
      
      // Call joinCircle function
      const tx = await circleContract.joinCircle('Member') // Display name for the member
      
      setTxHash(tx.hash)
      setIsConfirming(true)
      
      // Wait for transaction confirmation
      const receipt = await tx.wait()
      
      if (receipt.status === 1) {
        // Transaction successful
        setSuccess(true)
        setIsJoining(false)
        setIsConfirming(false)
      } else {
        throw new Error("Transaction failed")
      }
      
    } catch (err: any) {
      console.error("Error joining circle:", err)
      setError(err.message || "Failed to join circle. Please try again.")
      setIsJoining(false)
      setIsConfirming(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading circle information...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Welcome to the Circle!</h1>
          <p className="text-gray-400 mb-6">You've successfully joined "{circleData?.name}". You'll be notified when the circle starts.</p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/user'}
              className="w-full bg-teal-400 text-black hover:bg-teal-300"
            >
              View My Circles
            </Button>
            <Button 
              onClick={() => window.location.href = '/discover-circle'}
              className="w-full bg-gray-700 text-white hover:bg-gray-600"
            >
              Discover More Circles
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (error && !circleData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.href = '/discover-circle'}
            className="bg-teal-400 text-black hover:bg-teal-300"
          >
            Discover Circles
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <UserPlus className="w-16 h-16 text-teal-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Join Yield Circle</h1>
          <p className="text-gray-400">You've been invited to join a savings circle</p>
        </div>

        {/* Circle Information */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 mb-6">
          <h2 className="text-xl font-semibold mb-4">{circleData?.name}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Circle Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-teal-400" />
                <div>
                  <p className="text-sm text-gray-400">Contribution Amount</p>
                  <p className="text-lg font-semibold">{circleData?.contributionAmount} USDT</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-teal-400" />
                <div>
                  <p className="text-sm text-gray-400">Cycle Duration</p>
                  <p className="text-lg font-semibold">{circleData?.cycleDuration} days</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-teal-400" />
                <div>
                  <p className="text-sm text-gray-400">Members</p>
                  <p className="text-lg font-semibold">{circleData?.currentMembers}/{circleData?.memberCount}</p>
                </div>
              </div>
            </div>

            {/* Circle Stats */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Total Pool Size</p>
                <p className="text-xl font-bold text-teal-400">{circleData?.totalPool} USDT</p>
              </div>
              
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Your Contribution</p>
                <p className="text-xl font-bold text-white">{circleData?.contributionAmount} USDT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Members */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 mb-6">
          <h3 className="text-lg font-semibold mb-4">Current Members</h3>
          <div className="space-y-2">
            {circleData?.members.map((member: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {index + 1}
                </div>
                <span className="text-white text-sm font-mono">
                  {member === circleData?.creator ? "Creator" : `${member.slice(0, 6)}...${member.slice(-4)}`}
                </span>
                {member === circleData?.creator && (
                  <span className="text-xs bg-teal-400 text-black px-2 py-1 rounded">Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 mb-6">
          <h3 className="text-lg font-semibold mb-4">How it Works</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center text-black font-bold text-xs mt-0.5">1</div>
              <p>Join the circle by confirming your participation</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center text-black font-bold text-xs mt-0.5">2</div>
              <p>Once all {circleData?.memberCount} members join, the circle becomes active</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center text-black font-bold text-xs mt-0.5">3</div>
              <p>Each member contributes {circleData?.contributionAmount} USDT every {circleData?.cycleDuration} days</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center text-black font-bold text-xs mt-0.5">4</div>
              <p>Funds are invested in DeFi protocols to generate yield</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center text-black font-bold text-xs mt-0.5">5</div>
              <p>Payouts rotate among members each cycle</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* Wallet Connection Status */}
        {!isConnected && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 text-sm">Please connect your wallet to join the circle</span>
          </div>
        )}

        {/* Join Button */}
        <Button
          onClick={handleJoinCircle}
          disabled={!isConnected || isJoining || isConfirming || circleData?.currentMembers >= circleData?.memberCount}
          className="w-full bg-teal-400 text-black hover:bg-teal-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300 h-12 rounded-lg font-medium"
        >
          {isJoining || isConfirming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              {isJoining ? "Confirm in Wallet..." : "Joining Circle..."}
            </>
          ) : circleData?.currentMembers >= circleData?.memberCount ? (
            "Circle is Full"
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Join Circle
            </>
          )}
        </Button>

        {/* Transaction Hash */}
        {txHash && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">Transaction Hash:</p>
            <a 
              href={`https://kairos.kaiascope.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 text-sm break-all"
            >
              {txHash}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
