import { render, screen } from '@testing-library/react'
import App from '../App'

test('renders the dashboard page heading', () => {
  render(<App />)

  expect(screen.getByRole('heading', { level: 1, name: '仪表盘' })).toBeInTheDocument()
})
