// src/lib/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [session, setSession]            = useState(null)
  const [profile, setProfile]            = useState(null)
  const [loading, setLoading]            = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  // Listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true)
          setSession(session)
          return
        }
        setSession(session)
        if (session) fetchProfile(session.user.id)
        else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
      setLoading(false)
      return
    }

    // Fila no existe → crearla con los metadatos del usuario auth
    if (error?.code === 'PGRST116') {
      const { data: { user } } = await supabase.auth.getUser()
      const meta = user?.user_metadata || {}
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id:    userId,
          email: user.email,
          name:  meta.name  || '',
          role:  meta.role  || 'influencer',
        })
        .select()
        .single()
      if (newProfile) setProfile(newProfile)
    }

    setLoading(false)
  }

  // Sign up
  async function signUp(email, password, name, role) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: role || 'influencer' } }
    })
    return { data, error }
  }

  // Log in
  async function logIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  // Log out
  async function logOut() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  // Update profile
  async function updateProfile(updates) {
    if (!session) return { error: 'No session' }
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', session.user.id)
      .select()
      .single()

    if (!error && data) setProfile(data)
    return { data, error }
  }

  const value = {
    session,
    profile,
    loading,
    isPasswordRecovery,
    clearPasswordRecovery: () => setIsPasswordRecovery(false),
    signUp,
    logIn,
    logOut,
    updateProfile,
    fetchProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
