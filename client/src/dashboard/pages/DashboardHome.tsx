import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { fetchOperateurs } from '@/redux/slice/operateurSlice'
import { fetchVihicules } from '@/redux/slice/vihiculeSlice'
import { fetchChauffeurs } from '@/redux/slice/chauffeurSlice'
import { FaBus } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { StatCard } from '../operateur-stats'
import Chart from '../Chart'

export const DashboardHome = () => {
  const { operateurs } = useSelector((state: RootState) => state.operateur)
  const { vihicules } = useSelector((state: RootState) => state.vihicule)
  const { chauffeurs } = useSelector((state: RootState) => state.chauffeur)
  const dispatch = useDispatch<AppDispatch>()
  const [Page] = useState()
  const [searchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchOperateurs({ search: searchQuery, page: Page }));
    dispatch(fetchVihicules({ search: searchQuery, page: Page }));
    dispatch(fetchChauffeurs({ search: searchQuery, page: Page }));
  }, [dispatch, searchQuery, Page]);
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="المتعاملين" value={operateurs.length} icon={<FaUsers />} />
        <StatCard title="السائقين" value={chauffeurs.length} icon={<FaUserTie />} />
        <StatCard title="المركبات" value={vihicules.length} icon={<FaBus />} />
      </div>
      <div className="">
        <Chart />
      </div>
    </div>
  )
}
