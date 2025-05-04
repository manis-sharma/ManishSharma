"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll } from "framer-motion"
import { useInView } from "framer-motion"
import Link from "next/link"
import { SocialLinks } from "./components/social-links"
import FloatingNavbar from "./components/floating-navbar"
import QuantumNeuralGalaxySimple from "./components/quantum-neural-galaxy-simple"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Github, ExternalLink } from "lucide-react"
import Image from "next/image"
import { ThemeProvider } from "@/components/theme-provider"
import ContactFormEmailJS from "./components/contact-form-emailjs"
import { Toaster } from "sonner"

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const aboutRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const isAboutInView = useInView(aboutRef, { once: true, amount: 0.3 })
  const isProjectsInView = useInView(projectsRef, { once: true, amount: 0.3 })
  const isContactInView = useInView(contactRef, { once: true, amount: 0.3 })

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update scrollY for background
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Projects data
  const projects = [
    {
      id: "united-academy",
      title: "United Academy",
      description: "Modern school website with clean UI/UX, responsive design, and course listing features.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["React", "Tailwind CSS", "Vite"],
      links: {
        github: "https://github.com/manis-sharma/united-academy-dang",
        live: "https://united-academy-dang.vercel.app",
      },
    },
    {
      id: "quantum-ecommerce",
      title: "Quantum E-commerce",
      description:
        "A full-stack e-commerce platform with instant quantum data loading and holographic product displays.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["Next.js", "React", "Node.js", "MongoDB", "Stripe"],
      links: {
        github: "https://github.com/manis-sharma/full-stack-app",
        live: "https://quantum-ecommerce.vercel.app",
      },
    },
    {
      id: "neural-task-manager",
      title: "Neural Task Manager",
      description:
        "A real-time task management system with AI-driven workflow optimization and biometric authentication.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["React", "Firebase", "TensorFlow.js", "WebRTC"],
      links: {
        github: "https://github.com/manis-sharma/first-frontend-project",
        live: "https://neural-tasks.vercel.app",
      },
    },
    {
      id: "sentient-chat",
      title: "Sentient Chat Interface",
      description: "An AI-powered chat interface with emotional intelligence and holographic avatar projection.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["TypeScript", "OpenAI API", "Three.js", "WebGL"],
      links: {
        github: "https://github.com/manis-sharma/united-academy-dang",
        live: "https://sentient-chat.vercel.app",
      },
    },
  ]

  // Tech stack data
  const technologies = [
    // Frontend
    { name: "React", icon: "⚛️", color: "#61DAFB", category: "Frontend", level: 95 },
    { name: "Next.js", icon: "▲", color: "#ffffff", category: "Frontend", level: 90 },
    { name: "TypeScript", icon: "TS", color: "#3178C6", category: "Frontend", level: 85 },
    { name: "TailwindCSS", icon: "🌊", color: "#38B2AC", category: "Frontend", level: 90 },
    { name: "Framer Motion", icon: "🔄", color: "#FF4D8B", category: "Frontend", level: 80 },

    // Backend
    { name: "Node.js", icon: "🟢", color: "#339933", category: "Backend", level: 85 },
    { name: "Express", icon: "🚂", color: "#000000", category: "Backend", level: 80 },
    { name: "MongoDB", icon: "🍃", color: "#47A248", category: "Backend", level: 75 },
    { name: "PostgreSQL", icon: "🐘", color: "#336791", category: "Backend", level: 70 },
    { name: "GraphQL", icon: "◯", color: "#E535AB", category: "Backend", level: 65 },

    // DevOps
    { name: "Docker", icon: "🐳", color: "#2496ED", category: "DevOps", level: 70 },
    { name: "AWS", icon: "☁️", color: "#FF9900", category: "DevOps", level: 65 },
    { name: "CI/CD", icon: "🔄", color: "#4CAF50", category: "DevOps", level: 75 },
    { name: "Git", icon: "🔀", color: "#F05032", category: "DevOps", level: 90 },
    { name: "Linux", icon: "🐧", color: "#FCC624", category: "DevOps", level: 80 },
  ]

  const categories = [...new Set(technologies.map((tech) => tech.category))]

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div
        ref={containerRef}
        className="min-h-screen bg-black dark:bg-black text-neutral-800 dark:text-neutral-100 relative overflow-hidden"
      >
        {isMounted && <QuantumNeuralGalaxySimple scrollY={scrollY} />}
        <FloatingNavbar />
        <Toaster position="top-right" richColors />

        <main className="relative z-10">
          <section
            id="about"
            ref={aboutRef}
            className="min-h-screen flex items-center justify-center relative overflow-hidden py-20"
          >
            <div className="container px-4 md:px-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center justify-center space-y-8 text-center"
              >
                <div className="space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-transparent bg-clip-text bg-gradient-to-r from-[#8D00FF] via-[#00FFFF] to-[#FF0077]"
                  >
                    Full Stack Developer
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto max-w-[700px] text-neutral-400 md:text-xl"
                  >
                    Building digital experiences with quantum technologies. Crafting elegant solutions to complex
                    problems in the cybernetic age.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SocialLinks />
                </motion.div>
              </motion.div>
            </div>
          </section>

          <section id="projects" ref={projectsRef} className="py-24 md:py-32 lg:py-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#080A0F] via-[#8D00FF]/10 to-[#080A0F] pointer-events-none"></div>
            <div className="container px-4 md:px-6 relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isProjectsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-16 text-center"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8D00FF]">
                  Projects
                </span>
              </motion.h2>

              {/* Projects Grid */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isProjectsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1 * index, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card className="overflow-hidden h-full bg-[#080A0F]/80 backdrop-blur-md border-[#8D00FF]/20 group hover:border-[#00FFFF]/30 transition-colors duration-300">
                      <div className="relative aspect-video overflow-hidden">
                        // Modify your Image components to include proper sizing and optimization
                        <Image
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0} // Add priority for first image
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/80 via-[#080A0F]/40 to-transparent" />
                      </div>
                      <div className="p-5 relative">
                        <h3 className="font-semibold text-xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8D00FF]">
                          {project.title}
                        </h3>
                        <p className="text-sm text-neutral-400 mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-[#8D00FF]/20 px-2.5 py-0.5 text-xs font-medium text-[#00FFFF] border border-[#8D00FF]/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4 mt-auto">
                          {project.links.github && (
                            <Link href={project.links.github} target="_blank">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-[#080A0F]/80 backdrop-blur-md border-[#8D00FF]/30 text-[#8D00FF] hover:bg-[#8D00FF]/20 hover:text-[#00FFFF]"
                              >
                                <Github className="h-4 w-4 mr-2" />
                                GitHub
                              </Button>
                            </Link>
                          )}

                          {project.links.live && (
                            <Link href={project.links.live} target="_blank">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-[#080A0F]/80 backdrop-blur-md border-[#00FFFF]/30 text-[#00FFFF] hover:bg-[#00FFFF]/20 hover:text-[#8D00FF]"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Live Demo
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" ref={contactRef} className="py-24 md:py-32 lg:py-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#080A0F] via-[#8D00FF]/10 to-[#080A0F] pointer-events-none"></div>
            <div className="container px-4 md:px-6 relative z-10">
              <div className="mx-auto max-w-4xl">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={isContactInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-16 text-center"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0077] to-[#8D00FF]">
                    Neural Link
                  </span>
                </motion.h2>

                {/* EmailJS Contact Form */}
                <ContactFormEmailJS />
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#8D00FF]/20 bg-[#080A0F]/80 backdrop-blur-md">
          <div className="container flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6">
            <p className="text-xs text-neutral-500">© 2025 Manish Sharma💗. All neural rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link className="text-xs text-neutral-500 hover:text-[#00FFFF] transition-colors" href="#">
                Terms of Neural Service
              </Link>
              <Link className="text-xs text-neutral-500 hover:text-[#00FFFF] transition-colors" href="#">
                Quantum Privacy
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}
