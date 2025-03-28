import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import HeaderSearch from './HeaderSearch';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Backend URL - adjust this to match your backend server
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

// Helper function to normalize MongoDB IDs for comparison
const normalizeId = (id) => {
  if (!id) return '';
  return String(id).trim();
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const Home = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [stats] = useState({
    users: 500,
    items: 50,
    transactions: 50,
    satisfaction: 98
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user data
  const fetchUserData = async () => {
    try {
      // Use the absolute backend URL
      const res = await fetch(`${BACKEND_URL}/current-user`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (res.status === 401) {
        console.log('User not authenticated');
        setIsAuthenticated(false);
        return null;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log('User data fetched:', data.success);
      
      if (data.success && data.user && data.user._id) {
        // Ensure user ID is properly formatted for comparison
        data.user._id = normalizeId(data.user._id);
        console.log('Normalized user ID:', data.user._id);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      
      return data.user || null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      setIsAuthenticated(false);
      return null;
    }
  };

  // Fetch all listings
  const fetchAllListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try the /db endpoint
      console.log('Attempting to fetch from /db endpoint');
      const res = await fetch(`${BACKEND_URL}/db`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      // If /db fails, try fetching directly from a known working endpoint as a fallback
      if (!res.ok) {
        console.log(`/db endpoint failed with status ${res.status}, trying alternative approach`);
        
        // If the user is authenticated, we can try to fetch all listings through a different route
        // Note: We'll try even if currentUser is null as the endpoint doesn't require authentication
        console.log('Attempting to fetch from /profilec/all-users endpoint');
        const userRes = await fetch(`${BACKEND_URL}/profilec/all-users`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('Received alternative user data:', userData);
          
          if (Array.isArray(userData)) {
            // Check if there's any data
            if (userData.length === 0) {
              console.log('No users found in the alternative data');
            } else {
              // Check if users have any listings
              const usersWithItems = userData.filter(
                user => user.list && user.list.length > 0
              );
              console.log(`Found ${usersWithItems.length} users with items`);
              
              if (usersWithItems.length > 0) {
                usersWithItems.forEach(user => {
                  console.log(`User ${user.name || user._id} has ${user.list.length} items`);
                });
              }
            }
            return userData;
          } else {
            console.error('Received non-array data:', userData);
          }
        } else {
          console.error(`Alternative endpoint failed with status ${userRes.status}`);
        }
        
        throw new Error(`Failed to fetch listings from both endpoints`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        console.error('Invalid data format from /db endpoint:', data);
        throw new Error('Invalid data format received from server');
      }
      
      console.log('Received listings data from /db:', data);
      return data;
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to fetch listings');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Process all listings
  const processListings = (allListings) => {
    try {
      console.log('Processing listings, raw data:', allListings);
      
      if (!Array.isArray(allListings)) {
        console.error('allListings is not an array:', allListings);
        return [];
      }

      // Get current user ID from state or localStorage
      const currentUserId = currentUser?._id || localStorage.getItem('userId');
      console.log('Current user ID for filtering:', normalizeId(currentUserId));
      
      if (!currentUserId) {
        console.log('No current user ID, showing all listings');
        return formatAllListings(allListings);
      }

      // Filter out listings from all users' list arrays where the sellerId matches current user
      const filteredUsers = allListings.map(user => {
        // Skip if user doesn't have items
        if (!user || !user.list || !Array.isArray(user.list)) {
          return user;
        }
        
        // Check if this is the current user
        const isCurrentUser = normalizeId(user._id) === normalizeId(currentUserId);
        
        if (isCurrentUser) {
          console.log(`Found current user (${user.name || user._id}), filtering out their items`);
          // For current user, filter out all their items
          return {
            ...user,
            list: [] // Remove all items from current user
          };
        }
        
        // For other users, keep their items
        return user;
      });

      console.log('Filtered out current user listings');
      return formatAllListings(filteredUsers);
    } catch (error) {
      console.error('Error processing listings:', error);
      return [];
    }
  };

  // Helper function to format listings from multiple users
  const formatAllListings = (usersWithListings) => {
    let formattedListings = [];
    
    // Get current user ID for safety check
    const currentUserId = currentUser?._id || localStorage.getItem('userId');
    const normalizedCurrentUserId = normalizeId(currentUserId);
    
    console.log('Formatting listings, checking against user ID:', normalizedCurrentUserId);
    
    usersWithListings.forEach(user => {
      if (!user || !user.list || !Array.isArray(user.list)) return;
      
      // Double-check: skip if this is the current user
      if (normalizedCurrentUserId && normalizeId(user._id) === normalizedCurrentUserId) {
        console.log(`Safety check: skipping items from current user ${user.name || user._id}`);
        return;
      }
      
      // Include items that are valid for display
      const validItems = user.list.filter(item => {
        if (!item) return false; // Skip undefined items
        
        // If there's no status, include it
        if (!item.item_status) return true;
        
        // If it's approved, include it
        if (item.item_status === 'approved') return true;
        
        // Exclude items with these statuses
        const excludeStatuses = ['deleted', 'blacklisted', 'under_approval'];
        return !excludeStatuses.includes(item.item_status);
      });
      
      console.log(`User ${user.name || user._id}: ${validItems.length} valid items`);
      
      // Add each valid item to the formatted listings array
      validItems.forEach(item => {
        // Safety check: don't include if this item somehow belongs to current user
        if (item.userId && normalizedCurrentUserId && normalizeId(item.userId) === normalizedCurrentUserId) {
          console.log(`Extra safety: skipping item ${item._id} that belongs to current user`);
          return;
        }
        
        formattedListings.push({
          ...item,
          sellerId: user._id,
          sellerName: user.name || 'Unknown User',
        });
      });
    });
    
    console.log('Total formatted listings:', formattedListings.length);
    return formattedListings;
  };

  // Filter listings by category and search query
  const getFilteredListings = () => {
    if (!listings.length) return [];
    
    // Get current user ID for the final safety check
    const currentUserId = currentUser?._id || localStorage.getItem('userId');
    const normalizedCurrentUserId = normalizeId(currentUserId);
    
    return listings.filter(item => {
      // Final safety check - exclude any items from current user
      if (normalizedCurrentUserId && 
          (normalizeId(item.sellerId) === normalizedCurrentUserId || 
           normalizeId(item.userId) === normalizedCurrentUserId)) {
        console.log(`Final check: filtering out item ${item._id} from current user`);
        return false;
      }
      
      // Filter by category
      const categoryMatch = activeCategory === 'All' || item.item_tag === activeCategory;
      
      // Filter by search query
      const searchMatch = !searchQuery || 
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.item_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  };

  // Get unique categories from listings
  const getCategories = () => {
    if (!listings.length) return ['All'];
    
    const categories = new Set(['All']);
    listings.forEach(item => {
      if (item.item_tag) {
        categories.add(item.item_tag);
      }
    });
    
    return Array.from(categories);
  };

  // Add to wishlist
  const saveItem = async (itemId, sellerId) => {
    if (!currentUser) {
      toast.error('Please log in to save items');
      return;
    }

    try {
      // First check if user is still authenticated
      const checkUserRes = await fetch(`${BACKEND_URL}/current-user`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!checkUserRes.ok) {
        // Session might have expired
        toast.error('Your session may have expired. Please log in again.');
        setCurrentUser(null);
        localStorage.removeItem('userId');
        return;
      }
      
      const userData = await checkUserRes.json();
      if (!userData.success || !userData.user) {
        toast.error('Authentication error. Please log in again.');
        setCurrentUser(null);
        localStorage.removeItem('userId');
        return;
      }
      
      const userId = userData.user._id;
      
      console.log('Sending wishlist add request with data:', {
        user_id: userId,
        item_id: itemId,
        seller_id: sellerId
      });
      
      // First test the wishlist endpoint with a GET request
      console.log('Testing wishlist endpoint...');
      try {
        const testResponse = await fetch(`${BACKEND_URL}/wishlist-test`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!testResponse.ok) {
          console.error('Wishlist test endpoint failed!', testResponse.status);
        } else {
          const testData = await testResponse.json();
          console.log('Wishlist test endpoint response:', testData);
        }
      } catch (testError) {
        console.error('Error testing wishlist endpoint:', testError);
      }
      
      // Try the wishlist endpoint from the app.ts file
      const response = await fetch(`${BACKEND_URL}/wishlist/add`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          item_id: itemId,
          seller_id: sellerId
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save item');
        } catch (parseError) {
          // If parsing fails, use the HTTP status text
          throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Item saved to your wishlist!');
      } else {
        throw new Error(data.message || 'Failed to save item');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save item');
      console.error('Error saving item:', err);
    }
  };

  // Handle buy button click - shows confirmation modal
  const handleBuyClick = (item) => {
    setSelectedItem(item);
    setShowConfirmModal(true);
  };

  // Complete purchase
  const confirmPurchase = async () => {
    setIsSubmitting(true);
    // Generate a random order reference
    const orderRef = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      // Get current user details
      const userId = localStorage.getItem('userId');
      let buyerName = '';
      let buyerEmail = '';
      
      // Fetch current user details for the buyer
      try {
        const userResponse = await fetch(`${BACKEND_URL}/profilec/user/${userId}`);
        const userData = await userResponse.json();
        buyerName = userData.name || 'Not available';
        buyerEmail = userData.email || '';
        console.log(`Found buyer name: ${buyerName}, email: ${buyerEmail}`);
      } catch (error) {
        console.error('Error fetching buyer details:', error);
        buyerName = 'Not available';
      }
      
      // Initialize seller variables
      let sellerName = selectedItem.sellerName || 'Unknown Seller';
      let sellerEmail = '';
      
      // Try to fetch the seller's email from the user profile first
      try {
        console.log(`Fetching seller details for ID: ${selectedItem.sellerId}`);
        const sellerResponse = await fetch(`${BACKEND_URL}/profilec/user/${selectedItem.sellerId}`);
        const sellerData = await sellerResponse.json();
        
        if (sellerData && sellerData.email) {
          sellerEmail = sellerData.email;
          sellerName = sellerData.name || sellerName;
          console.log(`Found seller email from profile: ${sellerEmail.substring(0, 3)}...`);
        } else {
          console.warn('Seller profile found but email not available, trying alternative lookup');
          
          // Try another endpoint if the first one doesn't have the email
          try {
            const altSellerResponse = await fetch(`${BACKEND_URL}/db/${selectedItem.sellerId}`);
            const altSellerData = await altSellerResponse.json();
            
            if (altSellerData && altSellerData.email) {
              sellerEmail = altSellerData.email;
              sellerName = altSellerData.name || sellerName;
              console.log(`Found seller email from alt lookup: ${sellerEmail.substring(0, 3)}...`);
            } else {
              console.warn('Could not find seller email through alternative lookup');
            }
          } catch (altError) {
            console.error('Error in alternative seller lookup:', altError);
          }
        }
      } catch (error) {
        console.error('Error fetching seller details:', error);
      }
      
      // Fallback for testing - you can remove this in production
      if (!sellerEmail) {
        console.warn('Using test email as fallback since seller email was not found');
        sellerEmail = 'kiithub16@gmail.com'; // Default test email
      }
      
      // Send purchase notification
      const response = await fetch(`${BACKEND_URL}/purchase/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderRef,
          itemId: selectedItem._id,
          itemName: selectedItem.item_name,
          itemPrice: selectedItem.item_price,
          buyerName,
          buyerEmail,
          sellerId: selectedItem.sellerId,
          sellerName,
          sellerEmail,
        }),
      });

      // Process response
      const result = await response.json();
      if (response.ok) {
        // Successful API call
        setShowConfirmModal(false);
        
        // Store purchase information in localStorage
        const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        purchases.push({
          orderRef,
          itemId: selectedItem._id,
          itemName: selectedItem.item_name,
          itemPrice: selectedItem.item_price,
          sellerId: selectedItem.sellerId,
          sellerName,
          purchaseDate: new Date().toISOString(),
        });
        localStorage.setItem('purchases', JSON.stringify(purchases));
        
        // Show success message with appropriate details based on which emails were sent
        let successMessage = 'Purchase successful! ';
        if (result.buyerEmailSent && result.sellerEmailSent) {
          successMessage += 'Confirmation emails sent to both you and the seller.';
        } else if (result.buyerEmailSent) {
          successMessage += `Confirmation email sent to you at ${buyerEmail}.`;
          toast.warning('Seller notification email could not be sent.', { position: 'bottom-center' });
        } else if (result.sellerEmailSent) {
          successMessage += 'Seller has been notified of your purchase.';
          toast.warning('Buyer confirmation email could not be sent.', { position: 'bottom-center' });
        } else {
          successMessage += 'However, email notifications could not be sent.';
          toast.warning('Email notifications failed. Please contact support.', { position: 'bottom-center' });
        }
        
        toast.success(successMessage, { position: 'bottom-center' });
        
        // Refresh the items list to reflect the change
        initializeData();
      } else {
        // API call failed
        toast.error(`Purchase failed: ${result.message || 'Unknown error'}`, { position: 'bottom-center' });
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      toast.error('Purchase failed. Please try again later.', { position: 'bottom-center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch initial data
  const initializeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First fetch user data - important for filtering
      const userData = await fetchUserData();
      
      if (userData && userData._id) {
        console.log('Authenticated user:', userData._id);
        // Store user ID in localStorage for persistence across page refreshes
        localStorage.setItem('userId', normalizeId(userData._id));
        setCurrentUser(userData);
        
        // Only fetch listings if user is authenticated
        const allListings = await fetchAllListings();
        // Process listings, filtering out current user's items
        const processed = processListings(allListings);
        setListings(processed);
      } else {
        console.log('No authenticated user');
        localStorage.removeItem('userId');
        setCurrentUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a flag to prevent multiple fetch attempts
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        await initializeData();
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
    // Empty dependency array means this effect runs once on mount
  }, []);

  // Local search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle card click to show modal with zoom effect
  const handleCardClick = (item) => {
    setSelectedCard(item);
    setShowCardModal(true);
  };

  const renderFloatingDecoration = (index) => {
    const shapes = [
      // Circle
      <motion.div 
        key={`decoration-${index}-1`} 
        className="absolute w-6 h-6 rounded-full bg-indigo-500 opacity-20" 
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 3 + index,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />,
      // Square
      <motion.div 
        key={`decoration-${index}-2`} 
        className="absolute w-6 h-6 bg-purple-500 opacity-20 rotate-45" 
        animate={{
          y: [0, -20, 0],
          rotate: [45, 90, 45],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 4 + index,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />,
      // Triangle (using clip-path)
      <motion.div 
        key={`decoration-${index}-3`} 
        className="absolute w-8 h-8 bg-blue-500 opacity-20" 
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        animate={{
          y: [0, -30, 0],
          rotate: [0, 180, 360],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 5 + index,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />,
    ];
    
    return shapes[index % shapes.length];
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="text-center">
          <div className="inline-block animate-bounce bg-blue-600 p-2 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Loading items...</h1>
          <p className="text-gray-600 mt-2">Discovering great deals for you</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-rose-100 to-pink-100">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
          <div className="inline-block bg-red-100 p-3 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">{error}</h1>
          <p className="text-gray-600 mb-6">We encountered a problem while loading the items. Please try again.</p>
          <motion.button 
            onClick={initializeData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-300/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  // Not authenticated state - show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} transition-colors duration-300`}>
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <motion.div 
              className="w-24 h-24 mx-auto bg-indigo-600 rounded-full flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </motion.div>
          </div>
          
          <motion.h1 
            className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Sign in to access KiitHub
          </motion.h1>
          
          <motion.p 
            className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            You need to sign in to view items and interact with the marketplace.
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.button
              onClick={() => navigate('/Signin')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-all font-medium"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  const filteredListings = getFilteredListings();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} transition-colors duration-300`}>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: isDark ? '#4F46E5' : '#4F46E5',
          color: '#ffffff',
          boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)',
          borderRadius: '10px',
          padding: '16px 24px',
        },
      }} />
      
      {/* Hero Section with Parallax */}
      <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background with parallax effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90 z-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <motion.img 
            src="https://source.unsplash.com/1600x900/?campus,college,university"
            alt="Campus background"
            className="w-full h-full object-cover object-center"
            initial={{ scale: 1.1 }}
            animate={{ 
              scale: 1.05,
              transition: { 
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 z-10 overflow-hidden">
          {/* Animated circles */}
          <motion.div 
            className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute bottom-10 right-20 w-48 h-48 rounded-full bg-white opacity-10"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          {/* Abstract shapes */}
          <motion.div 
            className="absolute top-[30%] right-[10%] w-32 h-32 bg-white opacity-5 transform rotate-45"
            animate={{
              rotate: [45, 60, 45],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute bottom-[20%] left-[15%] w-32 h-32 rounded-full border-4 border-white opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Decorative divider */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-1.5 bg-white opacity-50 rounded-full"></div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-md">
              KiitHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-pink-200">Marketplace</span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with your campus community to find amazing deals on books, electronics, and everything you need.
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-2xl mx-auto relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Glow effect behind search bar */}
            <div className="absolute inset-0 bg-blue-500 opacity-30 blur-xl rounded-full"></div>
            
            <div className="flex bg-white rounded-full p-1.5 shadow-2xl relative">
              <input
                type="text"
                placeholder="Search for items..."
                className="w-full py-4 px-6 bg-transparent outline-none rounded-full text-gray-700 text-lg"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <motion.button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-8 rounded-full transition-colors font-medium flex items-center space-x-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span>Search</span>
              </motion.button>
            </div>
            
            {/* Category quick links */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {getCategories().slice(0, 5).map((category, index) => (
                category !== "All" && (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className="px-4 py-2 bg-white/20 text-white rounded-full text-sm backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: 0.5 + (index * 0.1)
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                )
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Wave shape at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#EEF2FF" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,170.7C384,181,480,171,576,149.3C672,128,768,96,864,96C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Main content */}
      <div className={`container mx-auto px-4 py-12 ${isDark ? 'text-gray-100' : ''}`}>
        {/* Category Navigation */}
        <div className="mb-16 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-indigo-50 rounded-3xl -z-10"></div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-100 rounded-full opacity-70 -z-10"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-100 rounded-full opacity-70 -z-10"></div>

          {/* Floating decorations */}
          {[...Array(6)].map((_, i) => (
            <div key={`float-${i}`} className="absolute" style={{ 
              left: `${15 + (i * 15)}%`, 
              top: `${20 + (i % 3) * 20}px`,
              zIndex: -5
            }}>
              {renderFloatingDecoration(i)}
            </div>
          ))}
          
          <div className="py-10 px-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <span className="mr-2">Browse by Category</span>
              <div className="h-px flex-grow bg-gradient-to-r from-indigo-600 to-transparent ml-4"></div>
            </h2>
            
            <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
              {getCategories().map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                    activeCategory === category
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow border border-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div 
          className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-sm">
            <motion.div 
              className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              {stats.users}+
            </motion.div>
            <p className="text-gray-600">Active Users</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-sm">
            <motion.div 
              className="text-3xl md:text-4xl font-bold text-purple-600 mb-1"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
            >
              {stats.items}+
            </motion.div>
            <p className="text-gray-600">Items Listed</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl shadow-sm">
            <motion.div 
              className="text-3xl md:text-4xl font-bold text-blue-600 mb-1"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
            >
              {stats.transactions}+
            </motion.div>
            <p className="text-gray-600">Transactions</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl shadow-sm">
            <motion.div 
              className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              viewport={{ once: true }}
            >
              {stats.satisfaction}%
            </motion.div>
            <p className="text-gray-600">Satisfaction</p>
          </div>
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-800 mb-10 flex items-center relative">
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-indigo-100 rounded-full opacity-70 z-0"></div>
          <span className="z-10">Available Items</span>
          <span className="z-10 text-sm bg-indigo-100 text-indigo-800 ml-3 px-3 py-1 rounded-full">
            {filteredListings.length} items
          </span>
          <div className="h-px flex-grow bg-gradient-to-r from-indigo-600 to-transparent ml-4"></div>
        </h2>
        
        {filteredListings.length === 0 ? (
          <div className={`text-center py-16 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
            <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className={`mt-2 text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>No items found</h3>
            <p className="mt-1 text-sm">
              {activeCategory !== 'All' 
                ? `No items found in the "${activeCategory}" category.` 
                : searchQuery 
                  ? `No items matching "${searchQuery}".` 
                  : "There are no items available right now."}
            </p>
            {(activeCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
                className={`mt-3 inline-flex items-center px-3 py-1.5 border ${isDark ? 'border-indigo-500 text-indigo-300 hover:bg-indigo-900/30' : 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'} rounded-md text-sm font-medium`}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredListings.map((item) => (
              <motion.div 
                key={item._id} 
                variants={itemVariants}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
                onClick={() => handleCardClick(item)}
                whileHover={{ 
                  y: -8,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                {/* Item Image */}
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                  <img 
                    src={item.item_image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={item.item_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {item.item_tag}
                    </span>
                  </div>
                </div>
                
                {/* Item Details */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-1 truncate text-gray-800 group-hover:text-indigo-600 transition-colors">{item.item_name}</h3>
                  <div className="flex items-center mb-2">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.sellerName)}&background=random`}
                      alt={item.sellerName}
                      className="w-5 h-5 rounded-full mr-2"
                    />
                    <p className="text-gray-500 text-sm">by {item.sellerName}</p>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">{item.item_description}</p>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="font-bold text-xl text-indigo-600">₹{item.item_price}</span>
                    <div className="flex space-x-2">
                      <motion.button 
                        onClick={(e) => {
                          e.stopPropagation();
                          saveItem(item._id, item.sellerId);
                        }}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </motion.button>
                      <motion.button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyClick(item);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Buy</span>
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Item metadata */}
                  <div className="flex justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>Condition: {item.item_condition}/5</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Age: {item.item_age} {item.item_age === 1 ? 'month' : 'months'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Purchase Confirmation Modal */}
      {showConfirmModal && selectedItem && (
        <div className={`fixed inset-0 z-50 overflow-y-auto`}>
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={() => setShowConfirmModal(false)}></div>
            
            <div className={`relative transform overflow-hidden rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}>
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className={`text-lg font-semibold leading-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Confirm Your Purchase
                  </h3>
                  <div className="mt-2">
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-500'} text-sm`}>
                      You are about to purchase <span className="font-medium">{selectedItem.item_name}</span> for <span className="font-medium">₹{selectedItem.item_price}</span>
                    </p>
                    
                    <div className={`mt-4 rounded-md ${isDark ? 'bg-indigo-900/30 border border-indigo-800' : 'bg-blue-50'} p-4`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className={`h-5 w-5 ${isDark ? 'text-indigo-300' : 'text-blue-400'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                          <p className={`text-sm ${isDark ? 'text-indigo-200' : 'text-blue-700'}`}>
                            Important Information
                          </p>
                        </div>
                      </div>
                      <ul className={`mt-2 ml-6 list-disc space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <li>After confirming, you and the seller will receive email notifications.</li>
                        <li>You'll get the seller's contact information to coordinate pickup/delivery.</li>
                        <li>Payment will be made directly to the seller when you receive the item.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={confirmPurchase}
                  className={`inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className={`mt-3 inline-flex w-full justify-center rounded-md ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-900'} px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 sm:col-start-1 sm:mt-0`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating scroll to top button */}
      <motion.button
        className="fixed right-6 bottom-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>

      {/* Card Modal */}
      {showCardModal && selectedCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={() => setShowCardModal(false)}></div>
            
            <div className={`relative transform overflow-hidden rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6`}>
              {/* Left side - Image */}
              <div className="w-full md:w-1/2 relative bg-gradient-to-br from-indigo-50 to-blue-50">
                <div className="absolute top-4 right-4 z-30">
                  <motion.button
                    className="bg-white rounded-full p-2 shadow-lg"
                    onClick={() => setShowCardModal(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                <div className="flex items-center justify-center h-full p-6">
                  <motion.img 
                    src={selectedCard.item_image || 'https://via.placeholder.com/600x600?text=No+Image'} 
                    alt={selectedCard.item_name}
                    className="w-full h-full object-contain max-h-[50vh] rounded-xl shadow-lg"
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: 1,
                      transition: { 
                        delay: 0.2,
                        type: "spring", 
                        stiffness: 300, 
                        damping: 25
                      } 
                    }}
                    whileHover={{ scale: 1.05 }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                    }}
                  />
                </div>
              </div>
              
              {/* Right side - Details */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {selectedCard.item_tag}
                  </span>
                  <span className="font-bold text-2xl text-indigo-600">₹{selectedCard.item_price}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedCard.item_name}</h2>
                
                <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-lg">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCard.sellerName)}&background=random`}
                    alt={selectedCard.sellerName}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow"
                  />
                  <div>
                    <p className="text-gray-800 font-medium">Seller</p>
                    <p className="text-gray-600">{selectedCard.sellerName}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedCard.item_description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <div className="text-indigo-600 font-medium mb-1">Condition</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i}
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 ${i < selectedCard.item_condition ? 'text-indigo-600' : 'text-gray-300'}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <div className="text-indigo-600 font-medium mb-1">Age</div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{selectedCard.item_age} {selectedCard.item_age === 1 ? 'month' : 'months'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <motion.button 
                    onClick={() => saveItem(selectedCard._id, selectedCard.sellerId)}
                    className="flex-1 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition flex items-center justify-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Save
                  </motion.button>
                  <motion.button 
                    onClick={() => {
                      setShowCardModal(false);
                      handleBuyClick(selectedCard);
                    }}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center shadow-lg shadow-indigo-200"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Buy Now
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;