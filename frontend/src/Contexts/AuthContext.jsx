import React, { useState, useEffect, useContext } from "react";

const AuthContext = React.createContext();

export function useAuth(){
    return useContext(AuthContext);
}

export function AuthProvider({ children }){
    const [authUser, setAuthUser] = useState(null);
    const [isloggedin, setIsloggedin] = useState(false);
    const [authLoaded, setAuthLoaded] = useState(false); // New flag
    const [isCheckingAuth, setIsCheckingAuth] = useState(false); // Flag to track auth checking

    // Check authentication on provider mount
    useEffect(() => {
        async function checkAuth() {
            // Prevent multiple simultaneous checks
            if (isCheckingAuth) return;
            setIsCheckingAuth(true);
            
            try {
                console.log("Checking authentication status...");
                
                // First try session-based authentication
                try {
                    console.log("Trying session authentication...");
                    const sessionRes = await fetch("http://localhost:5001/current-user", {
                        method: "GET",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                    });
                    
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
                
                // Fall back to JWT authentication if session failed
                console.log("Falling back to JWT authentication...");
                const res = await fetch("http://localhost:5001/profilec", {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) {
                    throw new Error("Not authenticated via JWT");
                }
                
                const data = await res.json();
                console.log("JWT profile data:", data);
                
                // Set auth user state with a default empty list if needed
                const userData = data.user || data;
                if (!userData.list) {
                    userData.list = [];
                }
                
                setAuthUser(userData);
                setIsloggedin(true);
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
    
    // Function to log out user - clears all auth state
    const logout = async () => {
        console.log("Logging out user");
        
        try {
            // Call server logout endpoint
            const res = await fetch("http://localhost:5001/logout", {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            
            console.log("Logout response:", res.status);
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            // Reset state
            setAuthUser(null);
            setIsloggedin(false);
            
            console.log("User logged out, auth state cleared");
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
