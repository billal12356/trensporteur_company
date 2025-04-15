import { lazy, Suspense } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom';
import Loading from './components/Loading';
import { Toaster } from 'sonner';
import { useUser } from './hooks/context/userContext/UserProvider';
import Layout from '@/dashboard/layout';
import { AppSidebar } from './dashboard/app-sidebar';
const Home = lazy(() => import("./pages/home/Page"));
const Login = lazy(() => import("./pages/auth/SignIn"));
const Operateur = lazy(() => import("./pages/operateur/Operateur"));
const Chauffeur = lazy(() => import("./pages/chauffeur/Chauffeur"));
const Véhecule = lazy(() => import("./pages/vehecule/Vehecule"));

const CreateOperateur = lazy(() => import("@/pages/operateur/CreateOperateur"))
const CreateVihicule = lazy(() => import("@/pages/vehecule/CreateVihicules"))
const UpdateVihicule = lazy(() => import("@/pages/vehecule/UpdateVihicules"))

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
          <Route path="/create-vihicule" element={userData ? <CreateVihicule /> : <Login />} />
          <Route path="/update-vihicule/:id" element={userData ? <UpdateVihicule /> : <Login />} />


          <Route
            path="/dashboard"
            element={
              <Layout>
                {userData ? <AppSidebar /> : <Login />}
              </Layout>
            }
          />

        </Routes>
      </Suspense>
    </>
  )
}

export default App
