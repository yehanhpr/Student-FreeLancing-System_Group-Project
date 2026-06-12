import { Router } from "express";
import {
    assignProject, createProject, deleteProject, getAllApplicationsForProject,
    getAllNDAs, getApplicantDetails, getRecruiter, getStats, loginRecruiter,
    registerRecruiter, sendEmailVerificationOtp, sendNDA, updateProject,
    updateRecruiter, getAssignedProjects, processPayment, submitReview, getStudentReviews
} from "../controllers/recruiterController.js";
import upload from "../configs/multer.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const recruiterRouter = Router();

recruiterRouter.post('/send-otp', sendEmailVerificationOtp);
recruiterRouter.post('/register', upload.single('companyLogo'), registerRecruiter);
recruiterRouter.post('/login', loginRecruiter);
recruiterRouter.post('/create-project', verifyToken, createProject);
recruiterRouter.put('/update-project/:projectId', verifyToken, updateProject);
recruiterRouter.get('/profile', verifyToken, getRecruiter);
recruiterRouter.put('/update-profile', verifyToken, upload.single('companyLogo'), updateRecruiter);
recruiterRouter.get('/project-applicants', verifyToken, getAllApplicationsForProject);
recruiterRouter.post('/send-nda', verifyToken, upload.single('ndaDocument'), sendNDA);
recruiterRouter.get('/ndas', verifyToken, getAllNDAs);
recruiterRouter.post('/applicant-details', verifyToken, getApplicantDetails);
recruiterRouter.get('/stats', verifyToken, getStats);
recruiterRouter.post('/assign-project', verifyToken, assignProject);
recruiterRouter.delete('/delete-project/:projectId', verifyToken, deleteProject);

// ── Payments ──────────────────────────────────────────────────────────────────
recruiterRouter.get('/assigned-projects', verifyToken, getAssignedProjects);
recruiterRouter.post('/process-payment', verifyToken, processPayment);
recruiterRouter.post('/submit-review', verifyToken, submitReview);
recruiterRouter.get('/student-reviews/:studentId', verifyToken, getStudentReviews);

export default recruiterRouter;