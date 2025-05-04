"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { useTheme } from "next-themes"
import * as THREE from "three"
import { useFrame, Canvas, extend, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing"
import { BlendFunction, KernelSize } from "postprocessing"
import { Line } from "@react-three/drei"
import { useSpring, animated } from "@react-spring/three"

// Custom shader for the particles
const particleVertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFragmentShader = `
  varying vec3 vColor;
  
  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceToCenter > 0.5) {
      discard;
    }
    
    float alpha = 1.0 - smoothstep(0.4, 0.5, distanceToCenter);
    gl_FragColor = vec4(vColor, alpha);
  }
`

// Custom shader for the data flow
const flowVertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float speed;
  uniform float time;
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vColor = color;
    
    // Calculate position along the line with time
    float progress = mod(speed * time, 1.0);
    vAlpha = sin(progress * 3.14159); // Pulse effect
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z) * vAlpha;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const flowFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceToCenter > 0.5) {
      discard;
    }
    
    float alpha = vAlpha * (1.0 - smoothstep(0.0, 0.5, distanceToCenter));
    gl_FragColor = vec4(vColor, alpha);
  }
`

// Custom shader material for particles
class ParticleMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }
}

// Custom shader material for data flow
class FlowMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: flowVertexShader,
      fragmentShader: flowFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
      },
    })
  }
}

// Extend Three.js with our custom materials
extend({ ParticleMaterial, FlowMaterial })

// Neural Node component
function NeuralNode({ position, size, color, pulsing = false, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)

  // Spring animation for hover and pulse effects
  const { scale, emissiveIntensity } = useSpring({
    scale: hovered
      ? [1.2, 1.2, 1.2]
      : pulsing
        ? [
            1 + Math.sin(Date.now() * 0.001) * 0.1,
            1 + Math.sin(Date.now() * 0.001) * 0.1,
            1 + Math.sin(Date.now() * 0.001) * 0.1,
          ]
        : [1, 1, 1],
    emissiveIntensity: hovered ? 1 : 0.5,
    config: { tension: 300, friction: 40 },
  })

  // Handle click animation
  useEffect(() => {
    if (active) {
      const timeout = setTimeout(() => setActive(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [active])

  // Handle node click
  const handleClick = (e) => {
    e.stopPropagation()
    setActive(true)
    if (onClick) onClick(position)
  }

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <animated.meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={0.8}
      />
    </animated.mesh>
  )
}

// Neural Connection component
function NeuralConnection({ start, end, color, thickness = 0.02, flowSpeed = 0.5 }) {
  const ref = useRef()
  const flowRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Create points for the line
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end])

  // Create flow particles along the line
  const flowCount = 5
  const flowPositions = useMemo(() => {
    const positions = new Float32Array(flowCount * 3)
    const colors = new Float32Array(flowCount * 3)
    const sizes = new Float32Array(flowCount)
    const speeds = new Float32Array(flowCount)

    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const direction = endVec.clone().sub(startVec)

    for (let i = 0; i < flowCount; i++) {
      const t = i / flowCount
      const pos = startVec.clone().add(direction.clone().multiplyScalar(t))

      positions[i * 3] = pos.x
      positions[i * 3 + 1] = pos.y
      positions[i * 3 + 2] = pos.z

      // Convert hex color to RGB
      const c = new THREE.Color(color)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      sizes[i] = 0.1 + Math.random() * 0.1
      speeds[i] = 0.5 + Math.random() * 0.5
    }

    return { positions, colors, sizes, speeds }
  }, [start, end, color, flowCount])

  // Animate flow particles
  useFrame(({ clock }) => {
    if (flowRef.current) {
      flowRef.current.material.uniforms.time.value = clock.getElapsedTime()
    }
  })

  // Spring animation for hover effect
  const { lineOpacity, lineWidth } = useSpring({
    lineOpacity: hovered ? 0.8 : 0.3,
    lineWidth: hovered ? thickness * 2 : thickness,
    config: { tension: 300, friction: 40 },
  })

  return (
    <group>
      {/* Connection line */}
      <Line
        ref={ref}
        points={points}
        color={color}
        lineWidth={lineWidth}
        opacity={lineOpacity}
        transparent
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />

      {/* Flow particles */}
      <points ref={flowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={flowPositions.positions.length / 3}
            array={flowPositions.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={flowPositions.colors.length / 3}
            array={flowPositions.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={flowPositions.sizes.length}
            array={flowPositions.sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-speed"
            count={flowPositions.speeds.length}
            array={flowPositions.speeds}
            itemSize={1}
          />
        </bufferGeometry>
        <flowMaterial />
      </points>
    </group>
  )
}

// Nebula Field component
function NebulaField({ count = 1000, radius = 20 }) {
  const pointsRef = useRef()

  // Create nebula particles
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Position in a sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * Math.cbrt(Math.random()) // Cube root for more even distribution

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Random color from palette
      const palette = [
        new THREE.Color("#8D00FF"), // violet
        new THREE.Color("#00FFFF"), // cyan
        new THREE.Color("#FF0077"), // pink
        new THREE.Color("#00ffcc"), // mint
      ]
      const color = palette[Math.floor(Math.random() * palette.length)]

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      // Random size
      sizes[i] = Math.random() * 0.5 + 0.1
    }

    return [positions, colors, sizes]
  }, [count, radius])

  // Animate nebula
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <particleMaterial />
    </points>
  )
}

// Neural Network component
function NeuralNetwork({ nodeCount = 20, connectionDensity = 0.3, onClick }) {
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [clickWave, setClickWave] = useState(null)
  const networkRef = useRef()

  // Generate neural network
  useEffect(() => {
    const newNodes = []
    const radius = 10

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      // Position in a sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * Math.cbrt(Math.random())

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      // Random color from palette
      const palette = ["#8D00FF", "#00FFFF", "#FF0077"]
      const color = palette[Math.floor(Math.random() * palette.length)]

      // Random size
      const size = Math.random() * 0.2 + 0.1

      // Some nodes pulse
      const pulsing = Math.random() > 0.7

      newNodes.push({
        id: i,
        position: [x, y, z],
        color,
        size,
        pulsing,
      })
    }

    // Create connections
    const newConnections = []
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < connectionDensity) {
          // Calculate distance
          const start = new THREE.Vector3(...newNodes[i].position)
          const end = new THREE.Vector3(...newNodes[j].position)
          const distance = start.distanceTo(end)

          // Only connect if within reasonable distance
          if (distance < radius * 0.7) {
            newConnections.push({
              id: `${i}-${j}`,
              start: newNodes[i].position,
              end: newNodes[j].position,
              color: "#00ffcc", // mint color for connections
              thickness: 0.02 + Math.random() * 0.03,
              flowSpeed: 0.5 + Math.random() * 1,
            })
          }
        }
      }
    }

    setNodes(newNodes)
    setConnections(newConnections)
  }, [nodeCount, connectionDensity])

  // Handle click wave effect
  const handleClick = (position) => {
    setClickWave({
      position,
      startTime: Date.now(),
    })

    if (onClick) onClick(position)
  }

  // Animate network
  useFrame(({ clock }) => {
    if (networkRef.current) {
      // Gentle rotation
      networkRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.1
    }
  })

  return (
    <group ref={networkRef}>
      {/* Nodes */}
      {nodes.map((node) => (
        <NeuralNode
          key={node.id}
          position={node.position}
          color={node.color}
          size={node.size}
          pulsing={node.pulsing}
          onClick={handleClick}
        />
      ))}

      {/* Connections */}
      {connections.map((connection) => (
        <NeuralConnection
          key={connection.id}
          start={connection.start}
          end={connection.end}
          color={connection.color}
          thickness={connection.thickness}
          flowSpeed={connection.flowSpeed}
        />
      ))}

      {/* Click wave effect */}
      {clickWave && (
        <ClickWave
          position={clickWave.position}
          startTime={clickWave.startTime}
          onComplete={() => setClickWave(null)}
        />
      )}
    </group>
  )
}

// Click Wave effect
function ClickWave({ position, startTime, onComplete }) {
  const waveRef = useRef()
  const duration = 2000 // ms

  useFrame(() => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    if (waveRef.current) {
      // Scale up
      waveRef.current.scale.set(progress * 5, progress * 5, progress * 5)

      // Fade out
      waveRef.current.material.opacity = 1 - progress
    }

    if (progress >= 1 && onComplete) {
      onComplete()
    }
  })

  return (
    <mesh ref={waveRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#00ffcc" transparent opacity={1} wireframe />
    </mesh>
  )
}

// Main Scene component
function Scene({ scrollY, mousePosition }) {
  const { camera } = useThree()
  const sceneRef = useRef()

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, 20)
  }, [camera])

  // Handle scroll effect
  useEffect(() => {
    if (sceneRef.current) {
      // Subtle movement based on scroll
      sceneRef.current.rotation.x = scrollY * 0.001
      sceneRef.current.position.y = -scrollY * 0.005
    }
  }, [scrollY])

  // Handle mouse movement
  useEffect(() => {
    if (sceneRef.current && mousePosition) {
      // Subtle rotation based on mouse position
      const targetRotationY = (mousePosition.x / window.innerWidth - 0.5) * 0.2
      const targetRotationX = (mousePosition.y / window.innerHeight - 0.5) * 0.2

      // Smooth transition
      sceneRef.current.rotation.y += (targetRotationY - sceneRef.current.rotation.y) * 0.05
      sceneRef.current.rotation.x += (targetRotationX - sceneRef.current.rotation.x) * 0.05
    }
  }, [mousePosition])

  // Handle click
  const handleClick = (position) => {
    // You can add additional effects here
    console.log("Neural node clicked at", position)
  }

  return (
    <group ref={sceneRef}>
      <NebulaField count={1000} radius={20} />
      <NeuralNetwork nodeCount={30} connectionDensity={0.2} onClick={handleClick} />
    </group>
  )
}

// Main component
export default function QuantumNeuralGalaxy({ scrollY }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isWebGLSupported, setIsWebGLSupported] = useState(true)

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

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Throttle updates for performance
      requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Fallback for devices without WebGL
  if (!isWebGLSupported) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#080A0F]">
          <svg className="w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <radialGradient id="nebula1" cx="30%" cy="30%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#8D00FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#080A0F" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="nebula2" cx="70%" cy="60%" r="50%" fx="70%" fy="60%">
                <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#080A0F" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="nebula3" cx="40%" cy="80%" r="50%" fx="40%" fy="80%">
                <stop offset="0%" stopColor="#FF0077" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#080A0F" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="#080A0F" />
            <circle cx="30%" cy="30%" r="30%" fill="url(#nebula1)">
              <animate attributeName="r" values="30%;32%;30%" dur="10s" repeatCount="indefinite" />
            </circle>
            <circle cx="70%" cy="60%" r="25%" fill="url(#nebula2)">
              <animate attributeName="r" values="25%;28%;25%" dur="12s" repeatCount="indefinite" />
            </circle>
            <circle cx="40%" cy="80%" r="20%" fill="url(#nebula3)">
              <animate attributeName="r" values="20%;23%;20%" dur="8s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-0">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 20], fov: 75 }}>
        <color attach="background" args={["#080A0F"]} />
        <fog attach="fog" args={["#080A0F", 15, 30]} />

        <Scene scrollY={scrollY} mousePosition={mousePosition} />

        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} kernelSize={KernelSize.LARGE} />
          <ChromaticAberration offset={[0.0005, 0.0005]} radialModulation={false} modulationOffset={0} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} blendFunction={BlendFunction.NORMAL} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
