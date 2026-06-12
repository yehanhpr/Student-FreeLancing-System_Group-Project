import express from 'express';
import { 
    loginAdmin,
    registerAdmin,
    getDashboardStats, 
    getAllStudents, 
    deleteStudent, 
    getAllRecruiters, 
    deleteRecruiter, 
    getAllProjects, 
    deleteProject, 
    getAllApplications, 
    getAllNDAs, 
    getProfile
} from '../controllers/adminController.js';
// Add authentication middleware if needed
// import authAdmin from '../middlewares/authAdmin.js';

const adminRouter = express.Router();

adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.get('/profile', getProfile);

// We can add authAdmin middleware here for protection
adminRouter.get('/stats', getDashboardStats);

adminRouter.get('/students', getAllStudents);
adminRouter.delete('/students/:id', deleteStudent);

adminRouter.get('/recruiters', getAllRecruiters);
adminRouter.delete('/recruiters/:id', deleteRecruiter);

adminRouter.get('/projects', getAllProjects);
adminRouter.delete('/projects/:id', deleteProject);

adminRouter.get('/applications', getAllApplications);

adminRouter.get('/ndas', getAllNDAs);

export default adminRouter;
