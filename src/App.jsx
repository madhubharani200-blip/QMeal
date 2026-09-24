import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute, { RoleRedirect } from './components/ProtectedRoute'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import OrderHistory from './pages/OrderHistory'
import ChefDashboard from './pages/ChefDashboard'
import StaffDashboard from './pages/StaffDashboard'
import ManagerDashboard from './pages/ManagerDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRedirect />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/history"
            element={
              <ProtectedRoute roles={['student']}>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chef"
            element={
              <ProtectedRoute roles={['chef']}>
                <ChefDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute roles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
