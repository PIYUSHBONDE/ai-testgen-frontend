import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, provider } from '../firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  reload,
} from 'firebase/auth'

const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)

  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    
    // send verification email after account creation
    try {
      await sendEmailVerification(cred.user)
    } catch (e) {
      // non-fatal: verification email couldn't be sent; continue
      console.warn('sendEmailVerification failed', e)
    }

    if (displayName) {
      try {
        await updateProfile(cred.user, { displayName })
        // trigger local update
        setUser({ ...cred.user })
      } catch (e) {
        // ignore profile update failures; user is created
      }
    }
    return cred
  }

  const logout = () => signOut(auth)

  const signInWithGoogle = () => signInWithPopup(auth, provider)

  const sendVerification = async () => {
    const u = auth.currentUser
    if (!u) throw new Error('No authenticated user')
    return sendEmailVerification(u)
  }

  const reloadUser = async () => {
    const u = auth.currentUser
    if (!u) return null
    await reload(u)
    // refresh local user state
    setUser(auth.currentUser)
    return auth.currentUser
  }

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, signInWithGoogle, sendVerification, reloadUser }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
