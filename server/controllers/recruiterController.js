import Recruiter from "../models/Recruiter.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from 'cloudinary';
import generateToken from "../utils/generateToken.js";
import Project from "../models/Project.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import Application from "../models/Application.js";
import NDA from "../models/NDA.js";

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
        return res.status(500).json({ success: false, message: error.message || 'Error sending OTP email' });
    }
}

export const registerRecruiter = async (req, res) => {
    try {

        const { name, companyName, email, password } = req.body;

        const companyLogo = req.file ? req.file.path : '';

        if (!name || !companyName || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const isExistingRecruiter = await Recruiter.findOne({ email });

        if (isExistingRecruiter) {
            return res.status(400).json({ success: false, message: 'Recruiter already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let companyLogoUrl = '';

        if (companyLogo) {
            const result = await cloudinary.uploader.upload(companyLogo, {
                folder: 'recruiters/companyLogos',
                allowed_formats: ['jpg', 'jpeg', 'png']
            });
            companyLogoUrl = result.secure_url;
        }

        const newRecruiter = new Recruiter({
            name,
            companyName,
            email,
            password: hashedPassword,
            companyLogo: companyLogoUrl
        });

        await newRecruiter.save();

        const token = generateToken(newRecruiter._id, 'recruiter');

        return res.status(201).json({ success: true, message: 'Recruiter registered successfully', recruiter: newRecruiter, token });
    } catch (error) {
        console.error('Error registering recruiter:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error registering recruiter' });
    }
}

export const loginRecruiter = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const recruiter = await Recruiter.findOne({ email });

        if (!recruiter) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, recruiter.password);

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(recruiter._id, 'recruiter');

        return res.status(200).json({ success: true, message: 'Recruiter logged in successfully', recruiter, token });

    } catch (error) {
        console.error('Error logging in recruiter:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error logging in recruiter' });
    }
}

export const getRecruiter = async (req, res) => {
    try {
        return res.status(200).json({ success: true, recruiter: req.user });
    } catch (error) {
        console.error('Error fetching recruiter:', error);
        return res.status(500).json({ success: false, message: 'Error fetching recruiter' });
    }
};

export const updateRecruiter = async (req, res) => {
    try {
        const recruiter = req.user;

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        const {
            name,
            companyName,
            email,
            contactNumber,
            industry,
            companySize,
            location,
            bio,
            hiringFor,
            hiringfor,
            companyWebsite,
            companyLinkedin,
            companyTwitter
        } = req.body;

        recruiter.name = name ?? recruiter.name;
        recruiter.companyName = companyName ?? recruiter.companyName;
        recruiter.email = email ?? recruiter.email;
        recruiter.contactNumber = contactNumber ?? recruiter.contactNumber;
        recruiter.industry = industry ?? recruiter.industry;
        recruiter.companySize = companySize ?? recruiter.companySize;
        recruiter.location = location ?? recruiter.location;
        recruiter.bio = bio ?? recruiter.bio;
        recruiter.companyWebsite = companyWebsite ?? recruiter.companyWebsite;
        recruiter.companyLinkedin = companyLinkedin ?? recruiter.companyLinkedin;
        recruiter.companyTwitter = companyTwitter ?? recruiter.companyTwitter;

        const hiringForPayload = hiringFor ?? hiringfor;
        if (hiringForPayload) {
            const parsedHiringFor = JSON.parse(hiringForPayload);

            recruiter.hiringFor = Array.isArray(parsedHiringFor)
                ? parsedHiringFor.map(role => String(role).trim()).filter(Boolean)
                : [String(parsedHiringFor).trim()].filter(Boolean);
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'recruiters/companyLogos',
                allowed_formats: ['jpg', 'jpeg', 'png']
            });
            recruiter.companyLogo = result.secure_url;
        }

        await recruiter.save();

        return res.status(200).json({ success: true, message: 'Recruiter updated successfully', recruiter });

    } catch (error) {
        console.error('Error updating recruiter:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error updating recruiter' });
    }
}


export const createProject = async (req, res) => {
    try {

        const recruiter = req.user;

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        const {
            title,
            category,
            description,
            budget,
            deadline,
            technologies,
            requirements,
            deliverables
        } = req.body;

        if (!title || !category || !description || !budget || !deadline || !technologies || !requirements || !deliverables) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const newProject = new Project({
            title,
            category,
            description,
            budget,
            deadline,
            technologies: technologies.map(tech => String(tech).trim()).filter(Boolean),
            requirements: requirements.map(req => String(req).trim()).filter(Boolean),
            deliverables: deliverables.map(del => String(del).trim()).filter(Boolean),
            recruiter: recruiter._id
        });

        await newProject.save();

        return res.status(201).json({ success: true, message: 'Project created successfully', project: newProject });

    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error creating project' });
    }
}


