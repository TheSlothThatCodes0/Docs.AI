import { faFloppyDisk, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AutoSave from './AutoSave';

export default function ShareAndProfile({ handleSave, onAutoSaveChange }) {
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
        <AutoSave onAutoSaveChange={onAutoSaveChange} />
        <button
          type="button"
          className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded-lg shadow-sm transition duration-150 ease-in-out flex items-center justify-center ml-4 mr-10"
          onClick={handleSaveWithAuth}
        >
          <FontAwesomeIcon icon={faFloppyDisk} className="h-4 w-4 mr-2" />
          Save
        </button>
        <div className="relative">
          <button
            type="button"
            className="p-0 rounded-full h-10 w-10 flex items-center justify-center overflow-hidden shadow-md"
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