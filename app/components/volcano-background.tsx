"use client"

import { useRef, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import * as THREE from "three"
import { motion } from "framer-motion"

interface VolcanoBackgroundProps {
  scrollY: number
}

export default function VolcanoBackground({ scrollY }: VolcanoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [isWebGLSupported, setIsWebGLSupported] = useState(true)
  const [isErupting, setIsErupting] = useState(false)
  const animationRef = useRef<number | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const volcanoRef = useRef<THREE.Mesh | null>(null)
  const lavaParticlesRef = useRef<THREE.Points | null>(null)
  const lastEruptionRef = useRef<number>(0)
  const eruptionCooldownRef = useRef<number>(5000) // 5 seconds cooldown

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      setIsWebGLSupported(!!gl)
    } catch (e) {
      setIsWebGLSupported(false)
    }
  }, [])

  // Initialize Three.js scene
  useEffect(() => {
    if (!isWebGLSupported || !canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 5, 10)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x333333 : 0x666666)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(isDark ? 0xffffff : 0xffffff, 1)
    directionalLight.position.set(5, 10, 7)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xff6600, 1, 50)
    pointLight.position.set(0, 2, 0)
    scene.add(pointLight)

    // Create volcano
    const volcanoGeometry = new THREE.ConeGeometry(5, 8, 32)
    const volcanoMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x333333 : 0x555555,
      roughness: 0.8,
      metalness: 0.2,
    })
    const volcano = new THREE.Mesh(volcanoGeometry, volcanoMaterial)
    volcano.position.y = -4
    scene.add(volcano)
    volcanoRef.current = volcano

    // Create crater
    const craterGeometry = new THREE.ConeGeometry(2, 1, 32)
    const craterMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0xff3300 : 0xff4400,
      emissive: 0xff2200,
      emissiveIntensity: 0.3,
      roughness: 0.7,
      metalness: 0.3,
    })
    const crater = new THREE.Mesh(craterGeometry, craterMaterial)
    crater.position.y = 0
    crater.rotation.x = Math.PI
    scene.add(crater)

    // Create lava particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 500
    const posArray = new Float32Array(particleCount * 3)
    const velocityArray = new Float32Array(particleCount * 3)
    const sizeArray = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // Initial positions (inside the crater)
      posArray[i * 3] = (Math.random() - 0.5) * 1.5
      posArray[i * 3 + 1] = -0.5 // Start below the crater opening
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 1.5

      // Initial velocities
      velocityArray[i * 3] = (Math.random() - 0.5) * 0.1
      velocityArray[i * 3 + 1] = Math.random() * 0.1 // Upward velocity
      velocityArray[i * 3 + 2] = (Math.random() - 0.5) * 0.1

      // Particle sizes
      sizeArray[i] = Math.random() * 0.2 + 0.1
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute("velocity", new THREE.BufferAttribute(velocityArray, 3))
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizeArray, 1))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      color: 0xff5500,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })

    const lavaParticles = new THREE.Points(particlesGeometry, particlesMaterial)
    lavaParticles.visible = false // Hide initially
    scene.add(lavaParticles)
    lavaParticlesRef.current = lavaParticles

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return
      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return

      // Rotate volcano slightly based on scroll
      if (volcanoRef.current) {
        volcanoRef.current.rotation.y += 0.002
      }

      // Update lava particles if erupting
      if (isErupting && lavaParticlesRef.current) {
        const positions = lavaParticlesRef.current.geometry.attributes.position.array as Float32Array
        const velocities = lavaParticlesRef.current.geometry.attributes.velocity.array as Float32Array

        for (let i = 0; i < positions.length; i += 3) {
          // Update positions based on velocities
          positions[i] += velocities[i]
          positions[i + 1] += velocities[i + 1]
          positions[i + 2] += velocities[i + 2]

          // Apply gravity to y velocity
          velocities[i + 1] -= 0.001

          // Reset particles that fall below a certain height
          if (positions[i + 1] < -2) {
            positions[i] = (Math.random() - 0.5) * 1.5
            positions[i + 1] = -0.5
            positions[i + 2] = (Math.random() - 0.5) * 1.5

            velocities[i] = (Math.random() - 0.5) * 0.1
            velocities[i + 1] = Math.random() * 0.1 + 0.05
            velocities[i + 2] = (Math.random() - 0.5) * 0.1
          }
        }

        lavaParticlesRef.current.geometry.attributes.position.needsUpdate = true
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Clean up Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          } else if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          }
        }
      })
    }
  }, [isWebGLSupported, isDark])

  // Handle scroll-triggered eruption
  useEffect(() => {
    if (!isWebGLSupported) return

    const now = Date.now()
    if (scrollY > 100 && !isErupting && now - lastEruptionRef.current > eruptionCooldownRef.current) {
      triggerEruption()
    }
  }, [scrollY, isWebGLSupported, isErupting])

  // Handle click to trigger eruption
  const handleClick = () => {
    if (!isWebGLSupported) return

    const now = Date.now()
    if (!isErupting && now - lastEruptionRef.current > eruptionCooldownRef.current) {
      triggerEruption()
    }
  }

  // Trigger volcano eruption
  const triggerEruption = () => {
    if (lavaParticlesRef.current) {
      setIsErupting(true)
      lastEruptionRef.current = Date.now()

      // Make particles visible
      lavaParticlesRef.current.visible = true

      // Reset particles for eruption
      const positions = lavaParticlesRef.current.geometry.attributes.position.array as Float32Array
      const velocities = lavaParticlesRef.current.geometry.attributes.velocity.array as Float32Array

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] = (Math.random() - 0.5) * 1.5
        positions[i + 1] = -0.5
        positions[i + 2] = (Math.random() - 0.5) * 1.5

        velocities[i] = (Math.random() - 0.5) * 0.2
        velocities[i + 1] = Math.random() * 0.2 + 0.1 // Stronger upward velocity
        velocities[i + 2] = (Math.random() - 0.5) * 0.2
      }

      lavaParticlesRef.current.geometry.attributes.position.needsUpdate = true

      // End eruption after a few seconds
      setTimeout(() => {
        setIsErupting(false)
        if (lavaParticlesRef.current) {
          lavaParticlesRef.current.visible = false
        }
      }, 3000)
    }
  }

  // Fallback gradient for devices without WebGL
  if (!isWebGLSupported) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className={`absolute inset-0 ${isDark ? "bg-gradient-to-b from-red-900/20 via-orange-900/10 to-black" : "bg-gradient-to-b from-red-100 via-orange-50 to-white"}`}
        ></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent"></div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-0" onClick={handleClick}>
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      {/* Overlay text to explain interaction */}
      <div className="absolute bottom-4 left-4 text-xs text-neutral-500 dark:text-neutral-400 pointer-events-none">
        Click anywhere or scroll to trigger volcano eruption
      </div>
    </div>
  )
}
