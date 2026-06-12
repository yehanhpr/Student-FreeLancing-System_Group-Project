import { Router } from "express";
import { getAllCompanies } from "../controllers/companyController.js";

const companyRouter = Router();

companyRouter.get('/', getAllCompanies);

export default companyRouter;