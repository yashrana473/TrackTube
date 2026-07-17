import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from 'react-router-dom'
import './index.css'

// Import components
import Layout from './Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Route - No Navbar */}
      <Route path="/" element={<Login />} />
      
      {/* Protected Routes - Wrapped in the Layout Navbar */}
      <Route path="/dashboard" element={<Layout />}>
        <Route path="" element={<Dashboard />} />
      </Route>
    </>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)