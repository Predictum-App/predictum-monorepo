"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function FinalCTA() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 lg:pb-32 relative">
      {/* Top Section - Text Content */}
      <div className="text-center mb-16 sm:mb-24 lg:mb-32 relative max-w-7xl mx-auto">
        {/* Main Headline */}
        <h1
          className="mb-6 sm:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight"
          style={{
            fontFamily: "Space Grotesk",
          }}
        >
          Simplified. Engaged. Effortless Signals.
        </h1>

        {/* Subtitle */}
        <div className="mb-12 sm:mb-16 space-y-2">
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300"
            style={{
              fontFamily: "Space Grotesk",
            }}
          >
            Seize the moment and shape your market
          </p>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300"
            style={{
              fontFamily: "Space Grotesk",
            }}
          >
            whenever and wherever you desire.
          </p>
        </div>

        {/* Stats Section */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 lg:gap-24 mb-12 sm:mb-20">
          {/* 100x */}
          <div className="text-center">
            <div
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              100x
            </div>
            <div
              className="text-sm sm:text-base md:text-lg text-gray-300 mt-1"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              easier UX
            </div>
          </div>

          {/* 100% */}
          <div className="text-center">
            <div
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              100%
            </div>
            <div
              className="text-sm sm:text-base md:text-lg text-gray-300 mt-1"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              Keep 100% creator fee
            </div>
          </div>

          {/* 20,000 */}
          <div className="text-center">
            <div
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              20,000
            </div>
            <div
              className="text-sm sm:text-base md:text-lg text-gray-300 mt-1"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              Creators
            </div>
          </div>

          {/* 1000 */}
          <div className="text-center">
            <div
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              1000
            </div>
            <div
              className="text-sm sm:text-base md:text-lg text-gray-300 mt-1"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              Markets
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex justify-center mt-8 sm:mt-12 lg:mt-16 px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden w-full max-w-7xl min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] xl:min-h-[691px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(157, 31, 25, 0.12) 0%, rgba(157, 31, 25, 0.18) 50%, rgba(157, 31, 25, 0.15) 100%)",
            border: "1px solid #9D1F19",
            boxShadow: "0 0 60px rgba(157, 31, 25, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Simple elegant background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Clean gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90"></div>

            {/* Subtle accent elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-red-600/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-red-700/8 to-transparent rounded-full blur-3xl"></div>

            {/* Minimal floating elements - only render on client */}
            {isClient && (
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full animate-pulse"
                    style={{
                      width: `${3 + Math.random() * 2}px`,
                      height: `${3 + Math.random() * 2}px`,
                      top: `${20 + Math.random() * 60}%`,
                      left: `${10 + Math.random() * 80}%`,
                      background: "#9D1F19",
                      opacity: 0.3 + Math.random() * 0.3,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                      boxShadow: "0 0 10px rgb(157, 31, 25)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="relative flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
            {/* Main Heading */}
            <h2
              className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              Become a Signaler on Sei
            </h2>

            {/* Description Text */}
            <div className="mb-8 sm:mb-12 space-y-2 sm:space-y-3 max-w-4xl">
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white leading-relaxed"
                style={{
                  fontFamily: "Space Grotesk",
                }}
              >
                Every trade and every market you create sharpens your edge.
              </p>
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white leading-relaxed"
                style={{
                  fontFamily: "Space Grotesk",
                }}
              >
                Signalers don&apos;t just predict the future, they help shape it.
              </p>
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white leading-relaxed"
                style={{
                  fontFamily: "Space Grotesk",
                }}
              >
                The more conviction you show, the clearer your sight becomes.
              </p>
            </div>

            {/* Call to Action Text */}
            <p
              className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg lg:text-xl text-white"
              style={{
                fontFamily: "Space Grotesk",
              }}
            >
              Create and Trade Markets to earn.
            </p>

            {/* Red-themed Futuristic Neon Button */}
            <button
              className="group relative px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:text-xl lg:text-2xl transition-all duration-300 hover:scale-105 lg:hover:scale-110 hover:shadow-2xl overflow-hidden border-2 border-red-600/60"
              style={{
                background:
                  "linear-gradient(135deg, rgba(157,31,25,0.25), rgba(194,59,52,0.35), rgba(157,31,25,0.25))",
                color: "#ffffff",
                fontFamily: "Space Grotesk",
                fontWeight: 700,
                cursor: "pointer",
                textShadow: "0 0 10px rgba(157,31,25,0.8)",
                boxShadow:
                  "0 0 30px rgba(157,31,25,0.4), 0 0 60px rgba(194,59,52,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 50px rgba(157,31,25,0.7), 0 0 100px rgba(194,59,52,0.5), 0 0 150px rgba(157,31,25,0.3), inset 0 1px 0 rgba(255,255,255,0.2)";
                e.currentTarget.style.borderColor = "rgba(157,31,25,1)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(157,31,25,0.4), 0 0 60px rgba(194,59,52,0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(157,31,25,0.6)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {/* Animated background pulse */}

              {/* Button text with red glow effect */}
              <Link
                href="/markets/create"
                className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent font-bold"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-red-500/25 to-red-600/30 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                Create Market
              </Link>

              {/* Scanning line effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
