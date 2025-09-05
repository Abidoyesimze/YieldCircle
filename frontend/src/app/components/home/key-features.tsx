export default function KeyFeatures() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Key Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Your Money Works for You</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your pooled contributions are strategically invested using AI-powered strategies for better returns than
                you could achieve on your own.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Simple and Reliable Trust</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our members build a trust score from their saving history, so circles stay safe and dependable.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Designed for Real Life</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Whether it's local ties, emergencies, or group goals, our platform works seamlessly through LINE.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Make Contribution Form */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Make Contribution</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter wallet address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Family</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter family name"
                />
              </div>
            </div>
          </div>

          {/* Kaia + Line Integration */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              <div className="w-32 h-32 rounded-full border-2 border-teal-500 flex items-center justify-center bg-gray-900">
                <span className="text-2xl font-bold text-white">Kaia</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <span className="text-black font-bold text-sm">+</span>
              </div>
              <div className="w-32 h-32 rounded-full border-2 border-teal-500 flex items-center justify-center bg-gray-900">
                <span className="text-2xl font-bold text-white">Line</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
