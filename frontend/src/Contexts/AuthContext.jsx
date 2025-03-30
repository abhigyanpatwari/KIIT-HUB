import React, { useState, useEffect, useContext } from "react";
import { API_URL, apiCall, testCorsConnection } from '../services/api';

const AuthContext = React.createContext();

export function useAuth(){
    return useContext(AuthContext);
}

export function AuthProvider({ children }){
    const [authUser, setAuthUser] = useState(null);
    const [isloggedin, setIsloggedin] = useState(false);
    const [authLoaded, setAuthLoaded] = useState(false); // New flag
    const [isCheckingAuth, setIsCheckingAuth] = useState(false); // Flag to track auth checking
    const [isLoading, setIsLoading] = useState(false);

    // Check authentication on provider mount
    useEffect(() => {
        async function checkAuth() {
            // Prevent multiple simultaneous checks
            if (isCheckingAuth) return;
            setIsCheckingAuth(true);
            
            try {
                console.log("Checking authentication status...");
                
                // First check CORS connectivity
                try {
                    console.log("Testing CORS connectivity...");
                    const corsTest = await testCorsConnection();
                    console.log("CORS test result:", corsTest);
                    
                    if (!corsTest.success) {
                        console.error("CORS test failed");
                        throw new Error("CORS test failed");
                    }
                } catch (corsError) {
                    console.error("CORS connectivity test failed:", corsError);
                    // Continue anyway, the actual API calls might still work
                }
                
                // Try API health check next
                try {
                    console.log("Checking API health...");
                    const healthRes = await apiCall('/api/health', { method: 'GET' });
                    
                    if (healthRes.ok) {
                        const healthData = await healthRes.json();
                        console.log("API health status:", healthData);
                    } else {
                        console.warn("API health check failed, status:", healthRes.status);
                    }
                } catch (healthError) {
                    console.error("Error checking API health:", healthError);
                }
                
                // Try session-based authentication
                try {
                    console.log("Trying session authentication...");
                    const sessionRes = await apiCall('/api/profile', { method: 'GET' });
                    
                    if (sessionRes.ok) {
                        const sessionData = await sessionRes.json();
                        console.log("Session data:", sessionData);
                        
                        if (sessionData.success && sessionData.user) {
                            console.log("Successfully authenticated via session");
                            
                            // Ensure user has a list property
                            if (!sessionData.user.list) {
                                sessionData.user.list = [];
                            }
                            
                            setAuthUser(sessionData.user);
                            setIsloggedin(true);
                            setAuthLoaded(true);
                            setIsCheckingAuth(false);
                            return;
                        } else {
                            console.log("Session check returned but no valid user data");
                        }
                    } else {
                        console.log("Session check failed, status:", sessionRes.status);
                    }
                } catch (sessionError) {
                    console.error("Error checking session:", sessionError);
                }
                
                // User is not authenticated
                console.log("User is not authenticated");
                setAuthUser(null);
                setIsloggedin(false);
            } catch (error) {
                console.error("Authentication check failed:", error);
                setAuthUser(null);
                setIsloggedin(false);
            } finally {
                setAuthLoaded(true); // Auth check is done
                setIsCheckingAuth(false);
            }
        }
        
        // Only run the check if not already checking
        if (!isCheckingAuth && !authLoaded) {
            checkAuth();
        }
    }, [isCheckingAuth, authLoaded]);
    
    const fetchSession = async () => {
        setIsLoading(true);
        try {
            console.log("Checking for existing session...")
            const sessionRes = await apiCall('/current-user', { method: 'GET' });
            
            if (sessionRes.ok) {
                const sessionData = await sessionRes.json();
                console.log("Session check result:", sessionData);
                
                if (sessionData.user) {
                    setAuthUser(sessionData.user);
                    setIsloggedin(true);
                    console.log("User is logged in:", sessionData.user._id);
                } else {
                    console.log("No active session found");
                    setAuthUser(null);
                    setIsloggedin(false);
                }
            } else {
                console.log("Session check failed, status:", sessionRes.status);
                setAuthUser(null);
                setIsloggedin(false);
            }
        } catch (error) {
            console.error("Error checking session:", error);
            setAuthUser(null);
            setIsloggedin(false);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfile = async () => {
        if (!isloggedin || !authUser) {
            console.log("Not fetching profile because user is not logged in");
            return;
        }
        
        try {
            console.log("Fetching user profile data...")
            const res = await apiCall('/profilec', { method: 'GET' });
            
            if (res.ok) {
                const userData = await res.json();
                if (userData.user) {
                    setAuthUser(userData.user);
                    console.log("Profile updated from server:", userData.user._id);
                }
            } else {
                console.log("Profile fetch failed, status:", res.status);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    // Function to log out user - clears all auth state
    const logout = async () => {
        try {
            console.log("Logging out...");
            const res = await apiCall('/logout', { method: 'GET' });
            
            // Clear local auth state regardless of server response
            setAuthUser(null);
            setIsloggedin(false);
            localStorage.removeItem('userId');
            console.log("Logged out client-side");
            
            if (res.ok) {
                console.log("Logout successful on server");
            } else {
                console.log("Logout on server may not have succeeded, status:", res.status);
            }
            
            return true;
        } catch (error) {
            console.error("Error during logout:", error);
            // Still clear local auth state on error
            setAuthUser(null);
            setIsloggedin(false);
            localStorage.removeItem('userId');
            return false;
        }
    };

    const value = {
        authUser,
        setAuthUser,
        isloggedin,
        setIsloggedin,
        authLoaded,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
