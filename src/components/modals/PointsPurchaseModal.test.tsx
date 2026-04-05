import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PlansPage from '../../pages/PlansPage'

test('opens the credits modal from the plans page', async () => {
  const user = userEvent.setup()

  render(<PlansPage />)
  await user.click(screen.getByTestId('open-credits-modal'))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
