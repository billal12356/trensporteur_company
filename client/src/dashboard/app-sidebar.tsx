import { useUser } from '@/hooks/context/userContext/UserProvider';
import { Link } from 'react-router-dom'

export const Sidebar = () => {
    const { userData } = useUser();
  
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
    <h2 className="text-2xl font-bold mb-6">Admin {userData?.fullName}</h2>
    <nav>
      <ul className="space-y-4">
        <li className="hover:text-blue-400 cursor-pointer">
          <Link to='/dashboard'>Dashboard</Link>
        </li>
        <li className="hover:text-blue-400 cursor-pointer">
          <Link to='statistique-op'>Statistique Operateurs</Link>
        </li>
        <li className="hover:text-blue-400 cursor-pointer">
          <Link to='statistique-vh'>Statistique Vihicles</Link>
        </li>
        <li className="hover:text-blue-400 cursor-pointer">
          <Link to='statistique-ch'>Statistique Chauffeurs</Link>
        </li>
        <li className="hover:text-blue-400 cursor-pointer">
          <Link to='users/:id/change-password'>Change Password</Link>
        </li>
        <li className="hover:text-blue-400 cursor-pointer">
          <Link to='update-user/:id'>Updated Profile</Link>
        </li>
      </ul>
    </nav>

    <Link to='/' className='mt-36' >Back to home page</Link>
  </aside>
  )
}
