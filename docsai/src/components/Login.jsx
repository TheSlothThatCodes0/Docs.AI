import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "./Firebase";
import { toast } from "react-toastify";
import SignInwithGoogle from "./SignInWithGoogle";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in successfully");
      toast.success("Logged in successfully", {
        position: "top-center",
      });
      navigate("/editor");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
      <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">
            Log In
          </button>
        </form>
        <div className="auth-links">
          <Link to="/register" className="register-link">
            New user? Register here
          </Link>
        </div>
        <div className="divider">
          <span>or</span>
        </div>
        <SignInwithGoogle />
      </div>
    </div>
  );
}

export default Login;