export const getAllApplicationsForProject = async (req, res) => {
    try {
        const recruiter = req.user;

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        const projectIds = await Project.find({ recruiter: recruiter._id }).select('_id');

        const applications = await Application.find({ projectId: { $in: projectIds } })
            .populate('studentId', 'name bio email skills university major graduationYear profilePicture')
            .populate('projectId', 'title description budget deadline technologies createdAt')
            .populate('ndaId', 'documentUrl status createdAt');

        return res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error('Error fetching applications for project:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching applications' });
    }
}

export const sendNDA = async (req, res) => {
    let ndaPublicId = null;
    try {
        const recruiter = req.user;
        const ndaDocument = req.file ? req.file.path : null;
        const { applicationId } = req.body;

        console.log(ndaDocument);

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Unauthorized' });
        }

        if (!applicationId || !ndaDocument) {
            return res.status(400).json({ success: false, message: 'Application ID and NDA document are required' });
        }

        const application = await Application.findById(applicationId).populate('projectId');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (String(application.projectId.recruiter) !== String(recruiter._id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to send NDA for this application' });
        }

        const existingNDA = await NDA.findOne({ applicationId });

        if (existingNDA) {
            return res.status(400).json({ success: false, message: 'NDA already exists for this application' });
        }

        const result = await cloudinary.uploader.upload(ndaDocument, {
            folder: 'ndas',
            resource_type: 'raw',
            use_filename: true,
            unique_filename: true
        });
        ndaPublicId = result.public_id;

        const newNDA = new NDA({
            applicationId,
            documentUrl: result.secure_url,
            ndaStatus: 'nda_sent'
        });
        await newNDA.save();

        application.ndaId = newNDA._id;
        application.status = 'selected';
        await application.save();

        return res.status(200).json({ success: true, message: 'NDA sent successfully', application, nda: newNDA });

    } catch (error) {
        console.error('Error sending NDA:', error);
        if (ndaPublicId) {
            try {
                await cloudinary.uploader.destroy(ndaPublicId, { resource_type: 'raw' });
            }
            catch (cleanupError) {
                console.error('Error cleaning up NDA document from Cloudinary:', cleanupError);
            }
        }
        return res.status(500).json({ success: false, message: 'Server error while sending NDA' });
    }
}


export const getAllNDAs = async (req, res) => {
    try {
        const recruiter = req.user;

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        const projectIds = await Project.find({ recruiter: recruiter._id }).select('_id');

        const applications = await Application.find({ projectId: { $in: projectIds } }).select('_id');

        const ndaList = await NDA.find({ applicationId: { $in: applications } })
            .populate({ path: 'applicationId', populate: { path: 'studentId', select: 'name email university' } })
            .populate({ path: 'applicationId', populate: { path: 'projectId', select: 'title' } });

        return res.status(200).json({ success: true, ndas: ndaList });
    } catch (error) {
        console.error('Error fetching NDAs:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching NDAs' });
    }
}

export const getApplicantDetails = async (req, res) => {
    try {

        const recruiter = req.user;

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Unauthorized' });
        }
        console.log('Received request to fetch applicant details with body:', req.body);

        const { studentId, projectId } = req.body || {};

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Student ID is required' });
        }

        const applicantDetails = await Application.findOne({ studentId, projectId })
            .populate('studentId', 'name bio email skills university major graduationYear profilePicture resume github linkedin portfolio appliedProjects')
            .populate('projectId', 'title budget deadline createdAt recruiter')
            .populate('ndaId', 'documentUrl ndaStatus createdAt updatedAt');

        if (!applicantDetails) {
            return res.status(404).json({ success: false, message: 'No application found for this student and project' });
        }

        return res.status(200).json({ success: true, applicantDetails: applicantDetails });

    } catch (error) {
        console.error('Error fetching applicant details:', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error while fetching applicant details' });
    }
}

