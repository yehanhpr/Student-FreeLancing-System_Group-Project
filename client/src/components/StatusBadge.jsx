import React from 'react'

const StatusBadge = ({ status }) => {

    const variants = {
        'open': { color: 'bg-blue-100 text-blue-700', label: 'Open' },
        'applied': { color: 'bg-purple-100 text-purple-700', label: 'Applied' },
        'nda-sent': { color: 'bg-yellow-100 text-yellow-700', label: 'NDA Sent' },
        'nda-accepted': { color: 'bg-green-100 text-green-700', label: 'NDA Accepted' },
        'in-progress': { color: 'bg-orange-100 text-orange-700', label: 'In Progress' },
        'completed': { color: 'bg-green-100 text-green-700', label: 'Completed' },
        'rejected': { color: 'bg-red-100 text-red-700', label: 'Rejected' },
        'pending': { color: 'bg-gray-100 text-gray-700', label: 'Pending' },
        'approved': { color: 'bg-green-100 text-green-700', label: 'Approved' },
        'revision-requested': { color: 'bg-yellow-100 text-yellow-700', label: 'Revision Requested' }
    };

    const { color, label } = variants[status] || variants['pending'];

    return (
        <span className={`px-3 py-1 rounded-full inline-flex items-center gap-1.5 text-sm ${color}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {label}
        </span>
    )
}

export default StatusBadge