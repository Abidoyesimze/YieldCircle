export function HowItWorks() {
  return (
    <section className="px-6 py-32 md:px-12 lg:py-40 relative overflow-hidden bg-black">
      {/* Background decorative square boxes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-12 h-12 opacity-5 rotate-12 bg-gradient-to-br from-white/20 to-transparent border border-white/10"></div>
        <div className="absolute top-40 right-1/3 w-8 h-16 opacity-8 rotate-45 bg-gradient-to-tr from-gray-300/15 to-transparent"></div>
        <div className="absolute bottom-32 left-1/6 w-16 h-8 opacity-6 rotate-[30deg] bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="absolute top-60 right-1/4 w-10 h-10 opacity-10 rotate-[60deg] bg-gradient-to-bl from-white/20 to-transparent"></div>
        <div className="absolute bottom-20 right-1/5 w-14 h-6 opacity-7 rotate-[-15deg] bg-gradient-to-r from-gray-200/10 to-transparent"></div>
      </div>
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <h2
            className="text-white mb-6 relative inline-block"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '24px',
              lineHeight: '100%',
              letterSpacing: '0%',
              filter: 'drop-shadow(0 0 250px rgba(255, 255, 255, 0.1))',
              backdropFilter: 'blur(250px)'
            }}
          >
            How does it work ?
          </h2>
          <p
            className="text-gray-400"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              letterSpacing: '0%'
            }}
          >
            Turn group savings into smarter financial growth.
          </p>
        </div>
        <div className="grid gap-16 md:grid-cols-3 relative">
          {/* Curved connecting arrows between steps */}
          <div className="hidden md:block absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg width="120" height="60" viewBox="0 0 120 60" className="text-purple-400">
              <defs>
                <linearGradient id="arrow1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path
                d="M10 30 Q35 10, 60 30 T110 30"
                stroke="url(#arrow1)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="3,3"
              />
              {/* Arrow head */}
              <path
                d="M105 25 L110 30 L105 35"
                stroke="url(#arrow1)"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <div className="hidden md:block absolute top-12 right-1/2 transform translate-x-1/2 -translate-y-1/2">
            <svg width="120" height="60" viewBox="0 0 120 60" className="text-teal-400">
              <defs>
                <linearGradient id="arrow2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
              <path
                d="M10 30 Q35 50, 60 30 T110 30"
                stroke="url(#arrow2)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="3,3"
              />
              {/* Arrow head */}
              <path
                d="M105 25 L110 30 L105 35"
                stroke="url(#arrow2)"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          {/* Save Together */}
          <div className="relative">
            <div className="mb-4 flex justify-start">
              {/* Bank/Building icon - pure vector, no background */}
              <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L2 9v2h20V9l-10-6zM2 13v6h2v-6H2zm4 6h2v-6H6v6zm4 0h2v-6h-2v6zm4 0h2v-6h-2v6zm4 0h2v-6h-2v6zm2 2v2H2v-2h20z"/>
              </svg>
            </div>
            <h3
              className="text-white mb-2 text-left"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '100%'
              }}
            >
              Save Together
            </h3>
            <p
              className="text-gray-400 text-left"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '130%'
              }}
            >
              Create or join a savings circle with friends,<br /> family, or coworkers. Everyone<br /> contributes in Kaia USDT directly from<br /> their LINE wallet.
            </p>
          </div>
          {/* Grow Your Money */}
          <div className="relative">
            <div className="mb-4 flex justify-start">
              {/* Growth/Chart icon - pure vector, no background */}
              <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
              </svg>
            </div>
            <h3
              className="text-white mb-2 text-left"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '100%'
              }}
            >
              Grow Your Money
            </h3>
            <p
              className="text-gray-400 text-left"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '130%'
              }}
            >
              Pooled funds don't sit idle our AI invests<br /> them in safe DeFi strategies, explains the?<br /> choices in plain words, and grows your<br /> circle's savings.
            </p>
          </div>
          {/* Get Paid and Build Trust */}
          <div className="relative">
            <div className="mb-4 flex justify-start">
              {/* Shield with checkmark icon - pure vector, no background */}
              <svg className="w-8 h-8 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            </div>
            <h3
              className="text-white mb-2 text-left"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '100%'
              }}
            >
              Get Paid and Build Trust
            </h3>
            <p
              className="text-gray-400 text-left"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '130%'
              }}
            >
              Payouts rotate automatically each cycle.<br /> Trust scores reward consistent members,<br /> making circles safer and more<br /> transparent.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}