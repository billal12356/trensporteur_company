import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/context/userContext/UserProvider";

export const NavBar = () => {
  const { userData, logout } = useUser();

  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="flex items-center gap-4">
        <span>{userData?.fullName}</span>
        <Button onClick={logout} color="error" className="cursor-pointer ">🚪 Logout</Button>      </div>
    </div>
  )
}
