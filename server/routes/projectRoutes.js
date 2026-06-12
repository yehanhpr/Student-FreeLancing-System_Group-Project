import { Router } from "express";
import { getAllProjects, getProjectById, getProjectsByRecruiterId } from "../controllers/projectsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const projectRouter = Router();

projectRouter.get('/', getAllProjects);
projectRouter.get('/:recruiterId',verifyToken, getProjectsByRecruiterId);
projectRouter.get('/project/:projectId',verifyToken, getProjectById);

export default projectRouter;