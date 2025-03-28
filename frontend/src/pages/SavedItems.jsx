import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';

// Backend URL - adjust this to match your backend server
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.5 }
  },
  exit: { opacity: 0 }
};

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
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: { 
    x: '100%',
    transition: { 
      repeat: Infinity, 
      duration: 1.5, 
      ease: 'linear'
    }
  }
};

const floatingBubbleVariants = {
  initial: ({ x, delay }) => ({
    x,
    y: 100,
    opacity: 0,
    scale: 0
  }),
  animate: ({ y, delay }) => ({
    y: y,
    opacity: [0, 0.7, 0.5],
    scale: [0, 1, 0.8],
    transition: {
      duration: Math.random() * 5 + 10,
      delay: delay,
      repeat: Infinity,
      repeatType: 'reverse'
    }
  })
};

// Animated background bubbles
const AnimatedBackground = () => {
  const bubbles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 120 + 40,
    x: Math.random() * 100 - 10, // percentage of viewport width
    y: -(Math.random() * 50) - 20, // negative value to start below viewport
    delay: Math.random() * 5,
    color: i % 3 === 0 ? 'indigo' : i % 3 === 1 ? 'purple' : 'blue',
    opacity: Math.random() * 0.07 + 0.03
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className={`absolute rounded-full bg-${bubble.color}-500`}
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            opacity: bubble.opacity,
            filter: 'blur(40px)'
          }}
          custom={{ y: bubble.y, delay: bubble.delay, x: bubble.x }}
          variants={floatingBubbleVariants}
          initial="initial"
          animate="animate"
        />
      ))}
    </div>
  );
};

const SavedItems = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/current-user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setIsAuthenticated(true);
          return data.user._id;
        }
      }
      
      return null;
    } catch (err) {
      console.error('Error checking authentication:', err);
      return null;
    }
  };

  // Fetch wishlist items
  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated first
      const userId = await checkAuth();
      
      if (!userId) {
        setError('Please log in to view your saved items');
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${BACKEND_URL}/wishlist`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (res.status === 401) {
        setError('Please log in to view your saved items');
        setLoading(false);
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch wishlist');
      }
      
      setSavedItems(data.wishlist || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch saved items');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (wishlistReference) => {
    try {
      // Get user ID
      const userId = await checkAuth();
      
      if (!userId) {
        toast.error('Please log in to remove items');
        return;
      }
      
      const res = await fetch(`${BACKEND_URL}/wishlist/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          wishlist_reference: wishlistReference 
        }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to remove item');
      }
      
      // Update local state
      setSavedItems(prevItems => 
        prevItems.filter(item => item.wishlistReference !== wishlistReference)
      );
      
      toast.success('Item removed from saved items');
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
      console.error('Error removing item:', err);
    }
  };

  // Handle buy button click - shows confirmation modal
  const handleBuyClick = (item) => {
    setSelectedItem(item);
    setShowConfirmModal(true);
  };

  // Buy item with confirmation
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
          itemName: selectedItem.title,
          itemPrice: selectedItem.price,
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
          itemName: selectedItem.title,
          itemPrice: selectedItem.price,
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
        setSavedItems(savedItems.filter(item => item._id !== selectedItem._id));
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

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <motion.div 
      className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-indigo-50 to-blue-50'} transition-colors duration-300`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Toaster position="top-center" toastOptions={{
        style: {
          background: isDark ? '#4F46E5' : '#4F46E5',
          color: '#ffffff',
          boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)',
          borderRadius: '10px',
          padding: '16px 24px',
        },
      }} />
      
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Saved Items
          </h1>
          <p className={`text-lg ${isDark ? 'text-blue-300' : 'text-indigo-600'} max-w-xl mx-auto`}>
            Items you've saved for later. Review, remove, or purchase them when you're ready.
          </p>
        </motion.div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`max-w-lg mx-auto p-6 rounded-lg ${isDark ? 'bg-red-900/30 text-red-200 border border-red-800' : 'bg-red-50 text-red-600'} mb-8`}
          >
            <p>{error}</p>
            {!isAuthenticated && (
              <a href="/signin" className="mt-4 inline-block px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Sign In
              </a>
            )}
          </motion.div>
        )}
        
        {loading ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`rounded-xl overflow-hidden shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                    style={{ opacity: 0.3 }}
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className={`h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-md w-3/4`}></div>
                  <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-md w-1/2`}></div>
                  <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-md w-full`}></div>
                  <div className="pt-4 flex justify-between">
                    <div className={`h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-md w-24`}></div>
                    <div className={`h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-md w-24`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {savedItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`max-w-lg mx-auto text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                <svg className={`w-20 h-20 mx-auto mb-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>No saved items yet</h3>
                <p className="mb-6">You haven't saved any items to your wishlist.</p>
                <a href="/home" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Browse Items
                </a>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence>
                  {savedItems.map((item) => (
                    <motion.div
                      key={item._id || item.id || `${item.itemId}-${Date.now()}`}
                      variants={itemVariants}
                      exit="exit"
                      layout
                      className={`${isDark ? 'bg-gray-800 hover:bg-gray-750 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                    >
                      <div className="relative h-48 overflow-hidden bg-gray-200">
                        <img
                          src={item.image || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={item.item_name || "Item"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/300x200?text=Image+Error";
                          }}
                        />
                        <div className="absolute top-0 right-0 m-2">
                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => removeFromWishlist(item._id)}
                            className={`p-1.5 rounded-full ${isDark ? 'bg-gray-800/80 hover:bg-red-900/80' : 'bg-white/80 hover:bg-red-50'} backdrop-blur-sm group`}
                          >
                            <svg className={`w-5 h-5 ${isDark ? 'text-red-400 group-hover:text-red-300' : 'text-red-500 group-hover:text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {item.item_name || "Unnamed Item"}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                          {item.description?.substring(0, 100) || "No description available"}{item.description?.length > 100 ? "..." : ""}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            ₹{item.item_price || "N/A"}
                          </p>
                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => handleBuyClick(item)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-sm"
                          >
                            Buy Now
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>
      
      {/* Purchase confirmation modal */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
    </motion.div>
  );
};

export default SavedItems; 