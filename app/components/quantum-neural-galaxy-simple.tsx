"use client"

import { useRef, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export default function QuantumNeuralGalaxySimple({ scrollY }: { scrollY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle updates for performance
      requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particle class
    class Particle {
      x: number = 0
      y: number = 0
      size: number = 0
      speedX: number = 0
      speedY: number = 0
      color: string = ''
      originalY: number = 0

      constructor() {
        if (!canvas) return
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.originalY = this.y
        this.size = Math.random() * 2 + 0.5
        this.speedX = Math.random() * 0.5 - 0.25
        this.speedY = Math.random() * 0.2 - 0.1

        // Color palette based on theme
        const palette = isDark
          ? [
              "rgba(141, 0, 255, 0.7)", // violet
              "rgba(0, 255, 255, 0.7)", // cyan
              "rgba(255, 0, 119, 0.7)", // pink
              "rgba(0, 255, 204, 0.7)", // mint
            ]
          : [
              "rgba(141, 0, 255, 0.3)", // violet
              "rgba(0, 255, 255, 0.3)", // cyan
              "rgba(255, 0, 119, 0.3)", // pink
              "rgba(0, 255, 204, 0.3)", // mint
            ]
        this.color = palette[Math.floor(Math.random() * palette.length)]
      }

      update(mouseX: number, mouseY: number, scrollOffset: number) {
        // Basic movement
        this.x += this.speedX
        this.y = this.originalY + scrollOffset * 50

        // Mouse interaction
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          const angle = Math.atan2(dy, dx)
          this.x -= Math.cos(angle) * 0.5
          this.y -= Math.sin(angle) * 0.5
        }

        // Wrap around edges
        if (this.x > canvas.width) this.x = 0
        else if (this.x < 0) this.x = canvas.width

        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx || !canvas) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()

        // Add subtle glow
        ctx.shadowBlur = 10
        ctx.shadowColor = this.color
      }
    }

    // Create particles with proper type checking
    const particleCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 10000))
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    let animationFrameId: number
    let time = 0

    function animate() {
      // Use requestAnimationFrame timing
      const now = performance.now() * 0.001
      const deltaTime = now - (time || now)
      time = now

      // Clear with optimized method
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create background gradient based on theme
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)

      // Cache gradient colors
      const darkThemeColors = {
        bg: ["#080A0F", "#0A0A20"],
        nebula: [
          "rgba(141, 0, 255, 0.05)",
          "rgba(0, 255, 255, 0.05)",
          "rgba(255, 0, 119, 0.05)"
        ]
      }
      
      const lightThemeColors = {
        bg: ["#f0f4ff", "#e0e7ff"],
        nebula: [
          "rgba(141, 0, 255, 0.02)",
          "rgba(0, 255, 255, 0.02)",
          "rgba(255, 0, 119, 0.02)"
        ]
      }
      
      // Use cached colors
      const colors = isDark ? darkThemeColors : lightThemeColors
      bgGradient.addColorStop(0, colors.bg[0])
      bgGradient.addColorStop(1, colors.bg[1])
      
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw nebula effects
      const nebulaColors = isDark
        ? [
            { x: canvas.width * 0.3, y: canvas.height * 0.3, color: "rgba(141, 0, 255, 0.05)" },
            { x: canvas.width * 0.7, y: canvas.height * 0.6, color: "rgba(0, 255, 255, 0.05)" },
            { x: canvas.width * 0.4, y: canvas.height * 0.8, color: "rgba(255, 0, 119, 0.05)" },
          ]
        : [
            { x: canvas.width * 0.3, y: canvas.height * 0.3, color: "rgba(141, 0, 255, 0.02)" },
            { x: canvas.width * 0.7, y: canvas.height * 0.6, color: "rgba(0, 255, 255, 0.02)" },
            { x: canvas.width * 0.4, y: canvas.height * 0.8, color: "rgba(255, 0, 119, 0.02)" },
          ]

      nebulaColors.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, canvas.width * 0.4)
        gradient.addColorStop(0, nebula.color)
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(nebula.x, nebula.y, canvas.width * 0.4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw grid
      const gridSize = 40
      const gridOffset = (time * 20) % gridSize

      // Grid color based on theme
      ctx.strokeStyle = isDark ? "rgba(0, 255, 255, 0.1)" : "rgba(141, 0, 255, 0.05)"
      ctx.lineWidth = 1

      // Horizontal lines
      for (let y = gridOffset; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vertical lines
      for (let x = gridOffset; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Update and draw particles
      ctx.save()
      particles.forEach((particle) => {
        particle.update(mousePosition.x, mousePosition.y, scrollY / 1000)
        particle.draw()
      })
      ctx.restore()

      // Draw connections between particles
      connectParticles()

      // Apply scroll effect
      ctx.fillStyle = isDark
        ? `rgba(8, 10, 15, ${Math.min(scrollY / 1000, 0.5)})`
        : `rgba(240, 244, 255, ${Math.min(scrollY / 1000, 0.5)})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationFrameId = window.requestAnimationFrame(animate)
    }

    // Connect particles with lines if they are close enough
    function connectParticles() {
      if (!ctx || !canvas) return

      const maxDistance = 150 * (canvas.width / 1920) // Scale with screen size

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            // Calculate opacity based on distance
            const opacity = 1 - distance / maxDistance
            const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y)

            // Parse the rgba colors properly
            const color1 = particles[i].color.replace(
              /rgba$$([^,]+),([^,]+),([^,]+),[^)]+$$/,
              (_, r, g, b) => `rgba(${r},${g},${b},${opacity * 0.3})`,
            )
            const color2 = particles[j].color.replace(
              /rgba$$([^,]+),([^,]+),([^,]+),[^)]+$$/,
              (_, r, g, b) => `rgba(${r},${g},${b},${opacity * 0.3})`,
            )

            gradient.addColorStop(0, color1)
            gradient.addColorStop(1, color2)

            ctx.beginPath()
            ctx.strokeStyle = gradient
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    animate()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [scrollY, isDark, mousePosition])

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  )
}
