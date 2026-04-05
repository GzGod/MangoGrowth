import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import AccountGrowthPage from '../pages/AccountGrowthPage'
import BillingPage from '../pages/BillingPage'
import DashboardPage from '../pages/DashboardPage'
import OrdersPage from '../pages/OrdersPage'
import PlansPage from '../pages/PlansPage'
import ServicesPage from '../pages/ServicesPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/account-growth" element={<AccountGrowthPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/plans" element={<PlansPage />} />
      </Route>
    </Routes>
  )
}
