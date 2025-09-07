export default function KeyFeatures() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Key Features */}
        <div className="text-center mb-16">
          <h2 
            className="text-white mb-12"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '24px',
              fontWeight: 600,
              lineHeight: '100%',
              letterSpacing: '0%'
            }}
          >
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div 
              className="bg-black-950 rounded-lg p-6"
              style={{
                border: '1px solid',
                borderImageSource: 'linear-gradient(126.45deg, #DA35E9 -31.48%, #F3EECC -0.74%, #DA35E9 43.88%, #121212 80.67%)',
                borderImageSlice: 1
              }}
            >
              <div className="mb-4 flex justify-start">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L2 9v2h20V9l-10-6zM2 13v6h2v-6H2zm4 6h2v-6H6v6zm4 0h2v-6h-2v6zm4 0h2v-6h-2v6zm4 0h2v-6h-2v6zm2 2v2H2v-2h20z"/>
                </svg>
              </div>
              <h3 
                className="text-white mb-3 text-left"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 400,
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                Your Money Works for You
              </h3>
              <p 
                className="text-gray-400 text-left"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 300,
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                Your pooled contributions are<br /> strategically invested with AI-powered<br /> strategies, so your money grows while you<br /> save.
              </p>
            </div>

            {/* Feature 2 */}
            <div 
              className="bg-black-900/50 rounded-lg p-6"
              style={{
                border: '1px solid',
                borderImageSource: 'linear-gradient(126.45deg, #ED1E79 -31.48%, #F3EECC -0.51%, #ED1E79 34.58%, #121212 80.67%)',
                borderImageSlice: 1
              }}
            >
              <div className="mb-4 flex justify-start">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L2 9v2h20V9l-10-6zM2 13v6h2v-6H2zm4 6h2v-6H6v6zm4 0h2v-6h-2v6zm4 0h2v-6h-2v6zm2 2v2H2v-2h20z"/>
                </svg>
              </div>
              <h3 
                className="text-white mb-3 text-left"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 400,
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                Simple and Reliable Trust
              </h3>
              <p 
                className="text-gray-400 text-left"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 300,
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                Each member builds a trust score from<br /> their saving history, so circles stay safe<br /> and dependable.
              </p>
            </div>

            {/* Feature 3 */}
            <div 
              className="bg-lack-900/50 rounded-lg p-6"
              style={{
                border: '1px solid',
                borderImageSource: 'linear-gradient(126.45deg, #7AC2BC -31.48%, #F3EECC 21.92%, #7AC2BC 43.88%, #121212 80.67%)',
                borderImageSlice: 1
              }}
            >
              <div className="mb-4 flex justify-start">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L2 9v2h20V9l-10-6zM2 13v6h2v-6H2zm4 6h2v-6H6v6zm4 0h2v-6h-2v6zm4 0h2v-6h-2v6zm2 2v2H2v-2h20z"/>
                </svg>
              </div>
              <h3 
                className="text-white mb-3 text-left"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 400,
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                Designed for Real Life
              </h3>
              <p 
                className="text-gray-400 text-left"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 300,
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                Whether it's school fees, emergencies, or group<br /> trips, you can set flexible goals and manage<br /> everything easily through LINE.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Make Contribution Form */}
          <div className="bg-black border border-gray-700 rounded-lg p-20 w-full max-w-md">
            <h3 
              className="text-white mb-6"
              style={{
                fontFamily: 'Figtree',
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: '22px',
                letterSpacing: '-2%'
              }}
            >
              Make Contribution
            </h3>
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-gray-300 mb-2"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '100%',
                    letterSpacing: '0%'
                  }}
                >
                  Amount
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label 
                  className="block text-gray-300 mb-2"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '100%',
                    letterSpacing: '0%'
                  }}
                >
                  Wallet Address
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter wallet address"
                />
              </div>
              <div>
                <label 
                  className="block text-gray-300 mb-2"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '100%',
                    letterSpacing: '0%'
                  }}
                >
                  Family
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter family name"
                />
              </div>
            </div>
          </div>

          {/* Kaia + Line Integration - Updated Design */}
          <div className="flex items-center justify-center">
            <div 
              className="relative flex items-center"
              style={{
                width: '518.74px',
                height: '226px',
                border: '1px'
              }}
            >
              {/* Kaia Circle */}
              <div 
                className="absolute left-0 top-0 bg-black border border-gray-700 rounded-full flex items-center justify-center"
                style={{
                  width: '226px',
                  height: '226px',
                  border: '1px solid #BFF009'
                }}
              >
                <span 
                  className="text-white"
                  style={{
                    fontFamily: 'Inknut Antiqua, serif',
                    fontSize: '48px',
                    fontWeight: 900,
                    lineHeight: '100%',
                    letterSpacing: '0%'
                  }}
                >
                  Kaia
                </span>
              </div>

              {/* Middle Character/Image */}
              <div 
                className="absolute bg-gray-900 rounded-full flex items-center justify-center border overflow-hidden"
                style={{
                  width: '118.57px',
                  height: '115.90px',
                  left: '204.78px',
                  top: '55.05px',
                  borderRadius: '100px',
                  padding: '10px',
                  border: '1px solid #BFF009',
                  backgroundColor: '#1a1a1a'
                }}
              >
                
                <img 
                  src="/kaia.png" 
                  alt="Connection Symbol"
                  className="w-full h-full object-cover rounded-full"
                  style={{
                    width: '98.57px',
                    height: '95.90px'
                  }}
                />
              </div>

              {/* Line Circle */}
              <div 
                className="absolute right-0 top-0 bg-black border rounded-full flex items-center justify-center"
                style={{
                  width: '226px',
                  height: '226px',
                  border: '1px solid #BFF009'
                }}
              >
                <span 
                  className="text-white"
                  style={{
                    fontFamily: 'Inknut Antiqua, serif',
                    fontSize: '48px',
                    fontWeight: 900,
                    lineHeight: '100%',
                    letterSpacing: '0%'
                  }}
                >
                  Line
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}