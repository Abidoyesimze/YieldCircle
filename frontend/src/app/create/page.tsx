"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Plus } from "lucide-react"

export default function CreateCirclePage() {
  const [formData, setFormData] = useState({
    contributionName: "",
    amount: "",
    monthly: "",
    duration: "",
    member: "",
    agreeToTerms: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission logic here
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-md">
       

        <div className="border border-gray-700 rounded-lg p-6">
         <h1 className="text-2xl font-bold mb-8">Create Circle</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contribution Name */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Contribution Name</label>
              <input
                type="text"
                placeholder="e.g Family savings"
                value={formData.contributionName}
                onChange={(e) => handleInputChange("contributionName", e.target.value)}
                className="w-full bg-transparent border-b border-gray-700 pb-2 text-white placeholder-gray-500 focus:border-teal-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Amount</label>
              <input
                type="text"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="w-full bg-transparent border-b border-gray-700 pb-2 text-white placeholder-gray-500 focus:border-teal-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Monthly */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Monthly</label>
              <input
                type="text"
                placeholder="Monthly"
                value={formData.monthly}
                onChange={(e) => handleInputChange("monthly", e.target.value)}
                className="w-full bg-transparent border-b border-gray-700 pb-2 text-white placeholder-gray-500 focus:border-teal-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Duration</label>
              <input
                type="text"
                placeholder="2months"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                className="w-full bg-transparent border-b border-gray-700 pb-2 text-white placeholder-gray-500 focus:border-teal-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Member */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Member</label>
              <input
                type="text"
                placeholder="4"
                value={formData.member}
                onChange={(e) => handleInputChange("member", e.target.value)}
                className="w-full bg-transparent border-b border-gray-700 pb-2 text-white placeholder-gray-500 focus:border-teal-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-start space-x-3 py-4">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-600 bg-transparent text-teal-400 focus:ring-teal-400 focus:ring-2"
              />
              <label htmlFor="agreeToTerms" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                I understand funds are invest in low-risk DeFi strategies and payouts rotate per circle
              </label>
            </div>

            {/* Create Button */}
            <Button
              type="submit"
              className="w-full bg-transparent border border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black transition-all duration-300 h-12 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
