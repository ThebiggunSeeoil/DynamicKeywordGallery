import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'

export default function AppRoot() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
