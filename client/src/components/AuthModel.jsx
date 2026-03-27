import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import Auth from '../pages/Auth'
import { FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

function AuthModel({ onclose }) {  
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()   

  useEffect(() => {
    if (userData) {
      onclose()                 
      navigate("/dashboard")     
    }
  }, [userData])                 

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
      
      <div className='relative w-full max-w-md'>

        {/* Close Button */}
        <button 
          onClick={onclose} 
          className='absolute -top-10 right-0 text-white hover:text-red-400 text-xl cursor-pointer'
        >
          <FaTimes size={22} />
        </button>

        {/* Auth Component */}
        <Auth isModel={true} />

      </div>

    </div>
  )
}

export default AuthModel