import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.ts'
import { UserProvider } from './hooks/context/userContext/UserProvider.tsx'
import { ThemeProvider } from './hooks/context/ThemeContext.tsx'
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './pages/statistique/ErrorBoundary.tsx'
import axios from 'axios';

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <UserProvider>
          <ThemeProvider>
            <HelmetProvider> {/* ⬅️ أضف هذا هنا */}
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </HelmetProvider>
          </ThemeProvider>
        </UserProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)

