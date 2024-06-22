import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import LandingPage from './Pages/LandingPage'
import TestPage from './Pages/TestPage'

export const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TestPage/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}