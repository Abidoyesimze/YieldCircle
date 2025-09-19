"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { contracts } from "@/abi"

export default function JoinCirclePage() {
  const { address, isConnected } = useAccount()
  const [circleId, setCircleId] = useState<string | null>(null)
  const [circleInfo, setCircleInfo] = useState<any>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    // Extract circle ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const invitationCode = urlParams.get('invite')
    
    if (invitationCode) {
      try {
        // Decode the invitation code to get circle ID
        const decoded = atob(invitationCode)
        const [id] = decoded.split('-')
        setCircleId(id)
      } catch (err) {
        setError("Invalid invitation link")
      }
    } else {
      setError("No invitation code found")
    }
  }, [])

  const joinCircle = async () => {
    if (!address || !circleId) return

    setIsJoining(true)
    setError(null)

    try {
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Connect to YieldCircle contract
      const yieldCircleContract = new ethers.Contract(
        contracts.YieldCircle.address,
        contracts.YieldCircle.abi,
        signer
      )

      // Call joinCircle function
      const tx = await yieldCircleContract.joinCircle("", { // Empty display name for now
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
              <p>Circle ID: {circleId}</p>
              <p>Your Address: {address?.slice(0, 10)}...{address?.slice(-8)}</p>
            </div>
          </div>

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