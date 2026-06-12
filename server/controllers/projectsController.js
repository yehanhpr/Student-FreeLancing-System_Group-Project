import Recruiter from "../models/Recruiter.js";

export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Recruiter.find();

        return res.status(200).json({ success: true, companies });
        
    } catch (error) {
        console.error('Error fetching companies:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching companies' });
    }
}