import { MemoryRouter } from 'react-router-dom'
import { render, screen, within } from '@testing-library/react'
import AppShell from './AppShell'

test('shows the primary navigation labels', () => {
  render(
    <MemoryRouter>
      <AppShell />
    </MemoryRouter>,
  )

  const navigation = screen.getByRole('navigation')

  expect(navigation).toBeInTheDocument()
  expect(within(navigation).getByText('仪表盘')).toBeInTheDocument()
  expect(within(navigation).getByText('服务')).toBeInTheDocument()
  expect(within(navigation).getByText('账户增长')).toBeInTheDocument()
  expect(within(navigation).getByText('订单')).toBeInTheDocument()
  expect(within(navigation).getByText('账单')).toBeInTheDocument()
  expect(within(navigation).getByText('套餐 & 订阅')).toBeInTheDocument()
})

test('shows the MangoGrowth brand in the shell', () => {
  render(
    <MemoryRouter>
      <AppShell />
    </MemoryRouter>,
  )

  expect(screen.getByText('MangoGrowth')).toBeInTheDocument()
})
