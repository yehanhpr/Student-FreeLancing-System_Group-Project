import React from 'react'

const JobListing = () => {

    const categories = [
        "Frontend Development",
        "Backend Development",
        "Fullstack Development",
        "UI/UX Design",
        "Mobile App Development",
        "Data Science",
        "DevOps Engineering",
        "Project Management"
    ];

  return (
    <div className='container 2xl:px-20 mx-auto flex flex-col'>
        <div>
            <h2 className='text-2xl font-medium mb-4'>Job Categories</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {categories.map((category, index) => (
                    <div key={index} className='p-4 text-center border border-blue-600  rounded-lg shadow hover:shadow-lg transition duration-300'>
                        <h3 className='text-lg text-gray-700'>{category}</h3>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h2 className='text-2xl font-medium my-4 text-center'>Latest Job Listings</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {/* Example Job Card */}
                <div className='border border-gray-300 min-h-[300px] rounded-lg p-4 shadow hover:shadow-md transition duration-300'>
                    <h3 className='text-xl font-semibold mb-2'>Frontend Developer</h3>
                    <p className='text-gray-600 mb-4'>We are looking for a skilled frontend developer to join our team.</p>
                    <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300'>Apply Now</button>
                </div>
                {/* More Job Cards can be added here */}
                <div className='border border-gray-300 rounded-lg p-4 shadow hover:shadow-md transition duration-300'>
                    <h3 className='text-xl font-semibold mb-2'>Backend Developer</h3>
                    <p className='text-gray-600 mb-4'>Join our team as a backend developer and work on exciting projects.</p>
                    <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300'>Apply Now</button>
                </div>
                <div className='border border-gray-300 rounded-lg p-4 shadow hover:shadow-md transition duration-300'>
                    <h3 className='text-xl font-semibold mb-2'>UI/UX Designer</h3>
                    <p className='text-gray-600 mb-4'>We need a creative UI/UX designer to enhance our user experience.</p>
                    <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300'>Apply Now</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default JobListing