import { render, screen } from '@testing-library/react'
import BillingPage from './BillingPage'

test('billing page renders profile and usage sections', () => {
  render(<BillingPage />)

  expect(screen.getByTestId('billing-profile-card')).toBeInTheDocument()
  expect(screen.getByTestId('billing-usage-card')).toBeInTheDocument()
})
