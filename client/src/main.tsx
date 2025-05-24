import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.ts'
import { UserProvider } from './hooks/context/userContext/UserProvider.tsx'
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './pages/statistique/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <UserProvider>
          <HelmetProvider> {/* ⬅️ أضف هذا هنا */}
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </HelmetProvider>
        </UserProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)

