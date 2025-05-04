"use client"

import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, Twitter, Instagram, Facebook } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import type React from "react"

interface SocialLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  color?: string
}

export function SocialLink({ href, icon, label, color = "blue" }: SocialLinkProps) {
  const colorVariants = {
    blue: "bg-[#00FFFF]/10 border-[#00FFFF]/30 text-[#00FFFF] hover:bg-[#00FFFF]/20 hover:border-[#00FFFF]",
    purple: "bg-[#8D00FF]/10 border-[#8D00FF]/30 text-[#8D00FF] hover:bg-[#8D00FF]/20 hover:border-[#8D00FF]",
    pink: "bg-[#FF0077]/10 border-[#FF0077]/30 text-[#FF0077] hover:bg-[#FF0077]/20 hover:border-[#FF0077]",
    mint: "bg-[#00ffcc]/10 border-[#00ffcc]/30 text-[#00ffcc] hover:bg-[#00ffcc]/20 hover:border-[#00ffcc]",
  }

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} className="inline-block">
        <Button
          variant="outline"
          size="icon"
          className={`backdrop-blur-md transition-all duration-300 ${colorVariants[color as keyof typeof colorVariants]}`}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </motion.div>
    </Link>
  )
}

export function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <SocialLink
        href="https://github.com/manis-sharma"
        icon={<Github className="h-4 w-4" />}
        label="GitHub"
        color="blue"
      />
      <SocialLink
        href="https://x.com/Manish_kharel1"
        icon={<Twitter className="h-4 w-4" />}
        label="Twitter"
        color="mint"
      />
      <SocialLink
        href="https://www.instagram.com/manish_sharmawiss11/"
        icon={<Instagram className="h-4 w-4" />}
        label="Instagram"
        color="pink"
      />
      <SocialLink
        href="https://www.facebook.com/"
        icon={<Facebook className="h-4 w-4" />}
        label="Facebook"
        color="blue"
      />
      <SocialLink href="https://www.linkedin.com/in/manish-sharma-434196364/" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" color="mint" />
      <SocialLink href="mailto:modernportfolioreact@gmail.com" icon={<Mail className="h-4 w-4" />} label="Email" color="purple" />
    </div>
  )
}
