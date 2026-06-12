import Student from "../models/Student.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from 'cloudinary';
import generateToken from "../utils/generateToken.js";
import ai from "../configs/ai.js";
import e from "express";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import { generateOtp } from "../utils/generateOtp.js";
import mongoose from "mongoose";
import Application from "../models/Application.js";
import Project from "../models/Project.js";
import NDA from "../models/NDA.js";

const ALLOWED_RESUME_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];

const getFileExtension = (filename = '') => {
    const parts = filename.toLowerCase().split('.');
    return parts.length > 1 ? parts.pop() : '';
};

const isValidResumeFile = (file) => {
    if (!file) return false;
    const ext = getFileExtension(file.originalname || '');
    return ALLOWED_RESUME_MIME_TYPES.includes(file.mimetype) && ALLOWED_RESUME_EXTENSIONS.includes(ext);
};

export const sendEmailVerificationOtp = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const otp = generateOtp();

        await sendOtpEmail(email, otp, name);
        return res.status(200).json({ success: true, message: 'OTP sent to email', otp });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ success: false, message: 'Error sending OTP email' });
    }
}

export const registerStudent = async (req, res) => {
    try {

        const { name, email, password, university, major } = req.body;

        const resume = req.file ? req.file.path : null;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        const isExistingStudent = await Student.findOne({ email });

        if (isExistingStudent) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (req.file && !isValidResumeFile(req.file)) {
            return res.status(400).json({ success: false, message: 'Only PDF, DOC, or DOCX resume files are allowed' });
        }

        let resumeUrl = '';
        if (resume) {
            const uploadResult = await cloudinary.uploader.upload(resume, {
                folder: 'students/resumes',
                resource_type: 'raw',
                use_filename: true,
                unique_filename: true,
            });
            resumeUrl = uploadResult.secure_url;
        }


        const newStudent = new Student({
            name,
            email,
            password: hashedPassword,
            university,
            major,
            resume: resumeUrl
        });

        await newStudent.save();

        const token = generateToken(newStudent._id, 'student');

        return res.status(201).json({ success: true, message: 'Student registered successfully', student: newStudent, token });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Error registering student' });
    }
}

export const loginStudent = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(student._id, 'student');

        return res.status(200).json({ success: true, message: 'Student logged in successfully', student, token });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Error logging in student' });
    }
}

export const getStudent = async (req, res) => {
    try {
        return res.status(200).json({ success: true, student: req.user });
    } catch (error) {
        console.log('Error fetching student:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error fetching student' });
    }
};

export const updateStudent = async (req, res) => {
    try {
        const student = req.user;
        const profilePictureFile = req.files?.profilePicture?.[0];
        const resumeFile = req.files?.resume?.[0];

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const {
            name,
            email,
            phone,
            university,
            major,
            graduationYear,
            bio,
            skills,
            github,
            linkedin,
            portfolio
        } = req.body;

        student.name = name ?? student.name;
        student.email = email ?? student.email;
        student.phone = phone ?? student.phone;
        student.university = university ?? student.university;
        student.major = major ?? student.major;
        student.graduationYear = graduationYear ?? student.graduationYear;
        student.bio = bio ?? student.bio;
        student.github = github ?? student.github;
        student.linkedin = linkedin ?? student.linkedin;
        student.portfolio = portfolio ?? student.portfolio;

        if (skills) {
            const parsedSkills = JSON.parse(skills);

            student.skills = Array.isArray(parsedSkills)
                ? parsedSkills.map(skill => String(skill).trim()).filter(skill => skill.length > 0)
                : student.skills;
        }

        if (profilePictureFile) {
            const uploadResult = await cloudinary.uploader.upload(profilePictureFile.path, {
                folder: 'students/profile_pictures',
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png']
            });
            student.profilePicture = uploadResult.secure_url;
        }

        if (resumeFile) {
            if (!isValidResumeFile(resumeFile)) {
                return res.status(400).json({ success: false, message: 'Only PDF, DOC, or DOCX resume files are allowed' });
            }

            const uploadResult = await cloudinary.uploader.upload(resumeFile.path, {
                folder: 'students/resumes',
                resource_type: 'raw',
                use_filename: true,
                unique_filename: true,
            });
            student.resume = uploadResult.secure_url;
        }

        await student.save();

        return res.status(200).json({ success: true, message: 'Student updated successfully', student });
    } catch (error) {
        console.error('Error updating student:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error updating student' });
    }
}

export const enhanceResumeText = async (req, res) => {
    try {

        const { currentValue } = req.body;

        if (!currentValue) {
            return res.status(400).json({ success: false, message: 'Current value is required' });
        }

        const response = await ai.chat.completions.create({
            model: process.env.GEMINI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly and only return text, no options or anything else."
                },
                {
                    role: "user",
                    content: currentValue,
                },
            ],
        });


        return res.status(200).json({ success: true, enhancedValue: response.choices[0].message.content });

    } catch (error) {
        console.error('Error enhancing resume text:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error enhancing resume text' });
    }
}

