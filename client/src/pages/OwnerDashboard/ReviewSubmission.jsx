import { ArrowLeft, CheckCircle, Download, FileText, Star, XCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const ReviewSubmission = () => {

    const { studentId } = useParams();
    const navigate = useNavigate();

    const projects = [
        {
            id: 1,
            title: 'React Dashboard Development',
            category: 'Web Development',
            budget: 800,
            applicants: 8,
            status: 'in-progress',
            deadline: '2024-12-31',
            createdDate: '2024-11-01',
            assignedTo: 'Alex Johnson'
        },
        {
            id: 2,
            title: 'Mobile App UI Design',
            category: 'UI/UX Design',
            budget: 500,
            applicants: 12,
            status: 'nda-sent',
            deadline: '2024-12-20',
            createdDate: '2024-11-05',
            assignedTo: null
        },
        {
            id: 3,
            title: 'Content Writing - Tech Blog',
            category: 'Content Writing',
            budget: 200,
            applicants: 5,
            status: 'applied',
            deadline: '2024-12-15',
            createdDate: '2024-11-10',
            assignedTo: null
        },
        {
            id: 4,
            title: 'Python Data Analysis Script',
            category: 'Data Analysis',
            budget: 400,
            applicants: 3,
            status: 'open',
            deadline: '2024-12-25',
            createdDate: '2024-11-12',
            assignedTo: null
        },
        {
            id: 5,
            title: 'E-commerce Website Landing Page',
            category: 'Web Development',
            budget: 600,
            applicants: 0,
            status: 'open',
            deadline: '2025-01-10',
            createdDate: '2024-11-15',
            assignedTo: null
        },
        {
            id: 6,
            title: 'Social Media Marketing Campaign',
            category: 'Marketing',
            budget: 350,
            applicants: 7,
            status: 'completed',
            deadline: '2024-11-20',
            createdDate: '2024-10-15',
            assignedTo: 'Sarah Chen'
        },
        {
            id: 7,
            title: 'Node.js API Development',
            category: 'Web Development',
            budget: 950,
            applicants: 4,
            status: 'submitted',
            deadline: '2024-12-28',
            createdDate: '2024-10-20',
            assignedTo: 'Mike Wilson',
            submittedDate: '2024-12-27'
        },
        {
            id: 8,
            title: 'Database Optimization Project',
            category: 'Data Analysis',
            budget: 700,
            applicants: 2,
            status: 'submitted',
            deadline: '2024-12-30',
            createdDate: '2024-10-25',
            assignedTo: 'Emily Davis',
            submittedDate: '2024-12-26'
        }
    ];

    const projectDetails = projects.find(
        p => p.assignedTo === studentId
    );

    console.log(projectDetails);
    

    return (
        <div>
            <div className='flex justify-between'>
                <div>
                    <h1 className='text-4xl font-bold mb-2'>Review Submission</h1>
                    <p className='text-text-secondary'>{projectDetails.title}</p>
                </div>
                <div>
                    <button
                        type='button'
                        className='text-primary flex items-center gap-2 border-2 border-primary py-1 px-3 rounded-xl hover:bg-primary hover:text-white transition-colors duration-300 cursor-pointer'
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className='w-4 h-4' />
                        Go Back
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-3 gap-5 mt-5'>
                <div className='col-span-2 rounded-2xl py-4 px-5 bg-white shadow-lg border border-border'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <div className='w-16 h-16 text-white rounded-full bg-primary flex items-center justify-center'>AJ</div>
                            <div>
                                <h4 className='text-2xl font-semibold'>{projectDetails.assignedTo}</h4>
                                <p className='text-sm text-text-secondary'>MIT</p>
                                <span className='flex items-center gap-1 text-yellow-500'><Star className='w-4 h-4 fill-current' />4.9</span>
                            </div>
                        </div>

                        <div>
                            <p className='text-green-500'>Submitted</p>
                            <p className='text-sm'>2 hours ago</p>
                        </div>
                    </div>

                    <h3 className='font-semibold mt-8 mb-3 text-lg'>Submitted Files</h3>

                    <div className='flex items-center justify-between border border-border px-3 py-5 rounded-xl'>
                        <div className='flex items-center gap-2'>
                            <div className='w-12 h-12 text-primary rounded-xl bg-blue-50 flex items-center justify-center'><FileText /></div>
                            <div>
                                <h4 className='font-semibold'>dashboard-project.zip</h4>
                                <p className='text-sm text-text-secondary'>ZIP Archive • 15.2 MB</p>
                            </div>
                        </div>

                        <button className='flex items-center gap-2 border-2 border-primary text-primary py-2 px-4 rounded-xl text-sm hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer'>
                            <Download className='w-4 h-4' />
                            Download
                        </button>
                    </div>

                    <div className='flex items-center justify-between border border-border px-3 py-5 rounded-xl mt-3'>
                        <div className='flex items-center gap-2'>
                            <div className='w-12 h-12 text-primary rounded-xl bg-blue-50 flex items-center justify-center'><FileText /></div>
                            <div>
                                <h4 className='font-semibold'>documentation.pdf</h4>
                                <p className='text-sm text-text-secondary'>PDF Document • 2.1 MB</p>
                            </div>
                        </div>

                        <button className='flex items-center gap-2 border-2 border-primary text-primary py-2 px-4 rounded-xl text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors duration-200'>
                            <Download className='w-4 h-4' />
                            Download
                        </button>
                    </div>

                    <div className='mt-8 border border-primary bg-blue-50 p-3 rounded-2xl'>
                        <h3 className='font-semibold text-lg'>Review Actions</h3>
                        <p className='mt-2 text-text-secondary text-sm'>Review the submitted work carefully. You can approve and release payment, request revisions, or reject the submission.</p>
                        <div className='mt-3 flex items-center gap-3'>
                            <button className='flex items-center gap-2 border-2 border-primary py-2 px-5 rounded-xl text-primary hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer'>
                                <XCircle className='w-4 h-4' />
                                Reject
                            </button>
                            <button className='flex items-center gap-2 border-2 border-primary py-2 px-5 rounded-xl text-white bg-primary hover:bg-blue-600 transition-colors duration-200 cursor-pointer'>
                                Request Changes
                            </button>
                            <button className='flex items-center gap-2 border-2 border-accent bg-accent text-white py-2 px-5 rounded-xl hover:bg-green-500 transition-colors duration-200 cursor-pointer'>
                                <CheckCircle className='w-4 h-4' />
                                Approve & Pay
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-span-1'>
                    <div className='text-center border border-green-500 bg-green-50 py-5 rounded-2xl'>
                        <p className='text-text-secondary'>Payment Amount</p>
                        <p className='font-semibold mt-2'>$800</p>
                    </div>
                    <p className='text-xs mt-1 text-red-500 text-center'>This amount will be released to the student upon approval.</p>
                    <div className='text-center border border-yellow-500 bg-yellow-50 py-5 rounded-2xl mt-5'>
                        <p className='font-semibold text-lg'>Important</p>
                        <p className='text-sm mt-2 text-secondary'>Once you approve this submission, the payment will be released and cannot be reversed.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReviewSubmission