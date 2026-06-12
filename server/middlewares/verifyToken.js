import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';
import Admin from '../models/Admin.js';

export const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const role = decoded.role;
        
        if (role === 'student') {
            req.user = await Student.findById(decoded.userId).select('-password');
        } else if (role === 'recruiter') {
            req.user = await Recruiter.findById(decoded.userId).select('-password');
        } else if (role === 'admin') {
            req.user = await Admin.findById(decoded.userId).select('-password');
        }
        
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'user not found' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}