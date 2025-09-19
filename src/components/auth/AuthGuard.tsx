"use client"

import type React from "react"

import { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "../../hooks/redux"
import { setCredentials, setLoading } from "../../store/slices/authSlice"
import { LoadingSpinner } from "../ui/loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Check for stored auth token on mount
    const checkAuth = async () => {
      dispatch(setLoading(true))

      try {
        const token = localStorage.getItem("auth_token")
        const userData = localStorage.getItem("user_data")

        if (token && userData) {
          const user = JSON.parse(userData)
          dispatch(setCredentials({ user, token }))
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      } finally {
        dispatch(setLoading(false))
      }
    }

    if (!isAuthenticated && !user) {
      checkAuth()
    }
  }, [dispatch, isAuthenticated, user])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
