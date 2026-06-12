import { Router } from "express";
import { applyProject, enhanceResumeText, getAllNDAs, getMyApplications, getStats, getStudent, getWalletData, loginStudent, recommendProjects, registerStudent, sendEmailVerificationOtp, updateStudent, uploadSignedNDA } from "../controllers/studentController.js";
import upload from "../configs/multer.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const studentRouter = Router();

studentRouter.post('/send-otp', sendEmailVerificationOtp);
studentRouter.post('/register', upload.single('resume'), registerStudent);
studentRouter.post('/login', loginStudent);
studentRouter.get('/profile', verifyToken, getStudent);
studentRouter.put('/update-profile', verifyToken, upload.fields([
	{ name: 'profilePicture', maxCount: 1 },
	{ name: 'resume', maxCount: 1 },
]), updateStudent);
studentRouter.post('/enhance', enhanceResumeText);
studentRouter.post('/apply-project', verifyToken, upload.fields([
	{ name: 'cvFile', maxCount: 1 },
	{ name: 'planFile', maxCount: 1 }
]), applyProject);
studentRouter.get('/applied-projects', verifyToken, getMyApplications);
studentRouter.get('/recommendations', verifyToken, recommendProjects);
studentRouter.get('/ndas', verifyToken, getAllNDAs);
studentRouter.put('/upload-nda', verifyToken, upload.single('ndaFile'), uploadSignedNDA);
studentRouter.get('/stats', verifyToken, getStats);
studentRouter.get('/wallet', verifyToken, getWalletData);
export default studentRouter;