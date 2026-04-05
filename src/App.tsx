import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './app/router'

type AppProps = {
  useMemoryRouter?: boolean
}

function App({ useMemoryRouter = true }: AppProps) {
  if (useMemoryRouter) {
    return (
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRoutes />
      </MemoryRouter>
    )
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
