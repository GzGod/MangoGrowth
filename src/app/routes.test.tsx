import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

test('opens the mobile navigation drawer from the header control', async () => {
  const user = userEvent.setup()

  render(<App />)

  expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '打开导航菜单' }))

  expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument()
})
