"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Link } from "react-router-dom"
import { Model, type TabNode, type IJsonModel, Actions, Layout as FlexLayout, DockLocation } from "flexlayout-react"
import "flexlayout-react/style/light.css"
import {
  Car,
  Key,
  LayoutDashboard,
  LucideLayoutDashboard,
  Settings,
  User,
  UserCheck,
  Users,
  Menu,
  X,
  Home,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

import { DashboardStats } from "./pages/DashboardStats"
import OperatorStats from "./components/OperatorStats"
import VehicleStats from "./pages/VehicleStats"
import DriverStats from "./pages/DriverStats"
import ChangePassword from "./pages/ChangePassword"
import { EditProfile } from "./pages/EditProfile"
import { CreateAdmin } from "./pages/CreateAdmin"
import { UserActivityStats } from "./pages/UserActivityStats"
import { useUser } from "@/hooks/context/userContext/UserProvider"
import { useTheme } from "@/hooks/context/ThemeContext"
import { Helmet } from "react-helmet-async"

const createTab = (label: string, component: string) => ({
  type: "tab",
  name: label,
  component,
})

interface TabItem {
  id: string
  label: string
  component: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const tabItems: TabItem[] = [
  {
    id: "dashboard",
    label: "لوحة التحكم",
    component: "dashboard",
    icon: LayoutDashboard,
    description: "نظرة عامة على جميع الإحصائيات",
  },
  {
    id: "operators",
    label: "إحصائيات المتعاملين",
    component: "operators",
    icon: Users,
    description: "تتبع وإدارة المتعاملين",
  },
  {
    id: "vehicles",
    label: "إحصائيات المركبات",
    component: "vehicles",
    icon: Car,
    description: "إدارة ومراقبة المركبات",
  },
  {
    id: "drivers",
    label: "إحصائيات السائقين",
    component: "drivers",
    icon: UserCheck,
    description: "تتبع وإدارة السائقين",
  },
  {
    id: "user-activity",
    label: "نشاط المستخدمين",
    component: "user-activity",
    icon: User,
    description: "تتبع نشاط المستخدمين حسب الوقت والمكان",
  },
]

const layoutConfig: IJsonModel = {
  global: { tabEnableClose: false },
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        id: "main",
        weight: 100,
        children: [
          createTab("Dashboard", "dashboard"),
          createTab("Operators", "operators"),
          createTab("Vehicles", "vehicles"),
          createTab("User Activity", "user-activity"),
          createTab("Change Password", "change-password"),
          createTab("Edit profile", "edit-profile"),
        ],
      },
    ],
  },
}

const FlexDashboardLayout = () => {
  const { userData } = useUser()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [model, setModel] = useState(() => Model.fromJson(layoutConfig))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string>("dashboard")

  const factory = (node: TabNode) => {
    const comp = node.getComponent()
    switch (comp) {
      case "dashboard":
        return <DashboardStats />
      case "operators":
        return <OperatorStats />
      case "vehicles":
        return <VehicleStats />
      case "drivers":
        return <DriverStats />
      case "user-activity":
        return <UserActivityStats />
      case "change-password":
        return <ChangePassword />
      case "edit-profile":
        return <EditProfile />
      case "create-admin":
        return <CreateAdmin />
      default:
        return <div>غير معرف</div>
    }
  }

  const addTab = useCallback(
    (name: string, component: string) => {
      const tabset = model.getNodeById("main")
      if (!tabset || !tabset.getType || tabset.getType() !== "tabset") return

      const existingTab = (tabset as any).getChildren().find((tab: TabNode) => tab.getComponent() === component)

      if (existingTab) {
        model.doAction(Actions.selectTab(existingTab.getId()))
        setModel(Model.fromJson(model.toJson()))
        setSelectedTab(component)
        return
      }

      const newTab = { type: "tab", name, component }
      model.doAction(Actions.addNode(newTab, "main", DockLocation.CENTER, -1))
      setModel(Model.fromJson(model.toJson()))
      setSelectedTab(component)
    },
    [model],
  )

  const handleTabClick = (item: TabItem) => {
    addTab(item.label, item.component)
    setMenuOpen(false)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>مديرية النقل - لوحة التحكم</title>
        <meta name="description" content="نظام إدارة النقل المتطور" />
        <link
          rel="icon"
          type="image/png"
          href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
        />
      </Helmet>

      {/* Enhanced Navbar */}
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <LucideLayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  مديرية النقل
                </h1>
                <p className="text-xs text-gray-600">نظام الإدارة المتطور</p>
              </div>
              <h1 className="text-lg font-bold text-gray-800 sm:hidden">مديرية النقل</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {tabItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTab === item.component
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-gray-700" />}
              </button>
              {/* Home Link */}
              <Link
                to="/"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">الرئيسية</span>
              </Link>

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden md:inline">إعدادات</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
                </button>

                {settingsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} />
                    <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {userData?.fullName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{userData?.fullName}</p>
                            <p className="text-sm text-gray-500">{userData?.email || "admin@transport.gov"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            addTab("إنشاء حساب جديد", "create-admin")
                            setSettingsOpen(false)
                            setMenuOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-sm text-right transition-colors"
                        >
                          <Key className="w-4 h-4 text-blue-600" />
                          إنشاء حساب جديد
                        </button>

                        <button
                          onClick={() => {
                            addTab("تعديل الملف الشخصي", "edit-profile")
                            setSettingsOpen(false)
                            setMenuOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-sm text-right transition-colors"
                        >
                          <User className="w-4 h-4 text-green-600" />
                          تعديل الملف الشخصي
                        </button>

                        <button
                          onClick={() => {
                            addTab("تغيير كلمة المرور", "change-password")
                            setSettingsOpen(false)
                            setMenuOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-sm text-right transition-colors"
                        >
                          <Key className="w-4 h-4 text-purple-600" />
                          تغيير كلمة المرور
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 lg:hidden">
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="grid gap-2">
                  {tabItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedTab === item.component
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-blue-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="text-right">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs opacity-70">{item.description}</div>
                        </div>
                      </button>
                    )
                  })}

                  <Separator className="my-2" />

                  <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    الصفحة الرئيسية
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Layout Tabs */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full overflow-hidden">
          <FlexLayout model={model} factory={factory} />
        </div>
      </div>
    </div>
  )
}

export default FlexDashboardLayout
