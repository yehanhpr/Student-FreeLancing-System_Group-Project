import { Briefcase, BriefcaseBusiness, DollarSign, Search, Star, Users } from 'lucide-react'
import React from 'react'
import heroImg1 from '../assets/heroImg1.jpg';

const HeroBanner = () => {

    const stats = [
        { icon: Users, value: '10,000+', label: 'Active Students' },
        { icon: Briefcase, value: '5,000+', label: 'Projects Posted' },
        { icon: DollarSign, value: '$2M+', label: 'Paid to Students' },
        { icon: Star, value: '4.9/5', label: 'Average Rating' }
    ];

    return (
        <div data-aos="fade-up" className='relative text-white p-20 flex flex-col items-center justify-center min-h-screen mb-10 text-center bg-cover bg-bottom-left' style={{ backgroundImage: `url(${heroImg1})` }}>
            <div className='absolute inset-0 bg-linear-to-r from-blue-900 via-primary  to-transparent' />
            <div className='relative z-10'>
                <h2 className='text-5xl/13 mb-4 font-semibold'>Connect Students With,  <br /> <span className='bg-clip-text bg-linear-to-t  from-blue-600 to-blue-100 '>Real-World Projects</span></h2>
                <p className='text-md font-light mb-8'>The premier platform matching university students with paid freelance micro-projects.<br /> Build your portfolio, earn money, and gain real-world experience.</p>

                <div className='bg-white rounded-2xl px-3 py-2 text-black flex justify-between items-center w-full max-w-2xl mx-auto'>
                    <div className='flex items-center'>
                        <Search className='inline-block mr-2 opacity-35' />
                        <input type="text" placeholder='Search For Project' className='bg-transparent border-gray-300 focus:outline-none focus:border-blue-600' />
                    </div>
                    <div className='ml-4 flex items-center'>
                        <BriefcaseBusiness className='inline-block mr-2 opacity-35' />
                        <input type="text" placeholder='Skill' className='bg-transparent border-gray-300 focus:outline-none focus:border-blue-600' />
                    </div>
                    <button className='bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium'>Search</button>
                </div>

                <div>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-10 mt-9'>
                        {stats.map((stat, index) => (
                            <div key={index} className=' rounded-lg text-center'>
                                <stat.icon className='text-white mx-auto mb-4' size={40} />
                                <h3 className='text-2xl text-black font-semibold mb-2'>{stat.value}</h3>
                                <p className='text-white'>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroBanner