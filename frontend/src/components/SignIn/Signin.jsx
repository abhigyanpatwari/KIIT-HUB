import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/style.css";
import { useAuth } from "../../Contexts/AuthContext";
import { motion } from 'framer-motion';
import { API_URL, apiCall } from '../../services/api';

// Use the API_URL from our centralized service
console.log("Signin component using API URL:", API_URL);

const Signin = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser, isloggedin, setIsloggedin } = useAuth();
  const [email_id, setEmail_id] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [registerStatus, setRegisterStatus] = useState({ type: "", message: "" });
  const [isRegistering, setIsRegistering] = useState(false);

  // New states for OTP
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginStatus({ type: "", message: "" });
    
    try {
      console.log('Attempting login with:', { email_id });
      
      if (!email_id || !password) {
        setLoginStatus({ type: "error", message: "Please enter both email and password" });
        setIsLoading(false);
        return;
      }

      const res = await apiCall('/signin', {
        method: "POST",
        body: JSON.stringify({
          email_id,
          password,
        }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.status === 200 && data.user) {
        console.log("LOGIN SUCCESS - User ID:", data.user._id);
        
        // Verify the session was created properly
        try {
          console.log("Verifying session was created...");
          const sessionCheck = await apiCall('/current-user', {
            method: "GET"
          });
          
          const sessionData = await sessionCheck.json();
          console.log("Session check response:", sessionData);
          
          if (sessionData.success && sessionData.user) {
            console.log("Session verified successfully, using session user data");
            setAuthUser(sessionData.user);
          } else {
            console.log("Session verification returned incomplete data, using login response data");
            setAuthUser(data.user);
          }
        } catch (sessionError) {
          console.error("Error checking session:", sessionError);
          console.log("Using login response data due to session check error");
          setAuthUser(data.user);
        }
        
        // Set login state
        setIsloggedin(true);
        console.log("Login state updated");
        
        // Show success message in the form
        setLoginStatus({ 
          type: "success", 
          message: "Login successful! Redirecting to your profile..."
        });
        
        // Store user ID in localStorage
        localStorage.setItem('userId', data.user._id);
        
        // Navigate to profile page after a short delay
        setTimeout(() => {
          navigate("/profile", { replace: true });
        }, 1500);
        
      } else {
        setLoginStatus({ 
          type: "error", 
          message: data.message || "Login failed. Please check your credentials."
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginStatus({ 
        type: "error", 
        message: "Network error. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [user, setUser] = useState({
    name: "",
    email_id: "",
    password: "",
    c_password: "",
  });
  let name, value;
  const handleInputs = (e) => {
    // console.log(e);
    name = e.target.name;
    value = e.target.value;
    setUser({ ...user, [name]: value });
  };

  const [isContainerActive, setIsContainerActive] = React.useState(false);
  const signUpButton = () => {
    setIsContainerActive(true);
  };
  const signInButton = () => {
    setIsContainerActive(false);
  };

  // New function to send OTP to the provided email
  const sendOTP = async (e) => {
    e.preventDefault();
    console.log("Send OTP button clicked");
    setIsRegistering(true);
    setRegisterStatus({ type: "", message: "" });
    
    // Validate email address
    if (!user.email_id) {
      setRegisterStatus({ type: "error", message: "Please enter your email address" });
      setIsRegistering(false);
      return;
    }
    
    const domain = user.email_id.substring(user.email_id.lastIndexOf("@") + 1);
    if (domain !== "kiit.ac.in") {
      setRegisterStatus({ type: "error", message: "Only KIIT institutional email ID's allowed." });
      setIsRegistering(false);
      return;
    }
    
    try {
      const res = await apiCall('/otp/send-otp', {
        method: "POST",
        body: JSON.stringify({ email_id: user.email_id }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(e => ({ message: "Server error occurred" }));
        throw new Error(errorData.message || "Error sending OTP");
      }
      
      const data = await res.json();
      setRegisterStatus({ type: "success", message: "OTP sent to your email." });
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setRegisterStatus({ type: "error", message: error.message || "Error sending OTP. Please try again." });
    } finally {
      setIsRegistering(false);
    }
  };

  // Modified postData to verify OTP before registration
  const postData = async (e) => {
    e.preventDefault();
    console.log("Signup button clicked");
    setIsRegistering(true);
    setRegisterStatus({ type: "", message: "" });

    const { name, email_id, password, c_password } = user;
    console.log("Form data:", { name, email_id, password, c_password, otp });

    // Validate email domain
    if (!email_id.endsWith("@kiit.ac.in")) {
      setRegisterStatus({ type: "error", message: "Only KIIT institutional email ID's allowed." });
      setIsRegistering(false);
      return;
    }

    // Validate password match
    if (password !== c_password) {
      setRegisterStatus({ type: "error", message: "Passwords do not match" });
      setIsRegistering(false);
      return;
    }

    // Check if OTP was sent
    if (!otpSent) {
      setRegisterStatus({ type: "error", message: "Please send OTP first." });
      setIsRegistering(false);
      return;
    }

    try {
      // First verify OTP
      const verifyRes = await apiCall('/otp/verify-otp', {
        method: "POST",
        body: JSON.stringify({ email_id, otp }),
      });

      console.log("Response status:", verifyRes.status);
      const verifyData = await verifyRes.json();
      console.log("Response data:", verifyData);

      if (!verifyRes.ok) {
        throw new Error(verifyData.message || "Registration failed");
      }

      // Registration successful
      setRegisterStatus({ 
        type: "success", 
        message: "Registration successful! Redirecting to your profile..." 
      });
      console.log("Registration Successful");
      
      if (verifyData.user) {
        // Verify the session was created properly
        try {
          console.log("Verifying session after registration...");
          const sessionCheck = await apiCall('/current-user', {
            method: "GET"
          });
          
          const sessionData = await sessionCheck.json();
          console.log("Session check after registration:", sessionData);
          
          if (sessionData.success && sessionData.user) {
            console.log("Session created successfully, using session user data");
            setAuthUser(sessionData.user);
          } else {
            console.log("Session verification failed, using registration response data");
            setAuthUser(verifyData.user);
          }
        } catch (sessionError) {
          console.error("Error checking session after registration:", sessionError);
          console.log("Using registration response data due to session check error");
          setAuthUser(verifyData.user);
        }
        
        // Set login state
        setIsloggedin(true);
        console.log("Login state updated after registration");
        
        // Store user ID in localStorage
        localStorage.setItem('userId', verifyData.user._id);
        
        // Navigate to profile page after a delay
        setTimeout(() => {
          setIsContainerActive(false);
          navigate("/profile", { replace: true });
        }, 1500);
      } else {
        console.log("Registration successful but no user data returned");
        // Show success message and switch to signin form after delay
        setRegisterStatus({ 
          type: "success", 
          message: "Registration successful! Please sign in now." 
        });
        
        setTimeout(() => {
          // Close the signup form
          setIsContainerActive(false);
          // Reset the registration form
          setUser({
            name: "",
            email_id: "",
            password: "",
            c_password: "",
          });
          setOtp("");
          setOtpSent(false);
          setRegisterStatus({ type: "", message: "" });
        }, 1500);
      }
      
    } catch (error) {
      console.error("Registration error:", error);
      setRegisterStatus({ 
        type: "error", 
        message: error.message || "Registration failed. Please try again." 
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="tody">
      <div
        id="container"
        className={`container ${isContainerActive ? "right-panel-active" : ""}`}
      >
        <div className="form-container sign-up-container">
          <form onSubmit={postData}>
            <div className="H1">Create Account</div>
            <span id="Span">
              Use your @kiit.ac.in email for registration
            </span>
            
            {/* Registration status message */}
            {registerStatus.message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.3 }
                }}
                className={`w-full p-3 rounded-lg text-sm font-medium mb-3 ${
                  registerStatus.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {registerStatus.type === "success" ? (
                  <div className="flex items-center justify-center">
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-2 text-green-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: 1,
                        transition: { 
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: 0.2
                        }
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                    <span>{registerStatus.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{registerStatus.message}</span>
                  </div>
                )}
              </motion.div>
            )}
            
            <input
              type="text"
              name="name"
              value={user.name}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={handleInputs}
              placeholder="Name"
              required
              disabled={isRegistering}
            />
            <input
              type="email"
              name="email_id"
              value={user.email_id}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={handleInputs}
              placeholder="Email"
              required
              disabled={isRegistering || otpSent}
            />
            {/* Button to send OTP if not already sent */}
            {!otpSent && (
              <button type="button" className="butt" onClick={sendOTP} disabled={isRegistering}>
                Send OTP
              </button>
            )}
            {/* If OTP is sent, show the OTP input field */}
            {otpSent && (
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
                disabled={isRegistering}
              />
            )}
            <input
              type="password"
              name="password"
              value={user.password}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={handleInputs}
              placeholder="Password"
              required
              disabled={isRegistering}
            />
            <input
              type="password"
              name="c_password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={user.c_password}
              onChange={handleInputs}
              placeholder="Confirm Password"
              required
              disabled={isRegistering}
            />
            <button type="submit" className="butt" disabled={isRegistering}>
              {isRegistering ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing up...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form method="POST" action="#" onSubmit={loginUser}>
            <div className="H1">Sign in</div>
            <span id="Span" className="pb-5">
              Use your @kiit.ac.in account
            </span>
            
            {/* Status message */}
            {loginStatus.message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.3 }
                }}
                className={`w-full p-3 rounded-lg text-sm font-medium mb-3 ${
                  loginStatus.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {loginStatus.type === "success" ? (
                  <div className="flex items-center justify-center">
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-2 text-green-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: 1,
                        transition: { 
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: 0.2
                        }
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                    <span>{loginStatus.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{loginStatus.message}</span>
                  </div>
                )}
              </motion.div>
            )}
            
            <input
              type="email"
              name="email_id"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={email_id}
              onChange={(e) => setEmail_id(e.target.value)}
              placeholder="Email"
              required
              disabled={isLoading}
            />
            <input
              type="password"
              name="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={isLoading}
            />
            <a id="A" href="#">
              Forgot your password?
            </a>
            <button
              type="submit"
              className="butt"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="H1">Welcome Back!</div>
              <p id="P">
                To keep connected with us please login with your personal info
              </p>
              <button
                className="ghost butt"
                id="signIn"
                onClick={signInButton}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <div className="H1">Hello, Students!</div>
              <p id="P">Enter your personal details and start journey with us</p>
              <button
                className="ghost butt"
                id="signUp"
                onClick={signUpButton}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