export const applyProject = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    let cvPublicId = null;
    let planPublicId = null;

    try {
        const studentId = req.user._id;

        if (!studentId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const cvFile = req.files?.cvFile?.[0];
        const planFile = req.files?.planFile?.[0];

        const { projectId, notes, status } = req.body;

        if (!projectId || !cvFile || !planFile) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'Project ID, CV file, and project plan file are required' });
        }

        const existingApplication = await Application.findOne({ studentId, projectId }).session(session);

        if (existingApplication) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'You have already applied for this project' });
        }

        const cvUploadResult = await cloudinary.uploader.upload(cvFile.path, {
            folder: 'applications/cvs',
            resource_type: 'raw',
            use_filename: true,
            unique_filename: true,
        });
        cvPublicId = cvUploadResult.public_id;

        const planUploadResult = await cloudinary.uploader.upload(planFile.path, {
            folder: 'applications/plans',
            resource_type: 'raw',
            use_filename: true,
            unique_filename: true,
        });
        planPublicId = planUploadResult.public_id;


        const newApplication = new Application({
            studentId,
            projectId,
            cvUrl: cvUploadResult.secure_url,
            projectPlanUrl: planUploadResult.secure_url,
            notes: notes || '',
            status: status || 'applied'
        });

        await newApplication.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true, message: 'Application submitted successfully', application: newApplication });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        // If files were uploaded before the error, attempt to delete them from Cloudinary
        try {
            if (cvPublicId) {
                await cloudinary.uploader.destroy(cvPublicId, {
                    resource_type: 'raw'
                });
            }
            if (planPublicId) {
                await cloudinary.uploader.destroy(planPublicId, {
                    resource_type: 'raw'
                });
            }

        } catch (cleanupError) {
            console.error('Error during cleanup of uploaded files:', cleanupError);
        }

        console.error('Error applying for project:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error applying for project' });
    }
}

export const getMyApplications = async (req, res) => {
    try {
        const studentId = req.user._id;

        const applications = await Application.find({ studentId })
            .populate({ path: 'projectId', select: 'title description budget deadline technologies category status', populate: { path: 'recruiter', select: 'companyName companyLogo category' } })
            .populate('ndaId', 'ndaStatus documentUrl')
            .lean();

        return res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error fetching applications' });
    }
}

export const recommendProjects = async (req, res) => {
    try {
        const student = req.user;

        if (!student) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { bio, skills } = req.user;

        const studentBio = bio || student.bio || '';
        const studentSkills = Array.isArray(skills) && skills.length > 0 ? skills : student.skills || [];

        if (!studentBio && studentSkills.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide a bio or skills for better recommendations' });
        }

        const projects = await Project.find({ status: { $in: ['open', 'in_progress', 'completed'] } }).populate('recruiter', 'companyName companyLogo category').lean();

        if (!projects || projects.length === 0) {
            return res.status(404).json({ success: true, message: 'No projects available for recommendation', projects: [] });
        }

        const simplifiedProjects = projects.map((project) => ({
            id: project._id.toString(),
            title: project.title,
            category: project.category,
            description: project.description,
            budget: project.budget,
            deadline: project.deadline,
            technologies: project.technologies || [],
            requirements: project.requirements || [],
            deliverables: project.deliverables || []
        }));

        const response = await ai.chat.completions.create({
            model: process.env.GEMINI_MODEL,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `
                            You are an expert career assistant.
                            Your job is to recommend the best projects for a student.

                            Return ONLY valid JSON in this exact format:
                                {
                                    "recommendations": [
                                        {
                                             "projectId": "string",
                                             "matchScore": number,
                                        },
                                    ]
                                }

                            Rules:
                                - Recommend at most 5 projects
                                - matchScore must be from 0 to 100
                                - Only use project IDs from the provided project list
                                - Rank best matches first
                                - Base your decision on student bio, skills, project technologies, requirements, and description
                                - Do not include any text outside JSON
                    `.trim()
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        student: {
                            bio: studentBio,
                            skills: studentSkills
                        },
                        projects: simplifiedProjects
                    })
                }
            ]
        });

        const raw = response.choices[0].message.content;
        const parsed = JSON.parse(raw);

        const recomendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

        const recommendedProjects = recomendations.map(rec => {

            const fullProject = projects.find(p => p._id.toString() === rec.projectId);

            if (!fullProject) return null;

            return {
                projectId: rec.projectId,
                matchScore: rec.matchScore,
                project: fullProject
            }
        })
            .filter(Boolean)
            .sort((a, b) => b.matchScore - a.matchScore);

        return res.status(200).json({ success: true, recommendedProjects });

    } catch (error) {
        console.error('Error recommending projects:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error recommending projects' });
    }
}


