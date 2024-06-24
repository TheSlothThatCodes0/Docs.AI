import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from './Firebase';
import { toast } from 'react-toastify';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../components/Auth.css';

function SignInWithGoogle() {
  const navigate = useNavigate();

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User: ", user);
      if (user) {
        console.log('User logged in Successfully');
        toast.success("User logged in Successfully", {
            position: "top-center",
          });
        window.location.href = '/editor';
      }
    } catch (error) {
      console.error('Error logging in with Google: ', error);
      toast.error('Failed to log in with Google', {
        position: 'bottom-center',
      });
    }
  };

  return (
    <div>
      <p className="continue-p">--Or continue with--</p>
      <div
        style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
        onClick={googleLogin}
      >
        <img src={require('../assets/google.png')} alt="Google Sign-In" width={"60%"} />
      </div>
    </div>
  );
}

export default SignInWithGoogle;
