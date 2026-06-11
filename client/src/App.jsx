import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import AuthPage from './pages/AuthPage'
import StudentDashBoard from './pages/StudentDashboard/StudentDashBoard'
import DashBoard from './pages/StudentDashboard/DashBoard'
import BrowseProjects from './pages/StudentDashboard/BrowseProjects'
import AppliedProjects from './pages/StudentDashboard/AppliedProjects'
import NDARequests from './pages/StudentDashboard/NDARequests'
import Submissions from './pages/StudentDashboard/Submissions'
import Wallet from './pages/StudentDashboard/Wallet'
import Settings from './pages/StudentDashboard/Settings'
import Aos from 'aos'
import "aos/dist/aos.css";
import OwnerDashBoard from './pages/OwnerDashboard/OwnerDashBoard'
import OwnerDashboardLanding from './pages/OwnerDashboard/OwnerDashboardLanding'
import Projects from './pages/OwnerDashboard/Projects'
import CreateProject from './pages/OwnerDashboard/CreateProject'
import NDAManagement from './pages/OwnerDashboard/NDAManagement'
import AllApplicant from './pages/OwnerDashboard/AllApplicant'
import Payments from './pages/OwnerDashboard/Payments'
import OwnerSettings from './pages/OwnerDashboard/OwnerSettings'
import ProjectApplicants from './pages/OwnerDashboard/ProjectApplicants'
import ReviewSubmission from './pages/OwnerDashboard/ReviewSubmission'
import ViewStudentDetails from './pages/OwnerDashboard/ViewStudentDetails'
import AllProjects from './pages/AllProjects'
import ResumeBuilder from './pages/StudentDashboard/ResumeBuilder'
import { Toaster } from 'react-hot-toast'
import StudentRoutesProtector from './RouteProtector/StudentRoutesProtector'
import RecruiterRouterProtector from './RouteProtector/RecruiterRouterProtector'
import Companies from './pages/Companies'
import AboutPage from './pages/AboutPage'
import ViewStudentDetails2 from './pages/OwnerDashboard/ViewStudentDetails2'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'


const App = () => {

  useEffect(() => {
    Aos.init({
      duration: 800,        // animation duration (ms)
      once: true,           // animate only once
      easing: "ease-in-out" // smooth animation
    });
  }, []);

  return (
    <>
      <Toaster position='top-right' reverseOrder={false} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/auth' element={<AuthPage />} />
        <Route path='/apply-project/:id' element={<ProjectDetail />} />
        <Route path='/projects' element={<AllProjects />} />
        <Route path='/companies' element={<Companies />} />
        <Route path='/about' element={<AboutPage />} />

        <Route element={<StudentRoutesProtector />}>
          <Route path="/student-dashboard" element={<StudentDashBoard />}>

            <Route index element={<DashBoard />} />
            <Route path="browse-projects" element={<BrowseProjects />} />
            <Route path="applied-projects" element={<AppliedProjects />} />
            <Route path="nda-requests" element={<NDARequests />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="resumebuilder" element={<ResumeBuilder />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="settings" element={<Settings />} />

          </Route>
        </Route>

        <Route element={<RecruiterRouterProtector />}>
          <Route path="/owner-dashboard" element={<OwnerDashBoard />}>

            <Route index element={<OwnerDashboardLanding />} />

            <Route path="projects" element={<Projects />} />
            <Route path="create-project" element={<CreateProject />} />
            <Route path="create-project/:projectId" element={<CreateProject />} />
            <Route path="owner-nda" element={<NDAManagement />} />
            <Route path="all-applicants" element={<AllApplicant />} />
            <Route path="all-applicants/:projectId" element={<ProjectApplicants />} />
            <Route path="payments" element={<Payments />} />
            <Route path="owner-settings" element={<OwnerSettings />} />
            <Route path="review-submission/:studentId" element={<ReviewSubmission />} />
            <Route path="view-details" element={<ViewStudentDetails />} />
          </Route>
        </Route>

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

      </Routes>
    </>
  )
}

export default App