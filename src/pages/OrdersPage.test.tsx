import { render, screen } from '@testing-library/react'
import OrdersPage from './OrdersPage'

test('orders page renders search and status controls', () => {
  render(<OrdersPage />)

  expect(screen.getByRole('searchbox')).toBeInTheDocument()
  expect(screen.getByRole('combobox')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '创建服务' })).toBeInTheDocument()
})
