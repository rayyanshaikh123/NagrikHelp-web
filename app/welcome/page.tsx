"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BlurText from '@/components/ui/BlurText'

export default function WelcomePage() {
  const router = useRouter()
  const [fadeOutText, setFadeOutText] = useState(false)
  const [pullUp, setPullUp] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Preload the home page for smoother transition
    router.prefetch('/')
  }, [router])

  const handleAnimationComplete = () => {
    console.log('Text animation completed!')
    // Wait a moment, then fade out text
    setTimeout(() => {
      console.log('Fading out text')
      setFadeOutText(true)
      // After text fades out, pull up the splash screen
      setTimeout(() => {
        console.log('Pulling up splash screen')
        setPullUp(true)
        // Navigate during the pull-up animation for seamless transition
        setTimeout(() => {
          console.log('Navigating to home')
          try { localStorage.setItem('seenWelcome', '1') } catch {}
          // Use push instead of replace for smoother transition
          router.push('/')
        }, 700) // Navigate midway through pull-up
      }, 900) // Wait for text to fade out
    }, 600)
  }

  if (!mounted) return null

  return (
    <>
      <style jsx global>{`
        @keyframes blurTextIn {
          0% {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(-15px);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0);
          }
        }

        @keyframes blurTextOut {
          0% {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            filter: blur(12px);
            transform: translateY(20px) scale(0.92);
          }
        }

        @keyframes pullUpScreen {
          0% { 
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          30% {
            transform: translateY(-5%) scale(0.99);
            opacity: 0.98;
          }
          100% { 
            transform: translateY(-110%) scale(0.96);
            opacity: 0;
          }
        }

        .blur-text-animate {
          display: inline-block;
          opacity: 0;
          animation: blurTextIn 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: opacity, filter, transform;
        }

        .text-fade-out * {
          animation: blurTextOut 900ms cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
        }

        .pull-up-screen {
          animation: pullUpScreen 1600ms cubic-bezier(0.76, 0, 0.24, 1) forwards;
        }

        /* Smooth page transition */
        html {
          view-transition-name: root;
        }

        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation-duration: 0.5s;
        }

        body {
          overflow: hidden;
        }
      `}</style>
      
      {/* Splash screen that pulls up */}
      <div 
        className={`fixed inset-0 flex items-center justify-center bg-background z-[100000] ${pullUp ? 'pull-up-screen' : ''}`}
        style={{
          willChange: 'transform, opacity',
          transformOrigin: 'center top'
        }}
      >
        <div className={`text-center px-6 max-w-5xl mx-auto ${fadeOutText ? 'text-fade-out' : ''}`}>
          <div className="text-sm md:text-base lg:text-lg mb-3 text-foreground/50 tracking-[0.3em] uppercase font-light">
            <BlurText
              text="Introducing"
              delay={80}
              animateBy="letters"
              direction="top"
              className=""
            />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tighter leading-none font-[family-name:var(--font-poppins)]">
            <BlurText
              text="NagrikHelp"
              delay={100}
              animateBy="letters"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
            />
          </h1>
        </div>
      </div>
    </>
  )
}
