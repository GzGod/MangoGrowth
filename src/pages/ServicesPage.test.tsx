import { render, screen } from '@testing-library/react'
import ServicesPage from './ServicesPage'

test('services page shows six action cards', () => {
  render(<ServicesPage />)

  expect(screen.getAllByTestId('service-action-card')).toHaveLength(6)
})
