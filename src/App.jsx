import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OutletProvider } from './context/OutletContext'
import ProtectedRoute, { RoleRedirect } from './components/ProtectedRoute'
import Login from './pages/Login'
import OutletSelection from './pages/OutletSelection'
import StudentDashboard from './pages/StudentDashboard'
import OrderHistory from './pages/OrderHistory'
import ChefDashboard from './pages/ChefDashboard'
import StaffDashboard from './pages/StaffDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import Profile from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <OutletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RoleRedirect />} />

            {/* Outlet Selection */}
            <Route
              path="/outlets"
              element={
                <ProtectedRoute roles={['student', 'chef', 'staff', 'manager']}>
                  <OutletSelection />
                </ProtectedRoute>
              }
            />

            {/* Profile Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={['student', 'chef', 'staff', 'manager']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
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

            {/* Chef Route */}
            <Route
              path="/chef"
              element={
                <ProtectedRoute roles={['chef']}>
                  <ChefDashboard />
                </ProtectedRoute>
              }
            />

            {/* Staff Route */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute roles={['staff']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Manager Route */}
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
      </OutletProvider>
    </AuthProvider>
  )
}
