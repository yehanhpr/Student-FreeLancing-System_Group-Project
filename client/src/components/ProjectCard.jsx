import { DollarSign, Star } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const ProjectCard = ({ project }) => {

  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/apply-project/${project._id}`)} className='bg-white border border-blue-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all group cursor-pointer'>
      <div className='flex items-center justify-between'>
        <h3 className='text-primary text-sm bg-blue-50 py-1 px-2 rounded-4xl'>{project.category}</h3>
        <div className='flex items-center gap-1'>
          <Star className='text-yellow-500 fill-current w-4 h-4' />
          <p className='text-yellow-500 text-sm'>{project.ownerRating}</p>
        </div>
      </div>

      <div>
        <h1 className='text-lg font-semibold my-3 transition-colors duration-300 group-hover:text-primary'>{project.title}</h1>
        <p className='text-sm text-gray-500 line-clamp-2'>{project.description}</p>
        <div className='flex items-center gap-2 my-4'>
          {project.technologies.slice(0, 3).map((technology, index) => (
            <span className='text-xs text-gray-500 bg-gray-200 py-1 px-2 rounded-sm' key={index}>{technology}</span>
          ))}
          {project.technologies.length > 3 && (
            <span className='text-xs text-gray-500 bg-gray-200 py-1 px-2 rounded-sm' >+{project.technologies.length - 3}</span>
          )}
        </div>
      </div>

      <hr className=' border-slate-200' />

      <div className='flex justify-between mt-5'>
        <div className='flex items-center gap-1'>
          <DollarSign className='w-4 h-4 text-accent' />
          <p className='text-blue-600 font-semibold'>${project.budget}</p>
          <p className='text-gray-500 text-sm ml-4'>{new Date(project.deadline).toLocaleDateString()}</p>
        </div>

        <p className='text-gray-500 text-sm'>{project.applicants} applicants</p>
      </div>
    </div>
  )
}

export default ProjectCard