import { render, screen } from '@testing-library/react'
import DashboardPage from './DashboardPage'

test('renders the dashboard usage and recent orders sections', () => {
  render(<DashboardPage />)

  expect(screen.getByText('新手引导')).toBeInTheDocument()
  expect(screen.getByTestId('usage-chart-card')).toBeInTheDocument()
  expect(screen.getByTestId('recent-orders-card')).toBeInTheDocument()
})
