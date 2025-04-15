import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.ts'
import { UserProvider } from './hooks/context/userContext/UserProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <UserProvider>
            <App />
        </UserProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)

