import { HeroCard } from "./hero-card"
import { Button } from "../ui/button"
import Link from "next/link"

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
        className="max-w-2xl text-gray-300 mb-8"
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

      {/* Create Circle Button */}
      <div className="mb-16">
        <Link href="/create">
          <Button 
            className="bg-gradient-to-r from-teal-400 to-purple-500 hover:from-teal-300 hover:to-purple-400 text-black font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              letterSpacing: '0.5px'
            }}
          >
            Create Your Own Circle
          </Button>
        </Link>
      </div>

        <HeroCard />
    </main>
  )
}