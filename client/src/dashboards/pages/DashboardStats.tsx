import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { fetchOperateurs } from '@/redux/slice/operateurSlice'
import { fetchVihicules } from '@/redux/slice/vihiculeSlice'
import { fetchChauffeurs } from '@/redux/slice/chauffeurSlice'
import { FaBus } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { FaUsers, FaTrophy } from "react-icons/fa";
import { StatCard } from './oprateur-stats'
import Chart from '../components/chart'
import { fetchUserContributions } from '@/redux/slice/stateSlice'


export const DashboardStats = () => {
  const { total } = useSelector((state: RootState) => state.operateur)
  const { totalVc } = useSelector((state: RootState) => state.vihicule)
  const { totalCh } = useSelector((state: RootState) => state.chauffeur)
  const { userContributions } = useSelector((state: RootState) => state.stats)
  const dispatch = useDispatch<AppDispatch>()
  const [Page] = useState()
  const [searchQuery] = useState("");
  
  
  useEffect(() => {
    dispatch(fetchOperateurs({ search: searchQuery, page: Page }));
    dispatch(fetchVihicules({ search: searchQuery, page: Page }));
    dispatch(fetchChauffeurs({ search: searchQuery, page: Page }));
    dispatch(fetchUserContributions());
  }, [dispatch, searchQuery, Page]);
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="المتعاملين" value={total} icon={<FaUsers />} />
        <StatCard title="السائقين" value={totalCh} icon={<FaUserTie />} />
        <StatCard title="المركبات" value={totalVc} icon={<FaBus />} />
      </div>
      <div className="mt-12">
        <Chart />
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-md p-6" dir="rtl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" />
          أكثر المستخدمين إضافة للبيانات
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="p-4 font-semibold">المستخدم</th>
                <th className="p-4 font-semibold">المتعاملين</th>
                <th className="p-4 font-semibold">السائقين</th>
                <th className="p-4 font-semibold">المركبات</th>
                <th className="p-4 font-semibold">المجموع الكلي</th>
              </tr>
            </thead>
            <tbody>
              {userContributions && userContributions.slice(0, 5).map((user, index) => (
                <tr key={user.userId} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index === 0 ? 'bg-yellow-50/50' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {index === 0 && <FaTrophy className="text-yellow-500 text-xl" />}
                      {index === 1 && <span className="text-gray-400 font-bold text-lg">#2</span>}
                      {index === 2 && <span className="text-amber-600 font-bold text-lg">#3</span>}
                      {index > 2 && <span className="text-gray-400 font-bold">{index + 1}</span>}
                      <div>
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-blue-600 font-medium">{user.operateurCount}</td>
                  <td className="p-4 text-green-600 font-medium">{user.chauffeurCount}</td>
                  <td className="p-4 text-purple-600 font-medium">{user.vehicleCount}</td>
                  <td className="p-4 font-bold text-gray-900 text-lg">{user.totalCount}</td>
                </tr>
              ))}
              {(!userContributions || userContributions.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">جاري تحميل البيانات...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
