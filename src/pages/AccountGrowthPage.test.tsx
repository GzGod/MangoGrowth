import { render, screen } from '@testing-library/react'
import AccountGrowthPage from './AccountGrowthPage'

test('account growth page shows a subscription empty state', () => {
  render(<AccountGrowthPage />)

  expect(screen.getByTestId('subscription-empty-state')).toBeInTheDocument()
})
