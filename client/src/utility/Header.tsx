import type React from "react"

import { useState, useEffect } from "react"
import {
  ChevronDown,
  Menu,
  X,
  Home,
  Users,
  Car,
  UserCheck,
  BarChart3,
  Plus,
  LogOut,
  User,
  Settings,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { useUser } from "@/hooks/context/userContext/UserProvider"

interface NavItem {
  label: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    description: string
  }[]
}

const navigationItems: NavItem[] = [
  {
    label: "الرئيسية",
    href: "/",
    icon: Home,
  },
  {
    label: "الجداول",
    icon: BarChart3,
    children: [
      {
        label: "المشغلين",
        href: "/operateur",
        icon: Users,
        description: "إدارة وعرض بيانات المشغلين",
      },
      {
        label: "السائقين",
        href: "/chauffeur",
        icon: UserCheck,
        description: "إدارة وعرض بيانات السائقين",
      },
      {
        label: "المركبات",
        href: "/vehecule",
        icon: Car,
        description: "إدارة وعرض بيانات المركبات",
      },
    ],
  },
  {
    label: "الإحصائيات",
    href: "/statistique",
    icon: BarChart3,
  },
  {
    label: "إنشاء جديد",
    icon: Plus,
    children: [
      {
        label: "إنشاء مشغل",
        href: "/create-operateur",
        icon: Users,
        description: "إضافة مشغل جديد للنظام",
      },
      {
        label: "إنشاء سائق",
        href: "/create-chauffeur",
        icon: UserCheck,
        description: "إضافة سائق جديد للنظام",
      },
      {
        label: "إنشاء مركبة",
        href: "/create-vehecule",
        icon: Car,
        description: "إضافة مركبة جديدة للنظام",
      },
    ],
  },
  {
    label: "لوحة التحكم",
    href: "/dashboard",
    icon: Settings,
  },
]

const EnhancedNavbar = () => {
  const { userData, logout } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null)
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const handleDropdownClick = (e: React.MouseEvent, label: string) => {
    e.stopPropagation()
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
          : "bg-white shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
                  className="w-8 h-8 rounded-lg object-cover"
                  alt="مديرية النقل"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                مديرية النقل
              </h1>
              <p className="text-xs text-gray-500">نظام الإدارة المتطور</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0

              return (
                <div key={item.label} className="relative">
                  {hasChildren ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleDropdownClick(e, item.label)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeDropdown === item.label
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </motion.button>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={item.href!}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200"
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </motion.div>
                  )}

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {hasChildren && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                      >
                        <div className="p-2">
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon
                            return (
                              <Link
                                key={child.label}
                                to={child.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                              >
                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                  <ChildIcon className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 group-hover:text-blue-700">
                                    {child.label}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">{child.description}</div>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* User Menu */}
            {userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="w-8 h-8 border-2 border-blue-200">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={userData.fullName} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                        {userData.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-right">
                      <div className="text-sm font-medium text-gray-900">{userData.fullName}</div>
                      <div className="text-xs text-gray-500">مدير النظام</div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/placeholder-avatar.jpg" alt={userData.fullName} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {userData.fullName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{userData.fullName}</p>
                          <p className="text-xs leading-none text-muted-foreground mt-1">
                            {userData.email || "admin@transport.gov"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="w-fit">
                        مدير النظام
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>الإعدادات</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  تسجيل الدخول
                </Link>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
                          className="w-10 h-10 rounded-lg object-cover"
                          alt="مديرية النقل"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">مديرية النقل</h2>
                        <p className="text-sm text-gray-500">نظام الإدارة المتطور</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon
                        const hasChildren = item.children && item.children.length > 0

                        return (
                          <div key={item.label}>
                            {hasChildren ? (
                              <div>
                                <button
                                  onClick={(e) => handleDropdownClick(e, item.label)}
                                  className="flex items-center justify-between w-full p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                  </div>
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                      activeDropdown === item.label ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                                <AnimatePresence>
                                  {activeDropdown === item.label && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-2 space-y-1"
                                    >
                                      {item.children!.map((child) => {
                                        const ChildIcon = child.icon
                                        return (
                                          <Link
                                            key={child.label}
                                            to={child.href}
                                            onClick={() => {
                                              setMobileMenuOpen(false)
                                              setActiveDropdown(null)
                                            }}
                                            className="flex items-center gap-3 p-3 ml-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                          >
                                            <ChildIcon className="w-4 h-4" />
                                            <div>
                                              <div className="font-medium">{child.label}</div>
                                              <div className="text-xs text-gray-500">{child.description}</div>
                                            </div>
                                          </Link>
                                        )
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              <Link
                                to={item.href!}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Mobile Footer */}
                  <div className="p-4 border-t border-gray-200">
                    {userData ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="/placeholder-avatar.jpg" alt={userData.fullName} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {userData.fullName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{userData.fullName}</div>
                            <div className="text-sm text-gray-500">مدير النظام</div>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            logout()
                            setMobileMenuOpen(false)
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          تسجيل الخروج
                        </Button>
                      </div>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 rounded-lg font-medium"
                      >
                        تسجيل الدخول
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default EnhancedNavbar
