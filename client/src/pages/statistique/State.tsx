import React from 'react'
import ErrorBoundary from './ErrorBoundary'
import Statistique from './Statistique'

export const State = () => {
  return (
    <ErrorBoundary>
      <Statistique />
    </ErrorBoundary>
  )
}
