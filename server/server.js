import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './configs/db.js';
import studentRouter from './routes/studentRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import recruiterRouter from './routes/recruiterRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import companyRouter from './routes/companyRoutes.js';
import adminRouter from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
await connectDB();
await connectCloudinary();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.use('/api/student', studentRouter);
app.use('/api/recruiter', recruiterRouter);
app.use('/api/companies', companyRouter);
app.use('/api/admin', adminRouter);
app.use('/api/projects', projectRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});