import { HeroCard } from "./hero-card"

export function Hero() {
  return (
    <main className="flex flex-col items-center justify-center px-6 py-32 text-center md:px-12 lg:py-40 xl:py-48 min-h-[80vh]">
      <h1 
        className="mb-12 font-bold leading-none text-center"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '64px',
          fontWeight: 700,
          lineHeight: '100%',
          letterSpacing: '0%'
        }}
      >
        <span className="text-white">Save </span>
        <span 
          className="text-purple-400"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '64px',
            fontWeight: 700,
            lineHeight: '100%',
            letterSpacing: '0%'
          }}
        >
          together
        </span>
        <span className="text-white"> to </span>
        <span className="text-teal-400">achieve</span>
        <br />
        <span className="text-white">more.</span>
      </h1>

      <p 
        className="max-w-2xl text-gray-300 mb-16"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '15px',
          fontWeight: 500,
          lineHeight: '100%',
          letterSpacing: '0%',
          textAlign: 'center'
        }}
      >
        Join trusted circles with friends and family, grow your pooled savings with AI, and take turns receiving payout simple, fair, and transparent
      </p>
        <HeroCard />
    </main>
  )
}