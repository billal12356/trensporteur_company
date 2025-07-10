import { Helmet } from 'react-helmet-async'
import ErrorBoundary from './ErrorBoundary'
import Statistique from './Statistique'
import logo from '@/assets/images.png'

export const State = () => {
  return (
    <ErrorBoundary>
      <Helmet>
        <title>الاحصائيات</title>
        <meta name="description" content="مرحبا بك في Dtw Aindefla" />
        <link rel="icon" type="image/png" href={logo} />
      </Helmet>
      <Statistique />
    </ErrorBoundary>
  )
}
