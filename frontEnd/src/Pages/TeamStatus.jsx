// import React, { useEffect, useState } from 'react'
// import axios from 'axios'
// import { Link } from 'react-router-dom'

// function MyProjects() {
 
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)


//   return (
//     <div className='min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 flex items-center justify-center p-6'>
//       <div className='bg-gray-100/90 rounded-lg p-6 w-full max-w-3xl shadow-lg'>
//         <div className='flex items-center justify-between mb-4'>
//           <h1 className='text-2xl font-bold text-indigo-700'>Your Team</h1>
//           <Link to='/' className='text-sm text-indigo-600 underline'>Back</Link>
//         </div>

//         {loading && (
//           <p className='text-sm text-gray-600'>Loading ...</p>
//         )}

//         {!loading && error && (
//           <p className='text-sm text-red-600'>{error}</p>
//         )}

//         {!loading && !error && projects.length === 0 && (
//           <div className='py-8 text-center'>
//             <p className='text-gray-700 mb-3'>Don't have any team yet.</p>
//           </div>
//         )}

//         {!loading && !error && projects.length > 0 && (
//           <ul className='space-y-3'>
//             {projects.map(proj => (
//               <li key={proj._id} className='bg-white rounded-lg p-4 shadow-sm flex items-center justify-between'>
//                 <div>
//                   <p className='font-semibold text-indigo-700'>{proj.title}</p>
//                   <p className='text-xs text-gray-500'>{proj.techStack?.slice(0, 8).join(', ')}</p>
//                 </div>
//                 <div className='text-sm text-gray-500'>
//                   {new Date(proj.createdAt).toLocaleDateString()}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   )
// }

// export default MyProjects



import React from 'react'

function TeamStatus() {
  return (
    <div className='flex items-center justify-center'>
      working on team status page
    </div>
  )
}

export default TeamStatus
