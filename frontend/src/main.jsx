import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from 'react-router-dom'
import './index.css'
import PlaylistDetail from './pages/PlaylistDetail.jsx'

import Layout from './Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NotFound from './pages/NotFound.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Login />} />
      
      <Route path="/dashboard" element={<Layout />}>
        <Route path="" element={<Dashboard />} />
        <Route path="playlist/:id" element={<PlaylistDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)