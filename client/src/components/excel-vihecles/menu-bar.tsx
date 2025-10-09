"use client"

import type React from "react"

import {
  downloadBaladyExcel,
  downloadHadariExcel,
  downloadRifiExcel,
  downloadWilayExcel,
} from "@/redux/slice/vihiculeSlice"
import type { AppDispatch, RootState } from "@/redux/store"
import { motion } from "framer-motion"
import { FileSpreadsheet, Map, Bus } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"

interface MenuItem {
  icon: React.ReactNode
  label: string
  action: () => void
  gradient: string
  iconColor: string
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}
const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}
const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}
const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
}
const sharedTransition = { type: "spring", stiffness: 100, damping: 20, duration: 0.5 }

export function MenuBar() {
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.operateur)

  const menuItems: MenuItem[] = [
    {
      icon: <FileSpreadsheet className="h-5 w-5" />,
      label: "بين البلديات ",
      action: () => dispatch(downloadBaladyExcel()),
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      iconColor: "text-blue-500",
    },
    {
      icon: <Map className="h-5 w-5" />,
      label: "ريفي",
      action: () => dispatch(downloadRifiExcel()),
      gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
      iconColor: "text-orange-500",
    },
    {
      icon: <Bus className="h-5 w-5" />,
      label: "بين الولايات",
      action: () => dispatch(downloadWilayExcel()),
      gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
      iconColor: "text-green-500",
    },
    {
      icon: <Bus className="h-5 w-5" />,
      label: "حضري",
      action: () => dispatch(downloadHadariExcel()),
      gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
      iconColor: "text-green-500",
    },
  ]

  return (
    <motion.nav
      className="p-2 rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative overflow-hidden"
      initial="initial"
      whileHover="hover"
    >
      <motion.div
        className="absolute -inset-2 bg-gradient-radial from-transparent via-blue-400/20 via-30% via-purple-400/20 via-60% via-red-400/20 via-90% to-transparent rounded-3xl z-0 pointer-events-none"
        variants={navGlowVariants}
      />
      <ul className="flex items-center gap-2 relative z-10">
        {menuItems.map((item) => (
          <motion.li key={item.label} className="relative">
            <motion.div
              className="block rounded-xl overflow-visible group relative"
              style={{ perspective: "600px" }}
              whileHover="hover"
              initial="initial"
              onClick={item.action}
            >
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                variants={glowVariants}
                style={{ background: item.gradient, opacity: 0, borderRadius: "16px" }}
              />
              <motion.button
                className="flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent text-muted-foreground group-hover:text-foreground transition-colors rounded-xl"
                variants={itemVariants}
                transition={sharedTransition}
                style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                disabled={loading}
              >
                <span className={`transition-colors duration-300 group-hover:${item.iconColor} text-foreground`}>
                  {item.icon}
                </span>
                <span>{loading ? "جارٍ التحميل..." : item.label}</span>
              </motion.button>
              <motion.button
                className="flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent text-muted-foreground group-hover:text-foreground transition-colors rounded-xl"
                variants={backVariants}
                transition={sharedTransition}
                style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                disabled={loading}
              >
                <span className={`transition-colors duration-300 group-hover:${item.iconColor} text-foreground`}>
                  {item.icon}
                </span>
                <span>{loading ? "جارٍ التحميل..." : item.label}</span>
              </motion.button>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  )
}
