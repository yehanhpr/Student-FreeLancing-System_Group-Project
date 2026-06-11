import { ArrowLeft, Briefcase, CheckCircle, Clock, DollarSign, MapPin } from 'lucide-react';
import React, { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import ApplyModel from '../components/ApplyModel';
import Navbar2 from '../components/Navbar2';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ProjectDetail = () => {

    const { id } = useParams();
    const { user, token } = useContext(AppContext);

    const navigate = useNavigate();

    const { projects } = useContext(AppContext);

    const project = projects.find(item => item._id === id);

    const recruiterId = project?.recruiter?._id;

    const totalProjectsByRecruiter = projects.filter(proj => proj.recruiter._id === recruiterId).length;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleApplyClick = () => {
        if (!user && !token) {
            toast.error('You must login before applying for the project');
            setTimeout(() => {
                navigate('/auth?type=student&mode=login');
            }, 2000);
            return;
        }

        setIsModalOpen(true);
    };


    return (
        <>
            <Navbar2 />
            <div className='container px-20 mx-auto pt-20 pb-30 bg-background min-h-screen'>
                <h3 onClick={() => navigate('/')} className='flex items-center gap-2 text-text-secondary cursor-pointer mb-8'>
                    <ArrowLeft className='w-5 h-5' />
                    Back to projects
                </h3>

                <div className='grid grid-cols-3 gap-5'>
                    {project ? (
                        <>
                            <div className='col-span-2 bg-white border p-8 border-blue-200 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300'>
                                <h3 className='text-primary text-sm bg-blue-50 py-1 px-3 rounded-4xl inline-block'>{project.category}</h3>
                                <h1 className='text-4xl font-bold my-5'>{project.title}</h1>

                                <div className='flex gap-4 items-center'>
                                    <div className='flex items-center gap-2'>
                                        <DollarSign className='w-4 h-4 text-accent' />
                                        <span className='text-accent text-sm'>${project.budget}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Clock className='w-4 h-4 text-text-secondary' />
                                        <span className='text-secondary text-sm'>{new Date(project.deadline).toLocaleDateString()}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <MapPin className='w-4 h-4 text-text-secondary' />
                                        <span className='text-secondary text-sm'>{project.category}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Briefcase className='w-4 h-4 text-secondary' />
                                        <span className='text-secondary text-sm'>{project.applicants} applicants</span>
                                    </div>
                                </div>

                                <h3 className='font-semibold text-2xl mb-3 mt-7'>Project Description</h3>
                                <p className='text-text-secondary'>{project.description}</p>

                                <h3 className='font-semibold text-2xl mb-3 mt-7'>Required Skills</h3>
                                <div className='flex gap-2'>
                                    {project.technologies.map((technology, index) => (
                                        <span key={index} className='text-primary text-sm bg-blue-50 py-1 px-3 rounded-4xl inline-block'>{technology}</span>
                                    ))}
                                </div>

                                <h3 className='font-semibold text-2xl mb-3 mt-7'>Requirements</h3>
                                <ul className='space-y-2'>
                                    {project.requirements.map((req, index) => (
                                        <li key={index} className='flex items-start gap-2 text-text-secondary'>
                                            <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>

                                <h3 className='font-semibold text-2xl mb-3 mt-7'>Deliverables</h3>
                                <ul className='space-y-2'>
                                    {project.deliverables.map((deliverable, index) => (
                                        <li key={index} className='flex items-start gap-2 text-text-secondary'>
                                            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span>{deliverable}</span>
                                        </li>
                                    ))}
                                </ul>

                            </div>

                            <div className='col-span-1 '>
                                <div className='sticky top-34 bg-white border-2 border-blue-200 rounded-2xl p-8 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all'>
                                    <button
                                        onClick={handleApplyClick}
                                        className='bg-primary text-white py-4 w-full rounded-xl cursor-pointer'>
                                        Apply for this Project
                                    </button>

                                    <h3 className='text-xl font-semibold my-5'>Project Owner</h3>
                                    <div className='flex items-start gap-3 mb-4'>
                                        <div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shrink-0'>
                                            {project.recruiter.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h5 className='font-semibold'>{project.recruiter.name}</h5>
                                            <p className='text-text-secondary text-sm'>{project.recruiter.companyName}</p>
                                        </div>
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <span className='text-text-secondary text-sm'>Projects Posted</span>
                                        <span className='text-text-secondary text-sm'>{totalProjectsByRecruiter}</span>
                                    </div>

                                    <div className='flex justify-center'>
                                        <hr className='border-gray-200 my-6 w-full' />
                                    </div>

                                    <h3 className='text-xl font-semibold'>Project Details</h3>
                                    <div className='flex flex-col gap-4 mt-3'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-text-secondary text-sm'>Posted</span>
                                            <span className='text-text-secondary text-sm'>{new Date(project.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            <span className='text-text-secondary text-sm'>Budget</span>
                                            <span className='text-accent text-sm'>${project.budget}</span>
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            <span className='text-text-secondary text-sm'>Deadline</span>
                                            <span className='text-text-secondary text-sm'>{new Date(project.deadline).toLocaleDateString()}</span>
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            <span className='text-text-secondary text-sm'>Applicants</span>
                                            <span className='text-text-secondary text-sm'>{project.applicants}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </>
                    ) : (
                        <p>No projects found</p>
                    )}
                </div>
            </div>
            {project && token && (
                <ApplyModel
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    projecTitle={project.title}
                    projectId={project._id}
                    studentId={user?._id}
                    token={token}
                />
            )}
            <Footer />
        </>
    )
}

export default ProjectDetail
