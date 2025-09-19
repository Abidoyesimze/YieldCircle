"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { contracts } from "@/abi"

export default function JoinCirclePage() {
  const { address, isConnected } = useAccount()
  const [circleAddress, setCircleAddress] = useState<string | null>(null)
  const [circleInfo, setCircleInfo] = useState<any>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [invitationData, setInvitationData] = useState<any>(null)
  const [circleStatus, setCircleStatus] = useState<any>(null)

  useEffect(() => {
    // Extract invitation data from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const circle = urlParams.get('circle')
    const name = urlParams.get('name')
    const members = urlParams.get('members')
    const amount = urlParams.get('amount')
    const duration = urlParams.get('duration')
    
    if (circle && name && members && amount && duration) {
      setCircleAddress(circle)
      setInvitationData({
        name: decodeURIComponent(name),
        members: parseInt(members),
        amount: parseFloat(amount),
        duration: parseInt(duration)
      })
      
      // Check circle status if wallet is connected
      if (address) {
        checkCircleStatus(circle)
      }
    } else {
      setError("Invalid invitation link - missing required parameters")
    }
  }, [address])

  const checkCircleStatus = async (circleAddr: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const yieldCircleContract = new ethers.Contract(
        circleAddr,
        contracts.YieldCircle.abi,
        provider
      )
      
      const circleInfo = await yieldCircleContract.circle()
      const memberInfo = await yieldCircleContract.members(address)
      
      setCircleStatus({
        phase: circleInfo.phase,
        positionsInitialized: circleInfo.positionsInitialized,
        isActive: circleInfo.isActive,
        memberInfo: memberInfo
      })
    } catch (err) {
      console.error("Error checking circle status:", err)
    }
  }

  const joinCircle = async () => {
    if (!address || !circleAddress) return

    setIsJoining(true)
    setError(null)

    try {
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Connect to the specific YieldCircle contract (the circle address from the invitation)
      const yieldCircleContract = new ethers.Contract(
        circleAddress,
        contracts.YieldCircle.abi,
        signer
      )

      // First, let's check the circle status
      const circleInfo = await yieldCircleContract.circle()
      console.log("Circle Info:", circleInfo)
      
      // Check if user is already a member
      const memberInfo = await yieldCircleContract.members(address)
      console.log("Member Info:", memberInfo)
      
      // Check if positions are initialized
      const positionsInitialized = circleInfo.positionsInitialized
      console.log("Positions Initialized:", positionsInitialized)
      
      // Check circle phase
      const phase = circleInfo.phase
      console.log("Circle Phase:", phase)
      
      if (!positionsInitialized) {
        setError("Circle positions are not initialized yet. Please wait for the circle to be fully set up.")
        setIsJoining(false)
        return
      }
      
      if (phase !== 0) { // 0 = SETUP phase
        setError(`Circle is not in setup phase. Current phase: ${phase}`)
        setIsJoining(false)
        return
      }
      
      if (memberInfo.wallet === "0x0000000000000000000000000000000000000000") {
        setError("You are not authorized to join this circle. Only invited members can join.")
        setIsJoining(false)
        return
      }
      
      if (memberInfo.name !== "") {
        setError("You have already joined this circle.")
        setIsJoining(false)
        return
      }

      // Call joinCircle function with a display name
      const displayName = `Member_${address.slice(0, 6)}` // Generate a simple display name
      const tx = await yieldCircleContract.joinCircle(displayName, {
        gasLimit: 500000
      })
      
      setTxHash(tx.hash)
      await tx.wait()
      
      setIsJoined(true)
      setIsJoining(false)
    } catch (err: any) {
      console.error("Error joining circle:", err)
      setError(err.message || "Failed to join circle")
      setIsJoining(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to join this yield circle.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-teal-400 text-black hover:bg-teal-300"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  // Show loading while processing invitation data
  if (!invitationData && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-teal-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-4">Processing Invitation</h2>
          <p className="text-gray-300 mb-6">
            Loading circle details from invitation link...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-teal-400 text-black hover:bg-teal-300"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  if (isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Successfully Joined!</h2>
          <p className="text-gray-300 mb-6">
            You have successfully joined the yield circle. The circle will start once all members have joined.
          </p>
          {txHash && (
            <p className="text-xs text-gray-400 mb-4">
              Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </p>
          )}
          <Button 
            onClick={() => window.location.href = '/user'}
            className="w-full bg-teal-400 text-black hover:bg-teal-300"
          >
            View My Circles
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join Yield Circle</h1>
          <p className="text-gray-300">
            You've been invited to join a yield circle!
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Circle Details</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p><span className="text-teal-400">Circle Name:</span> {invitationData?.name}</p>
              <p><span className="text-teal-400">Members:</span> {invitationData?.members}</p>
              <p><span className="text-teal-400">Contribution:</span> {invitationData?.amount} USDT</p>
              <p><span className="text-teal-400">Duration:</span> {invitationData?.duration} days</p>
              <p><span className="text-teal-400">Circle Address:</span> {circleAddress?.slice(0, 10)}...{circleAddress?.slice(-8)}</p>
              <p><span className="text-teal-400">Your Address:</span> {address?.slice(0, 10)}...{address?.slice(-8)}</p>
            </div>
          </div>

          {/* Circle Status */}
          {circleStatus && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Circle Status</h4>
              <div className="space-y-1 text-xs text-blue-300">
                <p>Phase: {circleStatus.phase === 0 ? 'SETUP' : circleStatus.phase === 1 ? 'WAITING_RANDOM' : circleStatus.phase === 2 ? 'COLLECTING' : circleStatus.phase}</p>
                <p>Positions Initialized: {circleStatus.positionsInitialized ? 'Yes' : 'No'}</p>
                <p>Circle Active: {circleStatus.isActive ? 'Yes' : 'No'}</p>
                <p>Your Status: {circleStatus.memberInfo.wallet === "0x0000000000000000000000000000000000000000" ? 'Not a member' : circleStatus.memberInfo.name === "" ? 'Member (not joined)' : 'Already joined'}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-400 mb-2">What happens next:</h4>
            <ul className="text-xs text-blue-300 space-y-1">
              <li>• You'll join the circle immediately</li>
              <li>• Circle starts when all members join</li>
              <li>• You'll contribute the specified amount each cycle</li>
              <li>• Earn DeFi yields on your contributions</li>
            </ul>
          </div>

          <Button
            onClick={joinCircle}
            disabled={isJoining}
            className="w-full bg-teal-400 text-black hover:bg-teal-300 disabled:opacity-50"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining Circle...
              </>
            ) : (
              "Join Circle"
            )}
          </Button>

          {txHash && (
            <div className="text-center">
              <p className="text-xs text-gray-400">
                Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}