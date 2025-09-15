import { Card } from "../ui/card"

export default function WhyChoose() {
  return (
    <section 
      className="py-20 px-4" 
      style={{
        backgroundColor: '#0D0D0D',
        boxShadow: '0px 4px 4px 0px #00000040'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Benefits */}
          <div className="space-y-8">
            <h2 
              className="text-white mb-8"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '32px',
                fontWeight: 600,
                lineHeight: '120%'
              }}
            >
              Why Choose Yield Circle
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 
                    className="text-white mb-2"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '120%'
                    }}
                  >
                    Less stress savings
                  </h3>
                  <p 
                    className="text-gray-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '140%'
                    }}
                  >
                    no need to chase or track contributions, everything runs smoothly through smart contracts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 
                    className="text-white mb-2"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '120%'
                    }}
                  >
                    Earn while you save
                  </h3>
                  <p 
                    className="text-gray-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '140%'
                    }}
                  >
                    instead of funds sitting idle, pooled money is put to work in low-risk strategies, generating extra
                    returns for your circle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 
                    className="text-white mb-2"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '120%'
                    }}
                  >
                    Trust you can count on
                  </h3>
                  <p 
                    className="text-gray-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '140%'
                    }}
                  >
                    with contribution history and insights, you know who's reliable in your circle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 
                    className="text-white mb-2"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '120%'
                    }}
                  >
                    Save across borders
                  </h3>
                  <p 
                    className="text-gray-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '140%'
                    }}
                  >
                    whether your group is local or global, Kaia-USDT makes contributions seamless and feather-free.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Circle Board Dashboard */}
          <div className="flex justify-center">
            <div className="bg-black border border-gray-700 rounded-lg p-20 w-full max-w-md">
              <h3 
                className="text-white mb-6 text-left"
                style={{
                  fontFamily: 'Figtree, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '120%'
                }}
              >
                Circle Board
              </h3>

              {/* Progress Circle */}
              <div className="flex justify-center mb-8">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${87 * 3.14159} ${(100 - 87) * 3.14159}`}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-pink-400"
                      style={{
                        fontFamily: 'Figtree, sans-serif',
                        fontSize: '28px',
                        fontWeight: 700,
                        lineHeight: '100%'
                      }}
                    >
                      87%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span 
                    className="text-gray-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '120%'
                    }}
                  >
                    Total Saved
                  </span>
                  <span 
                    className="text-white"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      letterSpacing: '0%',     
                      lineHeight: '100%'
                    }}
                  >
                    $870
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span 
                    className="text-gray-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '120%'
                    }}
                  >
                    Reward
                  </span>
                  <span 
                    className="text-white"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      letterSpacing: '0%',
                      lineHeight: '100%'
                    }}
                  >
                    5200
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span 
                    className="text-gray-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '120%'
                    }}
                  >
                    Member
                  </span>
                  <span 
                    className="text-white"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      letterSpacing: '0%',
                      lineHeight: '100%'
                    }}
                  >
                    10 Active
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span 
                    className="text-gray-400"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '120%'
                    }}
                  >
                    Next Payout
                  </span>
                  <span 
                    className="text-white"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      letterSpacing: '0%',
                      lineHeight: '100%'
                    }}
                  >
                    15 days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}