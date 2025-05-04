"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Fingerprint, CheckCircle, AlertCircle } from "lucide-react"
import emailjs from "@emailjs/browser"
import { toast } from "sonner"

export default function ContactFormEmailJS() {
  const [pending, setPending] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })

  const formRef = useRef<HTMLFormElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const simulateBiometricScan = () => {
    setPending(true)
    setTimeout(() => {
      setPending(false)
      setScanComplete(true)
      toast.success("Biometric verification complete", {
        description: "You can now submit the contact form",
        duration: 3000,
      })
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!scanComplete) {
      toast.error("Please complete biometric verification first")
      return
    }

    setPending(true)

    try {
      // Get environment variables
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS environment variables are not set")
      }

      // Send email using EmailJS
      const result = await emailjs.sendForm(serviceId, templateId, formRef.current!, publicKey)

      console.log("Email sent successfully:", result.text)

      // Reset form
      setFormState({ name: "", email: "", message: "" })
      setScanComplete(false)

      // Show success toast
      toast.success("Message sent successfully!", {
        description: "I'll get back to you as soon as possible.",
        icon: <CheckCircle className="h-4 w-4" />,
        duration: 5000,
      })
    } catch (error) {
      console.error("Failed to send email:", error)

      // Show error toast
      toast.error("Failed to send message", {
        description: "Please try again later or contact me directly.",
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 5000,
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="bg-black/40 backdrop-blur-md border border-blue-500/20 rounded-xl overflow-hidden p-6"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Biometric authentication section */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4 border border-blue-500/20 rounded-lg bg-blue-950/10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 text-center"
            >
              <h3 className="text-lg font-semibold mb-2 text-blue-300">Biometric Verification</h3>
              <p className="text-sm text-blue-200/70">Scan to authenticate your neural signature</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative mb-8"
            >
              <div className="w-32 h-32 rounded-full border-2 border-blue-500/30 flex items-center justify-center relative">
                <Fingerprint
                  className={`w-20 h-20 ${scanComplete ? "text-green-400" : "text-blue-400"}`}
                  strokeWidth={1}
                />

                {/* Scanning animation */}
                {pending && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-blue-500/50 z-10"
                  />
                )}

                {/* Scan complete indicator */}
                {scanComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 rounded-full border-2 border-green-500 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 rounded-full bg-green-500/10" />
                  </motion.div>
                )}
              </div>

              {/* Rotating scanner effect */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/30 pointer-events-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                onClick={simulateBiometricScan}
                disabled={pending || scanComplete}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                {scanComplete ? <>Verified</> : pending ? <>Scanning...</> : <>Authenticate</>}
              </Button>
            </motion.div>
          </div>

          {/* Contact form section */}
          <div className="w-full md:w-2/3">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-blue-300">
                  Neural Identifier
                </label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    disabled={!scanComplete}
                    className="bg-blue-950/10 border-blue-500/30 text-blue-100 focus:border-blue-400 focus:ring-blue-400/30"
                    placeholder="Enter your name"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-blue-300">
                  Quantum Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    disabled={!scanComplete}
                    className="bg-blue-950/10 border-blue-500/30 text-blue-100 focus:border-blue-400 focus:ring-blue-400/30"
                    placeholder="Enter your email"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-blue-300">
                  Neural Transmission
                </label>
                <div className="relative">
                  <Textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    required
                    disabled={!scanComplete}
                    className="bg-blue-950/10 border-blue-500/30 text-blue-100 focus:border-blue-400 focus:ring-blue-400/30 min-h-[120px]"
                    placeholder="Enter your message"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: scanComplete ? 1.02 : 1 }}
                  whileTap={{ scale: scanComplete ? 0.98 : 1 }}
                >
                  <Button
                    type="submit"
                    disabled={pending || !scanComplete}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none relative overflow-hidden group"
                  >
                    <span className="relative z-10">{pending ? "Transmitting..." : "Initiate Neural Link"}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/50 to-blue-600/0 group-hover:via-blue-500/70 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