export const getAllNDAs = async (req, res) => {
    try {
        const studentId = req.user._id;

        const ndas = await Application.find({ studentId })
            .populate({ path: 'projectId', select: 'title description budget deadline technologies category status', populate: { path: 'recruiter', select: 'companyName companyLogo category' } })
            .populate('ndaId', 'ndaStatus documentUrl createdAt')
            .lean();

        if (!ndas || ndas.length === 0) {
            return res.status(404).json({ success: true, message: 'No NDAs found', ndas: [] });
        }

        return res.status(200).json({ success: true, ndas: ndas });

    } catch (error) {
        console.error('Error fetching NDAs:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error fetching NDAs' });
    }
}

export const uploadSignedNDA = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { applicationId } = req.body;
        const ndaFile = req.file;

        console.log(applicationId);
        if (!applicationId || !ndaFile) {
            return res.status(400).json({ success: false, message: 'Application ID and signed NDA file are required' });
        }

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const nda = await NDA.findOne({ applicationId: applicationId });

        const uploadResult = await cloudinary.uploader.upload(ndaFile.path, {
            folder: 'ndas/signed',
            resource_type: 'raw',
            use_filename: true,
            unique_filename: true,
        });

        await NDA.findByIdAndUpdate(nda._id, {
            documentUrl: uploadResult.secure_url,
            ndaStatus: 'accepted'
        });

        await Application.findByIdAndUpdate(nda.applicationId, {
            status: 'selected',
            ndaId: nda._id
        });

        await Project.findByIdAndUpdate(nda.applicationId, {
            status: 'in_progress'
        });

        return res.status(200).json({ success: true, message: 'Signed NDA uploaded successfully', ndaUrl: uploadResult.secure_url });


    } catch (error) {
        console.error('Error uploading signed NDA:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error uploading signed NDA' });
    }
}


export const getStats = async (req, res) => {
    try {
        const studentId = req.user._id;

        const applications = await Application.find({ studentId });

        let applicationStats = {
            total: 0,
            applied: 0,
            selected: 0,
            rejected: 0,
        };

        applications.forEach(application => {
            applicationStats.total++;
            if (applicationStats[application.status] !== undefined) {
                applicationStats[application.status]++;
            } else {
                applicationStats[application.status] = 1;
            }
        });

        const assignedApplications = applications.filter(app => app.status === 'assigned');
        const projectIds = assignedApplications.map(app => app.projectId);
        const projects = await Project.find({ _id: { $in: projectIds } });

        let projectStats = {
            total: 0,
            in_progress: 0,
            completed: 0,
        }

        projects.forEach(project => {
            projectStats.total++;
            const statusKey = project.status === 'in progress' ? 'in_progress' : project.status;
            if (projectStats[statusKey] !== undefined) {
                projectStats[statusKey]++;
            } else {
                projectStats[statusKey] = 1;
            }
        });

        const ndas = await NDA.find({ applicationId: { $in: applications.map(app => app._id) } });

        let ndaStats = {
            total: 0,
            nda_sent: 0,
            accepted: 0,
            rejected: 0
        };

        ndas.forEach(nda => {
            ndaStats.total++;
            if (ndaStats[nda.ndaStatus] !== undefined) {
                ndaStats[nda.ndaStatus]++;
            } else {
                ndaStats[nda.ndaStatus] = 1;
            }
        });



        return res.status(200).json({
            success: true,
            applications: applicationStats,
            projects: projectStats,
            ndas: ndaStats
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error fetching stats' });
    }
}


export const getWalletData = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Find all applications where this student was assigned
        const assignedApplications = await Application.find({
            studentId,
            status: 'assigned'
        });

        if (!assignedApplications.length) {
            return res.status(200).json({
                success: true,
                totalEarned: 0,
                thisMonth: 0,
                pending: 0,
                transactions: []
            });
        }

        const projectIds = assignedApplications.map(app => app.projectId);

        // Fetch projects, populating the recruiter name
        const projects = await Project.find({ _id: { $in: projectIds } })
            .populate('recruiter', 'companyName name')
            .lean();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalEarned = 0;
        let thisMonth = 0;
        let pending = 0;
        const transactions = [];

        for (const project of projects) {
            const isPaid = project.paymentStatus === 'paid' && project.status === 'completed';
            const isInProgress = project.status === 'in progress';

            if (isPaid) {
                const paidDate = project.updatedAt ? new Date(project.updatedAt) : new Date(project.deadline);
                totalEarned += project.budget;

                if (paidDate >= startOfMonth) {
                    thisMonth += project.budget;
                }

                const recruiterName = project.recruiter?.companyName || project.recruiter?.name || 'Client';

                transactions.push({
                    _id: project._id,
                    type: 'credit',
                    description: `Payment received - ${project.title}`,
                    amount: project.budget,
                    date: paidDate.toISOString(),
                    status: 'Completed',
                    category: project.category,
                    client: recruiterName,
                });
            } else if (isInProgress) {
                pending += project.budget;
            }
        }

        // Sort transactions: newest first
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.status(200).json({
            success: true,
            totalEarned,
            thisMonth,
            pending,
            transactions
        });

    } catch (error) {
        console.error('Error fetching wallet data:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error fetching wallet data' });
    }
}
