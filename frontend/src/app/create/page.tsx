"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { contracts } from "@/abi"

export default function CreateCirclePage() {
  const { address, isConnected } = useAccount()
  const [formData, setFormData] = useState({
    circleName: "",
    contributionAmount: "",
    cycleDuration: "30", // days
    memberCount: "5",
    agreeToTerms: false,
  })
  
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [circleId, setCircleId] = useState<string | null>(null)
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [members, setMembers] = useState<string[]>([address || ""])

  // Contract write hook
  const { writeContract, data: hash, error: contractError, isPending } = useWriteContract()
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      // Transaction confirmed successfully
      const newCircleId = generateCircleId()
      setCircleId(newCircleId)
      const link = generateInvitationLink(newCircleId)
      setInvitationLink(link)
      setSuccess(true)
      setIsCreating(false)
    }
  }, [isConfirmed, hash])

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      setError("Transaction failed. Please try again.")
      setIsCreating(false)
    }
  }, [contractError])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.circleName.trim()) {
      setError("Circle name is required")
      return false
    }
    if (!formData.contributionAmount || parseFloat(formData.contributionAmount) <= 0) {
      setError("Contribution amount must be greater than 0")
      return false
    }
    if (!formData.agreeToTerms) {
      setError("You must agree to the terms")
      return false
    }
    return true
  }

  // Generate unique invitation link
  const generateInvitationLink = (circleId: string) => {
    const baseUrl = window.location.origin
    const invitationCode = btoa(`${circleId}-${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '')
    return `${baseUrl}/join-circle?code=${invitationCode}&circleId=${circleId}`
  }

  // Generate unique circle ID
  const generateCircleId = () => {
    return `circle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!isConnected) {
      setError("Please connect your wallet first")
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setIsCreating(true)
      
      // Generate unique circle ID
      const newCircleId = generateCircleId()
      setCircleId(newCircleId)
      
      // Convert contribution amount to USDT (6 decimals)
      const contributionAmount = parseEther(formData.contributionAmount)
      
      // Convert cycle duration to seconds
      const cycleDurationSeconds = BigInt(parseInt(formData.cycleDuration) * 24 * 60 * 60)
      
      // Create circle with creator as first member
      const initialMembers = [address!]
      setMembers(initialMembers)
      
      console.log("Creating circle with:", {
        circleId: newCircleId,
        name: formData.circleName,
        contributionAmount: formData.contributionAmount,
        cycleDuration: formData.cycleDuration,
        memberCount: formData.memberCount,
        members: initialMembers,
      })
      
      // Create circle using YieldCircleFactory
      writeContract({
        address: contracts.YieldCircleFactory.address as `0x${string}`,
        abi: contracts.YieldCircleFactory.abi,
        functionName: 'createCircle',
        args: [
          'family', // template name (family, friends, community)
          initialMembers,
          contributionAmount,
          cycleDurationSeconds,
          formData.circleName
        ]
      })
      
      // Transaction will be handled by useWaitForTransactionReceipt hook
      
    } catch (err) {
      console.error("Error creating circle:", err)
      setError("Failed to create circle. Please try again.")
      setIsCreating(false)
    }
  }

  // Copy invitation link to clipboard
  const copyToClipboard = async () => {
    if (invitationLink) {
      try {
        await navigator.clipboard.writeText(invitationLink)
        // You could add a toast notification here
        alert("Invitation link copied to clipboard!")
      } catch (err) {
        console.error("Failed to copy: ", err)
      }
    }
  }

  // Show success state with member invitation system
  if (success) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Circle Created Successfully!</h1>
            <p className="text-gray-400">Your yield circle is now active and ready for members.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Circle Details */}
            <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50">
              <h3 className="text-xl font-semibold mb-4">Circle Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Circle Name:</span>
                  <span className="text-white font-medium">{formData.circleName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contribution:</span>
                  <span className="text-white font-medium">{formData.contributionAmount} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cycle Duration:</span>
                  <span className="text-white font-medium">{formData.cycleDuration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Members:</span>
                  <span className="text-white font-medium">{formData.memberCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Circle ID:</span>
                  <span className="text-white font-mono text-sm">{circleId}</span>
                </div>
              </div>
            </div>

            {/* Member Invitation */}
            <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50">
              <h3 className="text-xl font-semibold mb-4">Invite Members</h3>
              
              {/* Current Members */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Current Members ({members.length}/{formData.memberCount})</h4>
                <div className="space-y-2">
                  {members.map((member: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-white text-sm font-mono">
                        {member === address ? "You (Creator)" : `${member.slice(0, 6)}...${member.slice(-4)}`}
                      </span>
                      {member === address && (
                        <span className="text-xs bg-teal-400 text-black px-2 py-1 rounded">Admin</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Invitation Link */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Invitation Link</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
                    <p className="text-xs text-gray-400 mb-2">Share this link with potential members:</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={invitationLink || ""}
                        readOnly
                        className="flex-1 bg-transparent text-white text-sm font-mono border-none outline-none"
                      />
                      <Button
                        onClick={copyToClipboard}
                        className="bg-teal-400 text-black hover:bg-teal-300 text-xs px-3 py-1"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={copyToClipboard}
                      className="flex-1 bg-teal-400 text-black hover:bg-teal-300"
                    >
                      Copy Link
                    </Button>
                    <Button
                      onClick={() => {
                        const message = `Join my Yield Circle "${formData.circleName}"! Contribute ${formData.contributionAmount} USDT every ${formData.cycleDuration} days and earn DeFi yields. Join here: ${invitationLink}`
                        const encodedMessage = encodeURIComponent(message)
                        window.open(`https://twitter.com/intent/tweet?text=${encodedMessage}`, '_blank')
                      }}
                      className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Share on Twitter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="text-sm font-medium text-blue-400 mb-2">How it works:</h4>
                <ul className="text-xs text-blue-300 space-y-1">
                  <li>• Share the invitation link with friends</li>
                  <li>• They'll join your circle automatically</li>
                  <li>• Once all {formData.memberCount} members join, the circle starts</li>
                  <li>• Members contribute {formData.contributionAmount} USDT every {formData.cycleDuration} days</li>
                  <li>• Funds are invested in DeFi for yield generation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button 
              onClick={() => window.location.href = '/discover-circle'}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              View All Circles
            </Button>
            <Button 
              onClick={() => window.location.href = '/user'}
              className="bg-teal-400 text-black hover:bg-teal-300"
            >
              Manage My Circles
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Yield Circle</h1>
          <p className="text-gray-400">Start a new savings circle with DeFi yield generation</p>
        </div>

        <div className="border border-gray-700 rounded-xl p-8 bg-gray-900/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Circle Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Circle Name</label>
              <input
                type="text"
                placeholder="e.g., Family Savings Circle"
                value={formData.circleName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("circleName", e.target.value)}
                className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-teal-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Contribution Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Contribution Amount (USDT)</label>
              <div className="relative">
              <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="100"
                  value={formData.contributionAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("contributionAmount", e.target.value)}
                  className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-teal-400 focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-3 text-gray-400 text-sm">USDT</span>
            </div>
            </div>

            {/* Cycle Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Cycle Duration (Days)</label>
              <select
                value={formData.cycleDuration}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange("cycleDuration", e.target.value)}
                className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-teal-400 focus:outline-none transition-colors"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            {/* Member Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Number of Members</label>
              <select
                value={formData.memberCount}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange("memberCount", e.target.value)}
                className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-teal-400 focus:outline-none transition-colors"
              >
                <option value="3">3 members</option>
                <option value="4">4 members</option>
                <option value="5">5 members</option>
                <option value="6">6 members</option>
                <option value="8">8 members</option>
                <option value="10">10 members</option>
              </select>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3 py-4">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("agreeToTerms", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-600 bg-transparent text-teal-400 focus:ring-teal-400 focus:ring-2"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-400 leading-relaxed cursor-pointer">
                I understand that funds will be invested in low-risk DeFi strategies and payouts will rotate per cycle. I agree to the terms and conditions.
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Wallet Connection Status */}
            {!isConnected && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm">Please connect your wallet to create a circle</span>
              </div>
            )}

            {/* Create Button */}
        <Button
          type="submit"
          disabled={!isConnected || isCreating || isPending || isConfirming}
          className="w-full bg-teal-400 text-black hover:bg-teal-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300 h-12 rounded-lg font-medium"
        >
          {isCreating || isPending || isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isPending ? "Confirm in Wallet..." : isConfirming ? "Creating Circle..." : "Creating..."}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Circle
            </>
          )}
        </Button>

            {/* Transaction Hash */}
            {hash && (
              <div className="text-center">
                <p className="text-sm text-gray-400">Transaction Hash:</p>
                <a 
                  href={`https://kairos.kaiascope.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 text-sm break-all"
                >
                  {hash}
                </a>
              </div>
            )}
          </form>
        </div>

        {/* Circle Preview */}
        <div className="mt-8 border border-gray-700 rounded-xl p-6 bg-gray-900/30">
          <h3 className="text-lg font-semibold mb-4">Circle Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Circle Name:</span>
              <span className="text-white">{formData.circleName || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contribution:</span>
              <span className="text-white">{formData.contributionAmount || "0"} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cycle Duration:</span>
              <span className="text-white">{formData.cycleDuration} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Members:</span>
              <span className="text-white">{formData.memberCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Pool:</span>
              <span className="text-white">
                {formData.contributionAmount && formData.memberCount 
                  ? (parseFloat(formData.contributionAmount) * parseInt(formData.memberCount)).toFixed(2)
                  : "0"
                } USDT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}