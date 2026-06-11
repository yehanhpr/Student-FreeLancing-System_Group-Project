import React, { useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, Brain, Briefcase, BriefcaseBusiness, ChevronRight, Code, DollarSign, Palette, Search, Smartphone, Star, TrendingUp, Users } from 'lucide-react'
import ProjectCard from './ProjectCard';
import { useNavigate } from 'react-router-dom';
import heroImg2 from '../assets/heroImg2.jpg';
import gsap from 'gsap';
import TestimonialCard from './TestimonialCard';

const Hero = () => {

    const navigate = useNavigate();

    const steps = [
        { title: 'Create Profile', description: 'Sign up as a student or project owner' },
        { title: 'Browse/Post Projects', description: 'Students find projects, owners post opportunities' },
        { title: 'Apply & Connect', description: 'Submit applications with CV and project plans' },
        { title: 'Get Paid', description: 'Complete work and receive payment securely' }
    ];

    const categories = [
        {
            icon: Code,
            name: 'Web Development',
            count: 245,
            color: 'bg-blue-50 text-blue-600'
        },
        {
            icon: Brain,
            name: 'Machine Learning',
            count: 128,
            color: 'bg-purple-50 text-purple-600'
        },
        {
            icon: Palette,
            name: 'UI/UX Design',
            count: 189,
            color: 'bg-pink-50 text-pink-600'
        },
        {
            icon: Smartphone,
            name: 'Mobile Development',
            count: 156,
            color: 'bg-green-50 text-green-600'
        },
        {
            icon: TrendingUp,
            name: 'Data Analysis',
            count: 97,
            color: 'bg-orange-50 text-orange-600'
        },
        {
            icon: Briefcase,
            name: 'Content Writing',
            count: 134,
            color: 'bg-yellow-50 text-yellow-600'
        }
    ];

    const latestProjects = [
        {
            id: 1,
            title: 'E-commerce Website Development',
            description: 'Build a modern, responsive e-commerce platform with React and Node.js. Includes product catalog, shopping cart, and payment integration.',
            budget: 850,
            deadline: '2 weeks',
            category: 'Web Development',
            skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            ownerRating: 4.8,
            applicants: 12
        },
        {
            id: 2,
            title: 'Mobile App UI/UX Design',
            description: 'Design modern, user-friendly interfaces for a fitness tracking mobile app. Need wireframes, mockups, and interactive prototypes.',
            budget: 600,
            deadline: '10 days',
            category: 'UI/UX Design',
            skills: ['Figma', 'Adobe XD', 'UI Design', 'Prototyping'],
            ownerRating: 4.9,
            applicants: 8
        },
        {
            id: 3,
            title: 'Machine Learning Model for Price Prediction',
            description: 'Develop an ML model to predict real estate prices. Need data preprocessing, model training, and API deployment.',
            budget: 950,
            deadline: '3 weeks',
            category: 'Machine Learning',
            skills: ['Python', 'TensorFlow', 'scikit-learn', 'Flask'],
            ownerRating: 4.7,
            applicants: 15
        },
        {
            id: 4,
            title: 'iOS App Development',
            description: 'Create a social networking iOS app with real-time messaging, user profiles, and media sharing capabilities.',
            budget: 1200,
            deadline: '4 weeks',
            category: 'Mobile Development',
            skills: ['Swift', 'SwiftUI', 'Firebase', 'REST API'],
            ownerRating: 4.9,
            applicants: 10
        },
        {
            id: 5,
            title: 'Business Dashboard with Data Visualization',
            description: 'Build an interactive analytics dashboard with charts, graphs, and real-time data updates for business metrics.',
            budget: 700,
            deadline: '2 weeks',
            category: 'Data Analysis',
            skills: ['React', 'D3.js', 'Python', 'SQL'],
            ownerRating: 4.6,
            applicants: 14
        },
        {
            id: 6,
            title: 'Brand Identity & Logo Design',
            description: 'Create a complete brand identity package including logo, color palette, typography, and brand guidelines.',
            budget: 450,
            deadline: '1 week',
            category: 'UI/UX Design',
            skills: ['Illustrator', 'Photoshop', 'Brand Design'],
            ownerRating: 4.8,
            applicants: 20
        }
    ];

    const testimonials = [
        {
            name: 'Sarah Chen',
            role: 'CS Student, MIT',
            image: '👩‍💻',
            text: 'I earned $3,500 last semester working on real projects. Amazing experience!',
            rate: 5
        },
        {
            name: 'Mike Johnson',
            role: 'Startup Founder',
            image: '👨‍💼',
            text: 'Found talented students who delivered quality work at reasonable rates.',
            rate: 4.5
        },
        {
            name: 'Emma Davis',
            role: 'Design Student, UCLA',
            image: '👩‍🎨',
            text: 'Built my portfolio while earning money. Best platform for student freelancers!',
            rate: 4.7
        },
        {
            name: 'Sarah Chen',
            role: 'CS Student, MIT',
            image: '👩‍💻',
            text: 'I earned $3,500 last semester working on real projects. Amazing experience!',
            rate: 5
        },
        {
            name: 'Mike Johnson',
            role: 'Startup Founder',
            image: '👨‍💼',
            text: 'Found talented students who delivered quality work at reasonable rates.',
            rate: 4.5
        },
        {
            name: 'Emma Davis',
            role: 'Design Student, UCLA',
            image: '👩‍🎨',
            text: 'Built my portfolio while earning money. Best platform for student freelancers!',
            rate: 4.7
        },
        {
            name: 'Sarah Chen',
            role: 'CS Student, MIT',
            image: '👩‍💻',
            text: 'I earned $3,500 last semester working on real projects. Amazing experience!',
            rate: 5
        },
        {
            name: 'Mike Johnson',
            role: 'Startup Founder',
            image: '👨‍💼',
            text: 'Found talented students who delivered quality work at reasonable rates.',
            rate: 4.5
        },
        {
            name: 'Emma Davis',
            role: 'Design Student, UCLA',
            image: '👩‍🎨',
            text: 'Built my portfolio while earning money. Best platform for student freelancers!',
            rate: 4.7
        },
        {
            name: 'Sarah Chen',
            role: 'CS Student, MIT',
            image: '👩‍💻',
            text: 'I earned $3,500 last semester working on real projects. Amazing experience!',
            rate: 5
        },
        {
            name: 'Mike Johnson',
            role: 'Startup Founder',
            image: '👨‍💼',
            text: 'Found talented students who delivered quality work at reasonable rates.',
            rate: 4.5
        },
        {
            name: 'Emma Davis',
            role: 'Design Student, UCLA',
            image: '👩‍🎨',
            text: 'Built my portfolio while earning money. Best platform for student freelancers!',
            rate: 4.7
        }
    ];

    const firstRow = testimonials.slice(0, 3);
    const secondRow = testimonials.slice(3, 6);

    const row1Ref = useRef(null);
    const row2Ref = useRef(null);

    useEffect(() => {
        const row1 = row1Ref.current;
        const row2 = row2Ref.current;

        const row1Width = row1.scrollWidth / 2;
        const row2Width = row2.scrollWidth / 2;

        // ROW 1 → RIGHT
        gsap.fromTo(
            row1,
            { x: 0 },
            {
                x: row1Width,
                duration: 30,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: (x) => `${parseFloat(x) % row1Width}px`
                }
            }
        );

        // ROW 2 → LEFT
        gsap.fromTo(
            row2,
            { x: 0 },
            {
                x: -row2Width,
                duration: 30,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: (x) => {
                        const value = parseFloat(x) % row2Width;
                        return `${value - row2Width}px`;
                    }
                }
            }
        );
    }, []);




    return (
        <div className='container px-20 my-10 mx-auto'>
            
            <div data-aos="fade-up" className='py-3'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-16'>
                    {steps.map((step, index) => (
                        <div key={index} className='bg-white p-6 rounded-lg text-center'>
                            <div className='text-white bg-primary rounded-full w-12 h-12 flex justify-center items-center  font-bold mb-4 mx-auto'>{index + 1}</div>
                            <h3 className='text-2xl font-semibold mb-2'>{step.title}</h3>
                            <p className='text-gray-600'>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div data-aos="fade-up" className='py-20 px-4 mt-30 bg-background rounded-xl'>
                <div className='flex justify-between px-2'>
                    <div>
                        <h2 className='font-semibold text-4xl'>Latest Projects</h2>
                        <p className='text-text-secondary mt-3'>Fresh opportunities posted by verified project owners</p>
                    </div>
                    <button
                        className='group flex text-primary gap-2 items-center border-2 text-center my-auto px-5 py-3 rounded-xl border-primary hover:bg-primary hover:text-white transition-all duration-500'>
                        View All
                        <ArrowRight className='text-primary hover:text-white group-hover:text-white transition-all duration-500' />
                    </button>
                </div>

                <div className='grid grid-cols-3 gap-10 mt-15'>
                    {latestProjects.map((project, id) => (
                        <ProjectCard key={id} project={project} />
                    ))}
                </div>
            </div>

             <div data-aos="fade-up" className='mt-20'>
                <div className='text-center'>
                    <h3 className='text-4xl font-semibold'>Browse by Category</h3>
                    <p className='text-text-secondary'>Find projects in your area of expertise</p>
                </div>
                <div className='mt-10'>
                    <div className='grid grid-cols-3 gap-10 mt-6'>
                        {categories.map((category, index) => (
                            <div key={index} className='border-2 border-border p-6 shadow rounded-2xl hover:border-primary hover:shadow-lg transition-all duration-300'>
                                <div className='flex items-center justify-between'>
                                    <div className={`p-5 rounded-xl mr-4 ${category.color} `}>
                                        <category.icon size={30} />
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-text-secondary group-hover:text-primary transition-colors" />
                                </div>
                                <h2 className='font-semibold text-2xl mt-2'>{category.name}</h2>
                                <p className="text-text-secondary mt-2">{category.count} projects available</p>

                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <div data-aos="fade-up" className='mt-16 bg-linear-to-br border-2 border-purple-100 from-blue-50 to-purple-50 rounded-2xl p-15'>
                <div className='flex justify-center items-center gap-8 flex-wrap'>
                    <div className='text-center'>
                        <div className='rounded-full bg-white w-24 h-24 flex justify-center items-center shadow-md mx-auto mb-2'>
                            <Users className='inline-block text-primary' size={50} />
                        </div>
                        <p>Students</p>
                    </div>
                    <div className="text-4xl text-primary">⟷</div>
                    <div className='text-center'>
                        <div className='rounded-full bg-white w-24 h-24 flex justify-center items-center shadow-md mx-auto mb-2'>
                            <Briefcase className='inline-block text-accent' size={50} />
                        </div>
                        <p>Employers</p>
                    </div>
                </div>
                <div>
                    <div className='text-center mt-10 flex justify-center items-center gap-6 flex-wrap'>
                        <button className='bg-primary text-white px-6 py-4 rounded-lg font-medium flex items-center gap-2'>
                            I'm a Student
                            <ArrowRight className='inline-block' />
                        </button>
                        <button className='bg-white text-primary border px-6 py-4 rounded-lg font-medium flex items-center gap-2'>
                            I'm a Project Owner
                            <ArrowRight className='inline-block' />
                        </button>
                    </div>
                </div>
            </div>

            
            <div data-aos="fade-up" className='mt-20 overflow-hidden'>
                <h1 className='text-center my-20 text-4xl font-semibold'>What Our Users Say</h1>
                <div className="overflow-hidden py-2">
                    <div ref={row1Ref} className="flex gap-10">
                        {[...firstRow, ...firstRow].map((t, i) => (
                            <TestimonialCard key={`r1-${i}`} testimonial={t} />
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden mt-10 py-2">
                    <div ref={row2Ref} className="flex gap-10">
                        {[...secondRow, ...secondRow].map((t, i) => (
                            <TestimonialCard key={`r2-${i}`} testimonial={t} />
                        ))}
                    </div>
                </div>

            </div>

            <div data-aos="fade-up" className='mt-20 relative'>
                <div className='p-30 rounded-xl z-50 bg-cover bg-center' style={{ backgroundImage: `url(${heroImg2})` }}>
                    <div className='absolute inset-0 bg-black z-40 rounded-xl opacity-60' />
                    <div className='relative z-60 text-center'>
                        <h1 className='text-white text-4xl font-semibold'>Ready to Get Started?</h1>
                        <p className='text-white my-5 text-lg'>Join thousands of students and project owners already using <br /> StudentFreelance</p>
                        <button className='bg-primary text-white p-5 rounded-2xl cursor-pointer hover:bg-blue-600'>Create Free Account</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero