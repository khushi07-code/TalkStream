import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import LandingPage from './pages/landing'
import Authentication from "./pages/authentication";
import AuthProvider from "./contexts/AuthContext";
import VideoMeetComponent from "./pages/videoMeet";
import HomeComponent from "./pages/home";
import History from "./pages/history";

function App() {

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/history" element={<History/>} />
            <Route path="/home" element={<HomeComponent/>} />
            <Route path="/:url" element={<VideoMeetComponent/>}/>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App
