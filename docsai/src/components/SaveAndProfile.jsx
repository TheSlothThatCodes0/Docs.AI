import { faFloppyDisk, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShareAndProfile({handleSave}) {
  const [showLogout, setShowLogout] = useState(false);
  const profilePicUrl = localStorage.getItem('userProfilePicUrl');
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSaveWithAuth = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        handleSave();
      } else {
        console.log('User is not authenticated.');
        // Redirect to sign-in page or show a sign-in prompt
        navigate('/login');
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userProfilePicUrl');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
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
            onClick={() => setShowLogout(!showLogout)}
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
          {showLogout && (
            <button
              onClick={handleLogout}
              className="absolute right-0 mt-2 bg-white shadow-md p-2 rounded-md flex items-center text-sm"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}