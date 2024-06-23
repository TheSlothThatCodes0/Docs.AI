import { faShare, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

export default function ShareAndProfile() {
  return (
    <div className='fixed top-4 right-7'>
        <div className="flex felx-row justify-between">
            <button type='button' className='bg-gray-50 shadow p-2 rounded-2xl mr-5'>
                <FontAwesomeIcon icon = {faShare} className='h-5 mr-2'/>
                Share
            </button>
            <button type='button' className='bg-gray-50 shadow p-2 rounded-full h-12 w-12 flex items-center justify-center'>
                <FontAwesomeIcon icon = {faUser} className='h-6'/>
            </button>
        </div>
    </div>
  )
}
