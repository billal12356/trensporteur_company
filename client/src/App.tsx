import { lazy, Suspense } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom';
import Loading from './components/Loading';
import { Toaster } from 'sonner';
import { useUser } from './hooks/context/userContext/UserProvider';


import { State } from './pages/statistique/State';
import FlexDashboardLayout from './dashboards/Layout';
const Home = lazy(() => import("./pages/home/Page"));
const Login = lazy(() => import("./pages/auth/SignIn"));
const Operateur = lazy(() => import("./pages/operateur/Operateur"));
const Chauffeur = lazy(() => import("./pages/chauffeur/Chauffeur"));
const Véhecule = lazy(() => import("./pages/vehecule/Vehecule"));
const CreateChauffeur = lazy(() => import("@/pages/chauffeur/CreateChauffeur"))
const CreateOperateur = lazy(() => import("@/pages/operateur/CreateOperateur"))
const OperateurDetails = lazy(() => import("@/pages/operateur/DetailsOperateur"))
const UpdateOperateur = lazy(() => import("@/pages/operateur/UpdateOperateur"))
const CreateVihicule = lazy(() => import("@/pages/vehecule/CreateVihicules"))
const UpdateVihicule = lazy(() => import("@/pages/vehecule/UpdateVihicules"))
const UpdateChauffeur = lazy(() => import("@/pages/chauffeur/UpdateChauffeur"))
// const Statistique = lazy(() => import("@/pages/statistique/Statistique"))
// const Layout = lazy(()=>import("@/dashboard/layout")) 

function App() {
  const { userData } = useUser()
  return (
    <>
      <Toaster richColors position="bottom-right" />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route index element={userData ? <Home /> : <Login />} />
          <Route path="/login" element={userData ? <Home /> : <Login />} />
          <Route path="/operateur" element={userData ? <Operateur /> : <Login />} />
          <Route path="/chauffeur" element={userData ? <Chauffeur /> : <Login />} />
          <Route path="/vehecule" element={userData ? <Véhecule /> : <Login />} />
          <Route path="/create-operateur" element={userData ? <CreateOperateur /> : <Login />} />
          <Route path="/details-operateur/:id" element={userData ? <OperateurDetails /> : <Login />} />
          <Route path="/create-vehecule" element={userData ? <CreateVihicule /> : <Login />} />
          <Route path="/update-vihicule/:id" element={userData ? <UpdateVihicule /> : <Login />} />
          <Route path="/update-operateur/:id" element={userData ? <UpdateOperateur /> : <Login />} />
          <Route path="/update-chauffeur/:id" element={userData ? <UpdateChauffeur /> : <Login />} />
          <Route path="/statistique" element={userData ? <State /> : <Login />} />

          <Route path="/create-chauffeur" element={userData ? <CreateChauffeur /> : <Login />} />


          {/* <Route path="/dashboard" element={<Layout />}>
            <Route index element={<DashboardHome />} />
            <Route path="statistique-op" element={<StatistiqueOp />} />
            <Route path="statistique-ch" element={<StatistiqueCh />} />
            <Route path="statistique-vh" element={<StatistiqueVh />} />
            <Route path="users/:id/change-password" element={<ChangePasswordPage />} />
            <Route path="update-user/:id" element={<UpdateUser />} /> */}
            {/* يمكنك إضافة صفحات أخرى مثل forms, profile إلخ */}
          {/* </Route> */}
          <Route path='/dashboard' element={<FlexDashboardLayout/>}/>

        </Routes>
      </Suspense>
    </>
  )
}

export default App