export const updateProject = async (req, res) => {
    try {
        const recruiter = req.user;
        const { projectId } = req.params;

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        if (!projectId) {
            return res.status(400).json({ success: false, message: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (String(project.recruiter) !== String(recruiter._id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this project' });
        }

        const {
            title,
            category,
            description,
            budget,
            deadline,
            technologies,
            requirements,
            deliverables,
            status
        } = req.body;

        project.title = title ?? project.title;
        project.category = category ?? project.category;
        project.description = description ?? project.description;
        project.budget = budget ?? project.budget;
        project.deadline = deadline ?? project.deadline;
        project.technologies = technologies ? technologies.map(tech => String(tech).trim()).filter(Boolean) : project.technologies;
        project.requirements = requirements ? requirements.map(req => String(req).trim()).filter(Boolean) : project.requirements;
        project.deliverables = deliverables ? deliverables.map(del => String(del).trim()).filter(Boolean) : project.deliverables;
        project.status = status ?? project.status;

        await project.save();

        return res.status(200).json({ success: true, message: 'Project updated successfully', project });

    } catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating project' });
    }
}


export const getStats = async (req, res) => {
    try {
        const recruiter = req.user;

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        const projects = await Project.find({ recruiter: recruiter._id });
        const projectIds = projects.map(p => p._id);
        const applications = await Application.find({ projectId: { $in: projectIds } });
        const ndas = await NDA.find({ applicationId: { $in: applications.map(app => app._id) } });

        const projectStatusCounts = projects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {});

        const applicationStatusCounts = applications.reduce((acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1;
            return acc;
        }, {});

        const ndaStatusCounts = ndas.reduce((acc, n) => {
            acc[n.ndaStatus] = (acc[n.ndaStatus] || 0) + 1;
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            stats: {
                totalProjects: projects.length,
                totalApplications: applications.length,
                totalNDAs: ndas.length,
                projectStatusCounts,
                applicationStatusCounts,
                ndaStatusCounts
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching stats' });
    }
}   


export const assignProject = async (req, res) => {
    try {
        const recruiter = req.user;
        const { studentId, projectId } = req.body;

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        if (!studentId || !projectId) {
            return res.status(400).json({ success: false, message: 'Student ID and Project ID are required' });
        }

        const application = await Application.findOne({ studentId, projectId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found'});
        }

        const existingAssignment = await Application.findOne({ projectId, status: 'assigned' });
        if (existingAssignment) {
            return res.status(400).json({ success: false, message: 'Project is already assigned'});
        }

        if (application.projectId.toString() !== projectId) {
            return res.status(400).json({ success: false, message: 'Application is not for the given project' });
        }

        if (application.status !== 'selected') {
            return res.status(400).json({ success: false, message: 'Application is not selected for the project' });
        }

        application.status = 'assigned';
        await application.save();

        //update project status
        const project = await Project.findById(projectId);
        project.status = 'in progress';
        await project.save();


        //Reject other applicants
        const applications = await Application.find({ projectId });
        applications.forEach(async (app) => {
            if (app.status !== 'assigned') {
                app.status = 'rejected';
                await app.save();
            }
        });

        return res.status(200).json({ success: true, message: 'Project assigned successfully', application });
    } catch (error) {
        console.error('Error assigning project:', error);
        return res.status(500).json({ success: false, message: 'Server error while assigning project' });
    }
}   

export const deleteProject = async (req, res) => {
    try {
        const recruiter = req.user;
        const { projectId } = req.params;

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        if (!projectId) {
            return res.status(400).json({ success: false, message: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (String(project.recruiter) !== String(recruiter._id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this project' });
        }

        await Project.findByIdAndDelete(projectId);
        
        // Delete related applications and NDAs
        const applications = await Application.find({ projectId });
        const appIds = applications.map(app => app._id);
        await Application.deleteMany({ projectId });
        await NDA.deleteMany({ applicationId: { $in: appIds } });

        return res.status(200).json({ success: true, message: 'Project deleted successfully' });

    } catch (error) {
        console.error('Error deleting project:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting project' });
    }
}

// ── Payments ──────────────────────────────────────────────────────────────────

export const getAssignedProjects = async (req, res) => {
    try {
        const recruiter = req.user;

        if (!recruiter) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Find projects belonging to this recruiter that are in progress or completed
        const projects = await Project.find({
            recruiter: recruiter._id,
            status: { $in: ['in progress', 'completed'] }
        }).sort({ updatedAt: -1 });

        // For each project, find the assigned application and populate the student
        const projectsWithStudent = await Promise.all(
            projects.map(async (project) => {
                const assignedApplication = await Application.findOne({
                    projectId: project._id,
                    status: 'assigned'
                }).populate('studentId', 'name email university degree major profilePicture rating completedProjects');

                return {
                    _id: project._id,
                    title: project.title,
                    category: project.category,
                    budget: project.budget,
                    deadline: project.deadline,
                    submittedDate: project.submittedDate || project.updatedAt,
                    status: project.status,
                    paymentStatus: project.paymentStatus || 'unpaid',
                    assignedStudent: assignedApplication?.studentId || null,
                };
            })
        );

        // Filter out any projects where no assigned student was found
        const result = projectsWithStudent.filter(p => p.assignedStudent !== null);

        return res.status(200).json({ success: true, projects: result });
    } catch (error) {
        console.error('Error fetching assigned projects:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching assigned projects' });
    }
};


export const processPayment = async (req, res) => {
    try {
        const recruiter = req.user;
        const { projectId, amount } = req.body;

        if (!recruiter) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!projectId) {
            return res.status(400).json({ success: false, message: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (String(project.recruiter) !== String(recruiter._id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to process payment for this project' });
        }

        if (project.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Payment has already been processed for this project' });
        }

        // Mark the project as completed and paid
        project.status = 'completed';
        project.paymentStatus = 'paid';
        project.submittedDate = project.submittedDate || new Date();
        await project.save();

        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        return res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            transactionId,
            project: {
                _id: project._id,
                status: project.status,
                paymentStatus: project.paymentStatus,
            }
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({ success: false, message: 'Server error while processing payment' });
    }
};


export const submitReview = async (req, res) => {
    try {
        const recruiter = req.user;
        const { projectId, studentId, rating, comment } = req.body;

        if (!recruiter) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!projectId || !studentId || !rating) {
            return res.status(400).json({ success: false, message: 'Project ID, student ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Verify the recruiter owns the project
        const project = await Project.findById(projectId);
        if (!project || String(project.recruiter) !== String(recruiter._id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to review for this project' });
        }

        // Import Review model dynamically to avoid circular deps at top
        const { default: Review } = await import('../models/Review.js');
        const { default: Student } = await import('../models/Student.js');

        // Upsert: one review per recruiter per student per project
        let review = await Review.findOne({ recruiterId: recruiter._id, studentId });

        if (review) {
            review.rating = rating;
            review.comment = comment || review.comment;
            await review.save();
        } else {
            review = new Review({
                recruiterId: recruiter._id,
                studentId,
                rating,
                comment: comment || '',
            });
            await review.save();
        }

        // Recalculate the student's average rating
        const allReviews = await Review.find({ studentId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Student.findByIdAndUpdate(studentId, {
            rating: Math.round(avgRating * 10) / 10,
        });

        return res.status(200).json({ success: true, message: 'Review submitted successfully', review });
    } catch (error) {
        console.error('Error submitting review:', error);
        return res.status(500).json({ success: false, message: 'Server error while submitting review' });
    }
};


export const getStudentReviews = async (req, res) => {
    try {
        const recruiter = req.user;
        const { studentId } = req.params;

        if (!recruiter) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Student ID is required' });
        }

        const { default: Review } = await import('../models/Review.js');

        const reviews = await Review.find({ studentId })
            .populate('recruiterId', 'name companyName companyLogo')
            .sort({ createdAt: -1 })
            .lean();

        // Enrich each review with the project that was completed between this recruiter & student
        const enriched = await Promise.all(
            reviews.map(async (review) => {
                // Find an assigned application for this recruiter's projects & this student
                const assignedApp = await Application.findOne({ studentId })
                    .populate({
                        path: 'projectId',
                        match: { recruiter: review.recruiterId._id, status: 'completed' },
                        select: 'title budget deadline updatedAt'
                    })
                    .lean();

                const project = assignedApp?.projectId || null;

                return {
                    id: review._id,
                    rating: review.rating,
                    comment: review.comment || '',
                    date: new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                    companyName: review.recruiterId?.companyName || review.recruiterId?.name || 'Client',
                    companyLogo: review.recruiterId?.companyLogo || null,
                    clientName: review.recruiterId?.name || 'Client',
                    budget: project?.budget || null,
                };
            })
        );

        // Calculate average rating
        const avg = enriched.length
            ? Math.round((enriched.reduce((s, r) => s + r.rating, 0) / enriched.length) * 10) / 10
            : 0;

        return res.status(200).json({ success: true, reviews: enriched, averageRating: avg });
    } catch (error) {
        console.error('Error fetching student reviews:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching student reviews' });
    }
};


