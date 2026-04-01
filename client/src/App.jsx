import React, { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Auth from './pages/Auth'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import Landing from './components/Landing'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Careers from './pages/Careers'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import HelpCentre from './pages/HelpCentre'
import Settings from './pages/Settings'
import Changelog from './pages/Changelog'
import InterviewPage from './pages/InterviewPage'
import LiveVideoInterview from './components/LiveVideoInterview'
import PlacementPredictor from './pages/PlacementPredictor'
import Pricing from './pages/Pricing'
import Analytics from './pages/Analytics'
import ProfilePage from './pages/ProfilePage'
import QuestionBank from './pages/QuestionBank'
import MySessions from './pages/MySessions'
import Blog from './pages/Blog'
import ApiDocs from './pages/ApiDocs'
import InterviewReport from './pages/InterviewReport'

// Uncomment below for local development:
// export const ServerURL = "http://localhost:8080"
export const ServerURL = "https://oralytics-backend.onrender.com"

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(
          ServerURL + "/api/user/current-user",
          { withCredentials: true }
        )
        // setUserData also flips authLoading → false internally
        dispatch(setUserData(result.data.user))
      } catch (error) {
        console.log(error)
        // not logged in — still flip authLoading so Dashboard stops spinning
        dispatch(setUserData(null))
      }
    }
    getUser()
  }, [dispatch])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/"              element={<Landing />} />
      <Route path='/about'         element={<About />} />
      <Route path='/careers'       element={<Careers />} />
      <Route path="/privacy"       element={<PrivacyPolicy />} />
      <Route path="/terms"         element={<TermsOfUse />} />
      <Route path="/help"          element={<HelpCentre />} />
      <Route path="/settings"      element={<Settings />} />
      <Route path="/changelog"     element={<Changelog />} />
      <Route path="/blog"          element={<Blog />} />
      <Route path="/docs"          element={<ApiDocs />} />
      <Route path='/interview'     element={<InterviewPage />} />
      <Route path='/live-interview' element={<LiveVideoInterview />} />
      <Route path="/predictor"     element={<PlacementPredictor />} />
      <Route path='/dashboard'     element={<Dashboard />} />
      <Route path='/analytics' element={<Analytics />} />
      <Route path='/profile'        element={<ProfilePage />} />
      <Route path='/question-bank'   element={<QuestionBank />} />
      <Route path='/my-sessions'   element={<MySessions />} />
      <Route path='/report/:id'      element={<InterviewReport />} />
      <Route path='/credits'         element={<Pricing />} />
      <Route path='/auth'          element={<Auth />} />
      </Routes>
    </>
  )
}

export default App
