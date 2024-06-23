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
      if (user) {
        await setDoc(doc(db, 'Users', user.uid), {
          email: user.email,
          firstName: user.displayName,
          photo: user.photoURL,
          lastName: '',
        });
        toast.success('User logged in Successfully', {
          position: 'top-center',
        });
        navigate('/editor'); // Navigate to the text editor component after login
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
