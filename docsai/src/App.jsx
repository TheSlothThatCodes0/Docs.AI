import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";

export const App = () => {
  return (
    <div className="bg-neutral-100 flex flex-col justify-center items-center">
			<BrowserRouter>
			
			<Routes>
				<Route path="/" element={<LandingPage />} />
			</Routes>
			
			</BrowserRouter>

		</div>
  )
}
