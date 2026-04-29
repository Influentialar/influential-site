// src/App.js
import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom'

import { AuthProvider, useAuth } from './lib/AuthContext'

import NavBar               from './components/NavBar/NavBar'
import InfluencersPage      from './pages/Influencers/InfluencersPage'
import InfluencerDetailPage from './pages/Influencers/InfluencerDetailPage'
import CreatorsPage         from './pages/Creators/CreatorsPage'
import CreatorDetailPage    from './pages/Creators/CreatorDetailPage'
import BrandsPage           from './pages/Brands/BrandsPage'
import BrandDetailPage      from './pages/Brands/BrandDetailPage'
import PlansPage            from './pages/Plans/PlansPage'
import MessagesPage         from './pages/Messages/MessagesPage'
import LoginPage            from './pages/Login/LoginPage'
import SignUpPage           from './pages/SignUp/SignUpPage'
import LandingPage          from './pages/Landing/LandingPage'
import HomePage             from './pages/Home/HomePage'
import MyProfilePage        from './pages/MyProfile/MyProfilePage'
import SocialCallback       from './pages/AuthCallback/SocialCallback'
import ForgotPasswordPage   from './pages/ForgotPassword/ForgotPasswordPage'
import ResetPasswordPage    from './pages/ResetPassword/ResetPasswordPage'

function AppRoutes() {
  const { session, profile, loading, isPasswordRecovery } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: '1.2rem', color: '#666'
      }}>
        Cargando...
      </div>
    )
  }

  const isAuth = !!session
  const role   = profile?.role || 'influencer'

  // Redirect to reset-password when coming from recovery email
  if (isPasswordRecovery && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />
  }

  const needsOnboarding = isAuth && profile && !profile.handle && !profile.bio

  if (needsOnboarding && location.pathname !== '/mi-perfil') {
    return (
      <>
        <NavBar userRole={role} userEmail={profile?.email || ''} />
        <Navigate to="/mi-perfil" replace />
      </>
    )
  }

  if (!isAuth) {
    return (
      <Routes>
        <Route path="/signup"         element={<SignUpPage />} />
        <Route path="/forgot"         element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/landing"        element={<LandingPage />} />
        <Route path="*"               element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <>
      <NavBar userRole={role} userEmail={profile?.email || ''} />

      <Routes>
        <Route path="/" element={<Navigate to={role === 'marca' ? '/influencers' : '/marcas'} replace />} />

        {/* Influencers: solo accesible para marcas */}
        <Route
          path="/influencers"
          element={role === 'influencer' ? <Navigate to="/marcas" replace /> : <InfluencersPage />}
        />
        <Route
          path="/influencers/:id"
          element={role === 'influencer' ? <Navigate to="/marcas" replace /> : <InfluencerDetailPage />}
        />

        {/* Creadores UGC: solo accesible para marcas */}
        <Route
          path="/creadores"
          element={role === 'influencer' ? <Navigate to="/marcas" replace /> : <CreatorsPage />}
        />
        <Route
          path="/creadores/:id"
          element={role === 'influencer' ? <Navigate to="/marcas" replace /> : <CreatorDetailPage />}
        />

        {/* Marcas: solo accesible para influencers */}
        <Route
          path="/marcas"
          element={role === 'marca' ? <Navigate to="/influencers" replace /> : <BrandsPage />}
        />
        <Route
          path="/brands/:id"
          element={role === 'marca' ? <Navigate to="/influencers" replace /> : <BrandDetailPage />}
        />

        <Route path="/mi-perfil"          element={<MyProfilePage />} />
        <Route path="/reset-password"     element={<ResetPasswordPage />} />
        <Route path="/auth/instagram/callback" element={<SocialCallback platform="instagram" />} />
        <Route path="/auth/tiktok/callback"    element={<SocialCallback platform="tiktok" />} />
        <Route path="/planes"            element={<PlansPage />} />
        <Route path="/messages"          element={<MessagesPage />} />
        <Route path="/messages/:chatId"  element={<MessagesPage />} />

        <Route path="/landing" element={<LandingPage />} />
        <Route path="/home"    element={<HomePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
