import { faFloppyDisk, faShare, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React from 'react';

export default function ShareAndProfile({handleSave}) {
  const profilePicUrl = localStorage.getItem('userProfilePicUrl');
  const auth = getAuth();

  const handleSaveWithAuth = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        handleSave();
      } else {
        console.log('User is not authenticated.');
        // Redirect to sign-in page or show a sign-in prompt
      }
    });
  };

  return (
    <div className="fixed top-4 right-7">
      <div className="flex flex-row items-center">
        <button
          type="button"
          className="bg-gray-50 shadow-md p-3 rounded-2xl mr-5 flex items-center text-md"
          onClick={handleSaveWithAuth}
        >
          <FontAwesomeIcon icon={faFloppyDisk} className="h-6 mr-2" />
          Save
        </button>
        <div className="relative">
          <button
            type="button"
            className="p-0 rounded-full h-12 w-12 flex items-center justify-center overflow-hidden shadow-md"
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