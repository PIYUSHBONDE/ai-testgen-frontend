import React, { useState } from 'react'
import { Button } from './ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from './ToastProvider'

export default function EmailVerificationNotice() {
  const { user, sendVerification, reloadUser } = useAuth()
  const { addToast } = useToast()
  const [sending, setSending] = useState(false)
  const [reloading, setReloading] = useState(false)

  const handleResend = async () => {
    setSending(true)
    try {
      await sendVerification()
      addToast({ title: 'Verification email sent', description: 'Check your inbox (and spam) for the verification link.', type: 'success' })
    } catch (err) {
      addToast({ title: 'Failed to send', description: err.message || 'Could not send verification email', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const handleReload = async () => {
    setReloading(true)
    try {
      const u = await reloadUser()
      if (u?.emailVerified) {
        addToast({ title: 'Email verified', description: 'Thanks — you can now use the app.', type: 'success' })
      } else {
        addToast({ title: 'Not verified yet', description: "We couldn't detect verification yet. Try again after clicking the email link.", type: 'info' })
      }
    } catch (err) {
      addToast({ title: 'Error', description: err.message || 'Unable to refresh verification status', type: 'error' })
    } finally {
      setReloading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto my-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">Verify your email</div>
          <div className="text-sm text-slate-700 dark:text-slate-300">We sent a verification link to <span className="font-medium">{user?.email}</span>. Please click it to continue.</div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleResend} className="bg-amber-400 text-white" disabled={sending}>{sending ? 'Sending...' : 'Resend'}</Button>
          <Button variant="ghost" onClick={handleReload} disabled={reloading}>{reloading ? 'Checking...' : 'I clicked the link'}</Button>
        </div>
      </div>
    </div>
  )
}
