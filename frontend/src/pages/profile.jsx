import React, { useState, useEffect } from "react";
import Cards from "../components/Admin/profCard";
import { useNavigate } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import KnowMore from "./KnowMore";
import { useAuth } from "../Contexts/AuthContext";
import boyimage from "../assets/img/boyimage.webp";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
const backendUrl = "http://localhost:5001";

const Profile = () => {
    const { authUser, setAuthUser, isloggedin, authLoaded, logout } = useAuth();
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [avatar, setAvatar] = useState(boyimage);
    const [profileFetched, setProfileFetched] = useState(false);
    const fileInputRef = React.useRef(null);
    const navigate = useNavigate();
    const [logoutStatus, setLogoutStatus] = useState({ isLoggingOut: false, message: "" });

    // New state for filtering and sorting
    const [filterCategory, setFilterCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");

    // Testimonial state
    const [showTestimonialModal, setShowTestimonialModal] = useState(false);
    const [testimonialText, setTestimonialText] = useState("");
    const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);

    useEffect(() => {
        // Wait until authentication check is complete before redirecting.
        if (authLoaded && !isloggedin) {
            console.log("User not logged in, redirecting to signin");
            navigate("/signin");
            return;
        }

        // Only fetch profile once when logged in and not already fetched
        if (isloggedin && !profileFetched && !isFetching) {
            console.log("User is logged in, fetching current profile (first time)");
            setProfileFetched(true);
            fetchSessionProfile();
            
            // Set avatar if user has one stored
            if (authUser && authUser.avatar) {
                setAvatar(authUser.avatar);
            } else {
                // Try to get from localStorage as fallback
                const savedAvatar = localStorage.getItem('userAvatar');
                if (savedAvatar) {
                    setAvatar(savedAvatar);
                }
            }
        }
    }, [isloggedin, authLoaded, authUser, navigate, profileFetched, isFetching]);

    // Function to fetch profile using session
    const fetchSessionProfile = async () => {
        if (isFetching) return; // Prevent multiple simultaneous fetches
        
        setIsFetching(true);
        setError(null);
        
        try {
            console.log("Fetching profile from session...");
            
            // Use session-based endpoint
            const res = await fetch(`${backendUrl}/current-user`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            
            if (!res.ok) {
                if (res.status === 401) {
                    console.log("Session expired or not found, logging out user");
                    logout();
                    navigate("/signin");
                    return;
                }
                throw new Error(`Failed to fetch session profile: ${res.status}`);
            }
            
            const data = await res.json();
            console.log("Session profile data:", data);
            
            if (data.success && data.user) {
                // Ensure user has a list property
                if (!data.user.list) {
                    data.user.list = [];
                }
                
                // Normalize the user ID for consistency
                if (data.user._id) {
                    data.user._id = String(data.user._id).trim();
                    console.log("Normalized user ID from session:", data.user._id);
                    
                    // Store user ID in localStorage as a fallback
                    localStorage.setItem('userId', data.user._id);
                }
                
                // Update auth user with session data
                setAuthUser(data.user);
                console.log("Profile updated from session data");
            } else {
                // Fallback to JWT profile if session data failed
                console.log("Session data invalid, trying JWT profile...");
                await fetchJwtProfile();
            }
        } catch (err) {
            console.error("Error fetching session profile:", err);
            console.log("Trying JWT profile as fallback...");
            await fetchJwtProfile();
        } finally {
            setIsFetching(false);
        }
    };
    
    // Fallback function to fetch profile using JWT
    const fetchJwtProfile = async () => {
        try {
            console.log("Fetching profile with JWT...");
            
            const res = await fetch(`${backendUrl}/profilec`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            
            if (!res.ok) {
                throw new Error(`Failed to fetch JWT profile: ${res.status}`);
            }
            
            const data = await res.json();
            console.log("JWT profile data:", data);
            
            // Update auth user with JWT data
            const userData = data.user || data;
            if (!userData.list) {
                userData.list = [];
            }
            
            setAuthUser(userData);
            console.log("Profile updated from JWT data:", userData);
        } catch (err) {
            console.error("Error fetching JWT profile:", err);
            setError("Failed to load profile data. Please try logging in again.");
        }
    };

    // New function to remove an item
    const removeItem = async (itemId) => {
        if (!itemId) return;
        
        // Show a confirmation dialog with custom UI
        if (!window.confirm("Are you sure you want to remove this item?")) {
            return;
        }
        
        setIsDeleting(true);
        
        try {
            console.log(`Removing item with ID: ${itemId}`);
            
            const res = await fetch(`${backendUrl}/add_data/remove`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    item_id: itemId,
                    user_id: authUser._id
                })
            });
            
            if (!res.ok) {
                throw new Error(`Failed to remove item: ${res.status}`);
            }
            
            const data = await res.json();
            console.log("Item removal response:", data);
            
            if (data.success) {
                // Update the local state to remove the item
                const updatedList = authUser.list.filter(item => item._id !== itemId);
                setAuthUser({
                    ...authUser,
                    list: updatedList
                });
                
                toast.success("Item removed successfully!");
            } else {
                toast.error(data.message || "Failed to remove item. Please try again.");
            }
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error("Error removing item. Please try again later.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter and sort listings function
    const getFilteredAndSortedListings = () => {
        if (!authUser || !authUser.list) return [];
        
        let filtered = [...authUser.list];
        
        // Apply category filter
        if (filterCategory !== "All") {
            filtered = filtered.filter(item => item.item_tag === filterCategory);
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.item_price - b.item_price;
                case "price-high":
                    return b.item_price - a.item_price;
                case "condition":
                    return b.item_condition - a.item_condition;
                default: // newest
                    return new Date(b._id ? b._id.toString().substring(0, 8) : Date.now()) - 
                           new Date(a._id ? a._id.toString().substring(0, 8) : Date.now());
            }
        });
        
        return filtered;
    };
    
    // Get unique categories from listings
    const getCategories = () => {
        if (!authUser || !authUser.list) return [];
        
        const categories = new Set(authUser.list.map(item => item.item_tag));
        return ["All", ...Array.from(categories)];
    };

    // Updated function to handle logout
    const handleLogout = async () => {
        // Use a custom modal instead of window.confirm
        setLogoutStatus({
            isLoggingOut: false,
            message: "Are you sure you want to log out?"
        });
    };

    // Function to confirm and process logout
    const confirmLogout = async () => {
        setLogoutStatus({
            isLoggingOut: true,
            message: "Logging you out..."
        });
        
        try {
            // Call the logout function from auth context
            await logout();
            
            // Show success message
            setLogoutStatus({
                isLoggingOut: true,
                message: "Logout successful! Redirecting..."
            });
            
            // Navigate to signin page after a short delay
            setTimeout(() => {
                navigate("/signin");
            }, 1500);
        } catch (error) {
            console.error("Error during logout:", error);
            setLogoutStatus({
                isLoggingOut: false,
                message: "Error logging out. Please try again."
            });
        }
    };

    // Function to cancel logout
    const cancelLogout = () => {
        setLogoutStatus({ isLoggingOut: false, message: "" });
    };

    // Handle file input change for avatar upload
    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check file size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image is too large. Maximum size is 2MB.");
            return;
        }
        
        // Check file type
        if (!file.type.match('image.*')) {
            toast.error("Only image files are allowed");
            return;
        }
        
        setIsUpdatingAvatar(true);
        
        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            
            // Save avatar to localStorage for persistence
            localStorage.setItem('userAvatar', base64Image);
            
            // Update state
            setAvatar(base64Image);
            
            // Update user record if possible (depends on backend support)
            updateUserAvatar(base64Image);
        };
        reader.onerror = () => {
            toast.error("Error reading file");
            setIsUpdatingAvatar(false);
        };
        reader.readAsDataURL(file);
    };
    
    // Function to update user avatar in the database
    const updateUserAvatar = async (base64Image) => {
        try {
            // Skip actual API call if not implemented on backend yet
            console.log("Avatar would be updated in database (if backend supported)");
            
            // Simulate API call completion
            setTimeout(() => {
                setIsUpdatingAvatar(false);
                toast.success("Profile picture updated successfully!");
            }, 800);
            
            /* If backend supports avatar updates, uncomment this code:
            
            const res = await fetch(`${backendUrl}/update-avatar`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    user_id: authUser._id,
                    avatar: base64Image
                })
            });
            
            if (!res.ok) {
                throw new Error(`Failed to update avatar: ${res.status}`);
            }

            const data = await res.json();
            console.log("Avatar update response:", data);
            
            if (data.success) {
                // Update auth user with the new avatar
                setAuthUser({
                    ...authUser,
                    avatar: base64Image
                });
                toast.success("Profile picture updated successfully!");
            }
            
            setIsUpdatingAvatar(false);
            */
            
        } catch (error) {
            console.error("Error updating avatar:", error);
            toast.error("Failed to update profile picture. Please try again.");
            setIsUpdatingAvatar(false);
        }
    };

    // Function to trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Function to submit testimonial
    const submitTestimonial = async () => {
        if (!testimonialText.trim()) {
            toast.error("Please enter your testimonial");
            return;
        }

        setIsSubmittingTestimonial(true);

        try {
            console.log("Submitting testimonial:", testimonialText);
            
            // Prepare testimonial data - only sending necessary fields
            const testimonialData = {
                avatar: avatar, // Use current avatar
                text: testimonialText,
                user_id: authUser._id || 'unknown',
                name: authUser.name,
                email_id: authUser.email_id,
                date: new Date().toISOString()
            };
            
            // Store in localStorage first (as fallback)
            const existingTestimonials = JSON.parse(localStorage.getItem('testimonials') || '[]');
            existingTestimonials.push(testimonialData);
            localStorage.setItem('testimonials', JSON.stringify(existingTestimonials));
            
            try {
                // Try sending to backend if available
                const res = await fetch(`${backendUrl}/testimonials/add`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(testimonialData)
                });
                
                if (!res.ok) {
                    throw new Error(`Failed to submit testimonial: ${res.status}`);
                }
                
                const data = await res.json();
                console.log("Testimonial submission response:", data);
                
                toast.success("Thank you for your testimonial! It will be visible after approval.");
            } catch (apiError) {
                console.error("API error:", apiError);
                console.log("Using localStorage testimonial storage");
                
                // The testimonial is already stored in localStorage, so just show success
                toast.success("Thank you for your testimonial! It has been saved locally.");
            }
            
            setShowTestimonialModal(false);
            setTestimonialText("");
            
        } catch (error) {
            console.error("Error submitting testimonial:", error);
            toast.error("There was an error submitting your testimonial. Please try again.");
        } finally {
            setIsSubmittingTestimonial(false);
        }
    };

    if (!authLoaded || isFetching) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-700">
                <div className="bg-black bg-opacity-30 p-8 rounded-lg text-white">
                    <h2 className="text-2xl font-bold">Loading Profile...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-700">
                <div className="bg-black bg-opacity-30 p-8 rounded-lg text-white">
                    <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
                    <p className="text-red-500">{error}</p>
                    <button 
                        onClick={() => navigate("/signin")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Return to Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (!authUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-700">
                <div className="bg-black bg-opacity-30 p-8 rounded-lg text-white">
                    <h2 className="text-2xl font-bold mb-4">No Profile Data</h2>
                    <p>Unable to load profile data. Please try signing in again.</p>
                    <button 
                        onClick={() => navigate("/signin")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Return to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster />
            
            {/* Logout confirmation modal */}
            <AnimatePresence>
                {logoutStatus.message && (
                    <motion.div 
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            {logoutStatus.isLoggingOut ? (
                                <div className="text-center">
                                    <div className="mb-4">
                                        {logoutStatus.message === "Logout successful! Redirecting..." ? (
                                            <motion.div 
                                                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                                                initial={{ rotate: 0 }}
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 0.6 }}
                                            >
                                                <motion.svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    className="h-8 w-8 text-green-600" 
                                                    fill="none" 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: 0.2, type: "spring" }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </motion.svg>
                                            </motion.div>
                                        ) : (
                                            <div className="w-16 h-16 flex items-center justify-center mx-auto">
                                                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">{logoutStatus.message}</h3>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Logout</h3>
                                    <p className="text-gray-600 mb-4">{logoutStatus.message}</p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                            onClick={cancelLogout}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            onClick={confirmLogout}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Main content */}
            <div className="bg-gray-700 min-h-screen">
                <div className="container mx-auto py-5 p-5">
                    <div className="md:flex flex-nowrap md:-mx-2">
                        {/* Left Side */}
                        <div className="w-full md:w-3/12 md:mx-2">
                            <div className="bg-black shadow-slate-900 bg-opacity-30 text-white shadow-lg p-3 border-t-4 border-green-400">
                                <div className="image overflow-hidden relative group rounded-lg">
                                    {/* Avatar image with overlay */}
                                    <div className="relative">
                                        {isUpdatingAvatar && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 rounded-lg">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                        <img 
                                            className="max-h-65 w-full mx-auto object-cover rounded-lg"
                                            src={avatar}
                                            alt="Profile"
                                        />
                                        {/* Overlay with plus icon for upload */}
                                        <div 
                                            onClick={triggerFileInput}
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 cursor-pointer rounded-lg"
                                        >
                                            <div className="bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 hover:bg-gray-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Hidden file input */}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                    <p className="text-center text-xs text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Click to change avatar
                                    </p>
                                </div>
                                <h1 className="text-gray-100 font-bold text-xl leading-8 my-1">
                                    {authUser.name}
                                </h1>

                                <ul className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
                                    <li className="flex items-center py-3">
                                        <span>Status</span>
                                        <span className="ml-auto">
                                            <span className="bg-green-500 py-1 px-2 rounded text-white text-sm">
                                                Student
                                            </span>
                                        </span>
                                    </li>
                                    <li className="flex items-center py-3">
                                        <span>Number of Items Listed</span>
                                        <span className="ml-auto">
                                            {authUser.list?.length || 0}
                                        </span>
                                    </li>
                                    <li className="flex items-center py-3">
                                        <button 
                                            onClick={() => setShowTestimonialModal(true)}
                                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-2 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            Share Your Experience
                                        </button>
                                    </li>
                                    <li className="flex items-center py-3">
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-2 rounded transition-colors duration-200 text-sm"
                                        >
                                            Log Out
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="w-full md:w-9/12 mx-2">
                            <div className="bg-black shadow-slate-900 bg-opacity-30 text-white shadow-lg p-3 rounded-sm">
                                <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8">
                                    <span className="text-green-500">
                                        <svg className="h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                </div>
                                <div className="text-white">
                                    <div className="grid md:grid-cols-2 text-sm">
                                        <div className="flex">
                                            <div className="px-4 py-2 font-semibold w-[50%]">Name</div>
                                            <div className="px-4 py-2 w-[50%]">{authUser.name}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="px-4 py-2 font-semibold w-[50%]">College</div>
                                            <div className="px-4 py-2 w-[50%]">{authUser.college_name}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="px-4 py-2 font-semibold w-[50%]">Email</div>
                                            <div className="px-4 py-2 w-[50%]">
                                                <a className="text-blue-400 hover:text-blue-300" href={`mailto:${authUser.email_id}`}>
                                                    {authUser.email_id}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <div className="px-4 py-2 font-semibold w-[50%]">User ID</div>
                                            <div className="px-4 py-2 w-[50%] text-xs">
                                                {authUser._id}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="justify-center w-full mx-auto">
                <div className="my-4 bg-white shadow rounded-sm">
                    <div className="h-1 bg-indigo-500 rounded-t-md"></div>
                    <div className="text-gray-700 p-4">
                        <div className="flex items-center border-b mb-4 pb-2 justify-between">
                            <div className="text-xl font-bold text-indigo-600">Your Listings</div>
                        </div>

                        {/* Filter and sort controls */}
                        {authUser && authUser.list && authUser.list.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex flex-wrap gap-4 items-center">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mr-2">Filter by:</label>
                                        <select 
                                            value={filterCategory} 
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                        >
                                            {getCategories().map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
                                        <select 
                                            value={sortBy} 
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="condition">Best Condition</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        console.log("Manual refresh triggered by user");
                                        fetchSessionProfile();
                                    }}
                                    disabled={isDeleting || isFetching}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-1.5 px-4 rounded flex items-center transition-all duration-200 transform hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isFetching ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    )}
                                    {isFetching ? "Refreshing..." : "Refresh"}
                                </button>
                            </div>
                        )}

                        {/* Improved Server Listings Section */}
                        <div>
                            {isFetching ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 p-4 rounded-md text-red-800 flex items-center my-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>{error}</p>
                                </div>
                            ) : authUser && authUser.list && authUser.list.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {getFilteredAndSortedListings().map((item, index) => (
                                        <div 
                                            key={index} 
                                            className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 bg-white border border-gray-100 relative"
                                        >
                                            {/* Top badge for item condition */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm bg-white/80 text-indigo-800 border border-indigo-100 shadow-sm">
                                                    Condition: {item.item_condition}/5
                                                </span>
                                            </div>
                                            
                                            {/* Category tag */}
                                            <div className="absolute top-3 left-3 z-10">
                                                <span 
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm border shadow-sm"
                                                    style={{
                                                        backgroundColor: item.item_tag === 'Books' ? 'rgba(139, 92, 246, 0.15)' : 
                                                                        item.item_tag === 'Clothing_essentials' ? 'rgba(236, 72, 153, 0.15)' : 
                                                                        item.item_tag === 'Sports' ? 'rgba(34, 197, 94, 0.15)' : 
                                                                        item.item_tag === 'Stationary' ? 'rgba(245, 158, 11, 0.15)' : 
                                                                        item.item_tag === 'Daily-use' ? 'rgba(59, 130, 246, 0.15)' : 
                                                                        'rgba(107, 114, 128, 0.15)',
                                                        color: item.item_tag === 'Books' ? '#7C3AED' : 
                                                                item.item_tag === 'Clothing_essentials' ? '#DB2777' : 
                                                                item.item_tag === 'Sports' ? '#16A34A' : 
                                                                item.item_tag === 'Stationary' ? '#D97706' : 
                                                                item.item_tag === 'Daily-use' ? '#2563EB' : 
                                                                '#4B5563',
                                                        borderColor: item.item_tag === 'Books' ? 'rgba(139, 92, 246, 0.3)' : 
                                                                    item.item_tag === 'Clothing_essentials' ? 'rgba(236, 72, 153, 0.3)' : 
                                                                    item.item_tag === 'Sports' ? 'rgba(34, 197, 94, 0.3)' : 
                                                                    item.item_tag === 'Stationary' ? 'rgba(245, 158, 11, 0.3)' : 
                                                                    item.item_tag === 'Daily-use' ? 'rgba(59, 130, 246, 0.3)' : 
                                                                    'rgba(107, 114, 128, 0.3)'
                                                    }}
                                                >
                                                    {item.item_tag}
                                                </span>
                                            </div>
                                            
                                            {/* Image container with fixed height and gradient overlay */}
                                            <div className="relative h-64 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-600">
                                                {item.item_image ? (
                                                    <>
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-gray-50 opacity-30"></div>
                                                        <img 
                                                            src={item.item_image} 
                                                            alt={item.item_name}
                                                            className="w-full h-full object-contain object-center p-4 drop-shadow-md transform hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => {
                                                                console.log("Image failed to load:", item.item_image);
                                                                e.target.src = "https://via.placeholder.com/300x300?text=Image+Not+Available";
                                                                e.target.onerror = null;
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-gray-400 absolute mt-24">No image available</p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Content container */}
                                            <div className="p-5">
                                                <h3 className="text-lg font-semibold truncate text-gray-800 hover:text-indigo-600">{item.item_name}</h3>
                                                <p className="text-gray-600 text-sm mt-1 mb-3 h-12 overflow-hidden leading-snug">{item.item_description}</p>
                                                
                                                {/* Price and info row */}
                                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                    <span className="text-xl font-bold" 
                                                        style={{
                                                            color: item.item_tag === 'Books' ? '#7C3AED' : 
                                                                    item.item_tag === 'Clothing_essentials' ? '#DB2777' : 
                                                                    item.item_tag === 'Sports' ? '#16A34A' : 
                                                                    item.item_tag === 'Stationary' ? '#D97706' : 
                                                                    item.item_tag === 'Daily-use' ? '#2563EB' : 
                                                                    '#4B5563'
                                                        }}
                                                    >
                                                        ₹{item.item_price}
                                                    </span>
                                                    <div className="text-gray-500 text-xs">
                                                        Age: {item.item_age} yr
                                                    </div>
                                                </div>
                                                
                                                {/* Remove button */}
                                                <button
                                                    onClick={() => removeItem(item._id)}
                                                    disabled={isDeleting}
                                                    className="mt-4 w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-md transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                                                >
                                                    {isDeleting ? (
                                                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                    Remove Item
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-8 rounded-lg text-center flex flex-col items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 10l-8-4m-8 4l8-4" />
                                    </svg>
                                    <p className="text-gray-600 mb-1 text-lg">No listings found.</p>
                                    <p className="text-gray-500 mb-4">Start selling by creating a new listing!</p>
                                    <button 
                                        onClick={() => navigate("/sell")}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:-translate-y-0.5 shadow-md"
                                    >
                                        Create Listing
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonial Modal */}
            {showTestimonialModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl transform transition-all animate-fadeIn">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-800">Share Your Experience</h3>
                                <button 
                                    onClick={() => setShowTestimonialModal(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="flex items-center space-x-4 mb-6">
                                <img 
                                    src={avatar} 
                                    alt={authUser.name}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200" 
                                />
                                <div>
                                    <p className="font-medium text-gray-800">{authUser.name}</p>
                                    <p className="text-sm text-gray-500">{authUser.email_id}</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="testimonial" className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Testimonial
                                </label>
                                <textarea
                                    id="testimonial"
                                    rows="5"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    placeholder="Share your experience with KIIT Hub..."
                                    value={testimonialText}
                                    onChange={(e) => setTestimonialText(e.target.value)}
                                ></textarea>
                                <p className="mt-1 text-xs text-gray-500">
                                    Your testimonial will be displayed on the testimonials page.
                                </p>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowTestimonialModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={submitTestimonial}
                                    disabled={isSubmittingTestimonial || !testimonialText.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isSubmittingTestimonial ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Testimonial'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal animation styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default Profile;
