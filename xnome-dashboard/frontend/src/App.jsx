import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './pages/Login'
import { OverviewPage } from './pages/Overview'
import { AcquisitionPage } from './pages/Acquisition'
import { GameplayPage } from './pages/Gameplay'
import { MonetizationPage } from './pages/Monetization'
import { RewardsPage } from './pages/Rewards'
// Tokenomics page removed
import { TreasuryPage } from './pages/Treasury'
import { RiskPage } from './pages/Risk'
import { ReportsPage } from './pages/Reports'
import { AdminPage } from './pages/Admin'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <OverviewPage />
              </RequireAuth>
            }
          />
          <Route
            path="/acquisition"
            element={
              <RequireAuth>
                <AcquisitionPage />
              </RequireAuth>
            }
          />
          <Route
            path="/gameplay"
            element={
              <RequireAuth>
                <GameplayPage />
              </RequireAuth>
            }
          />
          <Route
            path="/monetization"
            element={
              <RequireAuth>
                <MonetizationPage />
              </RequireAuth>
            }
          />
          <Route
            path="/rewards"
            element={
              <RequireAuth>
                <RewardsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/treasury"
            element={
              <RequireAuth>
                <TreasuryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/risk"
            element={
              <RequireAuth>
                <RiskPage />
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <ReportsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
