import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token')
  const location = useLocation()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />
  }

  if (location.pathname === '/') {
    return <Navigate to="/dashboard" />
  }
  
  return children
}

export default PrivateRoute
