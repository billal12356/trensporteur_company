import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Model, TabNode, IJsonModel, Actions, Layout as FlexLayout, DockLocation } from "flexlayout-react";
import "flexlayout-react/style/light.css";
import { Key, LogOut, LucideLayoutDashboard, Settings, User } from "lucide-react";
import OperatorStats from "./components/OperatorStats";
import VehicleStats from "./pages/VehicleStats";
import DriverStats from "./pages/DriverStats";
import ChangePassword from "./pages/ChangePassword";
import { DashboardStats } from "./pages/DashboardStats";
import { EditProfile } from "./pages/EditProfile";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/context/userContext/UserProvider";
import { CreateAdmin } from "./pages/CreateAdmin";

const createTab = (label: string, component: string) => ({
  type: "tab",
  name: label,
  component,
});

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
          createTab("Change Password", "change-password"),
          createTab("Edit profile", "edit-profile"),
        ],
      },
    ],
  },
};

const FlexDashboardLayout = () => {
  const { userData } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [model, setModel] = useState(() => Model.fromJson(layoutConfig));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string | null>(null); // حالة لتتبع الزر المختار
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const factory = (node: TabNode) => {
    const comp = node.getComponent();
    switch (comp) {
      case "dashboard":
        return <DashboardStats />;
      case "operators":
        return <OperatorStats />;
      case "vehicles":
        return <VehicleStats />;
      case "drivers":
        return <DriverStats />;
      case "change-password":
        return <ChangePassword />;
      case "edit-profile":
        return <EditProfile />;
      case "create-admin":
        return <CreateAdmin />;
      default:
        return <div>غير معرف</div>;
    }
  };

  const addTab = useCallback(
    (name: string, component: string) => {
      const tabset = model.getNodeById("main");
      if (!tabset || !tabset.getType || tabset.getType() !== "tabset") return;

      const existingTab = (tabset as any).getChildren().find(
        (tab: TabNode) => tab.getComponent() === component
      );

      if (existingTab) {
        model.doAction(Actions.selectTab(existingTab.getId()));
        setModel(Model.fromJson(model.toJson()));
        setSelectedTab(component); // تحديث الزر المختار
        return;
      }

      const newTab = { type: "tab", name, component };
      model.doAction(Actions.addNode(newTab, "main", DockLocation.CENTER, -1));
      setModel(Model.fromJson(model.toJson()));
      setSelectedTab(component); // تحديث الزر المختار
    },
    [model]
  );

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      {/* ✅ Navbar */}
      <nav className="shadow md:flex md:justify-between p-4 bg-black sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LucideLayoutDashboard className="text-blue-600" />
            <h1 className="text-lg font-bold text-white">لوحة التحكم</h1>
          </div>

          {/* الزر لفتح/إغلاق القائمة في الجوال */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white md:hidden"
          >
            ☰
          </button>
        </div>

        {/* القائمة الكاملة - تظهر دائما في الشاشات الكبيرة، وتُظهر عند الفتح في الشاشات الصغيرة */}
        <div
          className={`flex flex-col md:flex-row md:items-center gap-2 mt-4 md:mt-2 ${menuOpen ? "block" : "hidden md:flex"
            }`}
        >
          {[
            ["Dashboard", "dashboard"],
            ["احصائيات المتعامل", "operators"],
            ["المركبة", "vehicles"],
            ["السائق", "drivers"],
          ].map(([label, key]) => (
            <button
              key={key}
              onClick={() => {
                addTab(label, key);
                setMenuOpen(false);
              }}
              className={`px-3 py-1 rounded-md text-sm cursor-pointer transition ${selectedTab === key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-300 text-gray-700"
                }`}
            >
              {label}
            </button>
          ))}

          <Link to='/' className="bg-gray-100 hover:bg-gray-300 text-gray-700 px-3 py-1 text-sm rounded-md transition">الصفحة الرئيسية</Link>
          {/* قائمة الإعدادات المنسدلة */}
          {/* قائمة الإعدادات المنسدلة */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-gray-100 hover:bg-gray-300 text-gray-700"
            >
              <Settings className="w-4 h-4" />
              إعدادات
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 bg-white border w-[200px] border-gray-200 rounded-md shadow-lg z-50">
                <h1 className="text-center p-1 w-[100%] ">{userData?.fullName} </h1>
                <Separator />
                <button
                  onClick={() => {
                    addTab("انشاء حساب جديد", "create-admin");
                    setSettingsOpen(false);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-sm text-left"
                >
                  <Key className="w-4 h-4 text-blue-600" />
                  انشاء حساب جديد
                </button>
                <Separator />
                <button
                  onClick={() => {
                    addTab("كلمة السر", "change-password");
                    setSettingsOpen(false);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-sm text-left"
                >
                  <Key className="w-4 h-4 text-blue-600" />
                  تغيير كلمة السر
                </button>
                <Separator />
                <button
                  onClick={() => {
                    addTab("البروفايل", "edit-profile");
                    setSettingsOpen(false);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-sm text-left"
                >
                  <User className="w-4 h-4 text-green-600" />
                  تعديل البروفايل
                </button>
              </div>
            )}
          </div>


        </div>
      </nav>


      {/* ✅ Layout Tabs */}
      <div className="flex-1 p-2">
        <FlexLayout model={model} factory={factory} />
      </div>
    </div>
  );
};

export default FlexDashboardLayout;
