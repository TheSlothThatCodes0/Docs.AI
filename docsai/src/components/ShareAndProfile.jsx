import { faShare, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export default function ShareAndProfile() {
  const profilePicUrl = localStorage.getItem('userProfilePicUrl');

  return (
    <div className="fixed top-4 right-7">
      <div className="flex flex-row items-center">
        <button
          type="button"
          className="bg-gray-50 shadow p-2 rounded-2xl mr-5 flex items-center"
        >
          <FontAwesomeIcon icon={faShare} className="h-5 mr-2" />
          Share
        </button>
        <div className="relative">
          <button
            type="button"
            className="p-0 rounded-full h-12 w-12 flex items-center justify-center overflow-hidden"
          >
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt="User Profile"
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <div className="bg-gray-50 shadow rounded-full h-full w-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-gray-400 h-6 w-6" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}