import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { motion } from "framer-motion";

const Form = () => {
  const navigate = useNavigate();
  const { isloggedin, setAuthUser, authUser } = useAuth();

  useEffect(() => {
    // Check if user is logged in
    if (!isloggedin) {
      navigate("/Signin");
    }
  }, [isloggedin, navigate]);

  const [data, setData] = useState({
    item_description: "",
    item_name: "",
    item_age: "",
    item_price: "",
    item_image: "",
    item_condition: "",
    item_tag: "",
  });

  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  let name, value;
  const handleInputs = (e) => {
    console.log(e);
    name = e.target.name;
    value = e.target.value;
    setData({ ...data, [name]: value });
  };

  const uploadImage = (e) => {
    if (!e.target.files || !e.target.files[0]) {
      console.log("No file selected");
      return;
    }
    
    console.log("File selected for upload:", e.target.files[0].name);
    
    const datat = new FormData();
    datat.append("file", e.target.files[0]);
    datat.append("upload_preset", "kllpiwre");
    datat.append("cloud_name", "dpwgsbwoi");
    
    console.log("Uploading image to Cloudinary...");
    
    fetch("https://api.cloudinary.com/v1_1/dpwgsbwoi/image/upload", {
      method: "post",
      body: datat,
    })
      .then((resp) => resp.json())
      .then((datat) => {
        console.log("Cloudinary upload successful, URL:", datat.url);
        setUrl(datat.url);

        setData((prevData) => {
          const newData = { ...prevData, item_image: datat.url };
          console.log("Updated form data with new image URL:", newData);
          return newData;
        });
      })
      .catch((err) => {
        console.error("Error uploading image to Cloudinary:", err);
        alert("Failed to upload image. Please try again.");
      });
  };

  const postData = async () => {
    setIsSubmitting(true);
    console.log("Before request - isloggedin:", isloggedin);
    console.log("Current auth user:", authUser);

    // Check if user is properly logged in
    if (!authUser || !authUser._id) {
      // Check current session on the server
      try {
        const sessionCheck = await fetch("http://localhost:5001/current-user", {
          method: "GET",
          credentials: "include",
        });
        
        const sessionData = await sessionCheck.json();
        console.log("Server session check:", sessionData);
        
        if (!sessionData.sessionUserId && !sessionData.hasJwtToken) {
          alert("You don't appear to be properly logged in. Please log in again.");
          navigate("/Signin");
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setIsSubmitting(false);
      }
    }

    const {
      item_condition,
      item_tag,
      item_description,
      item_name,
      item_age,
      item_price,
      item_image,
    } = data;

    // Log the data being sent
    console.log("Sending data to server:", {
      item_condition,
      item_tag,
      item_description,
      item_name,
      item_age,
      item_price,
      item_image,
    });

    // First try to send to server
    try {
      // Get the user ID from AuthContext (currently logged in user)
      const userId = authUser?._id;
      console.log("Current logged in user ID from AuthContext:", userId);
      
      if (!userId) {
        console.warn("No user ID found in AuthContext, the user might not be properly logged in");
      }
      
      // Try the simple endpoint first
      console.log("Attempting to use the simple endpoint with user ID:", userId || "Not provided");
      const simpleRes = await fetch("http://localhost:5001/add_data/simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify({
          item_condition,
          item_tag,
          item_description,
          item_name,
          item_age,
          item_price,
          item_image,
          user_id: userId // Use the current logged-in user's ID
        }),
      });

      if (simpleRes.ok) {
        console.log("Simple endpoint succeeded! Now trying main endpoint...");
        
        // Check if the simple endpoint already stored the item
        const simpleResult = await simpleRes.json();
        console.log("Simple response:", simpleResult);
        
        if (simpleResult && simpleResult.user) {
          console.log("Simple endpoint stored the item successfully!");
          console.log("Updating auth context with user data from simple endpoint");
          setAuthUser(simpleResult.user);
          setIsSubmitting(false);
          window.alert("Item listed successfully and stored on server!");
          navigate("/profile");
          return;
        }
        
        // If simple endpoint works but didn't store the item, try the main endpoint
        const mainRes = await fetch("http://localhost:5001/add_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          mode: "cors",
          body: JSON.stringify({
            item_condition,
            item_tag,
            item_description,
            item_name,
            item_age,
            item_price,
            item_image,
            user_id: userId // Use the current logged-in user's ID
          }),
        });

        if (mainRes.ok) {
          // Server storage succeeded
          console.log("Server storage succeeded!");
          const result = await mainRes.json();
          console.log("Server response with user data:", result);
          
          // Update the AuthContext with the new user data
          if (result && result.user) {
            console.log("Updating auth context with new user data");
            setAuthUser(result.user);
          }
          
          setIsSubmitting(false);
          window.alert("Item listed successfully and stored on server!");
        navigate("/profile");
          return;
        } else {
          console.log("Main endpoint failed, falling back to localStorage");
          const errorText = await mainRes.text();
          console.error("Server response:", errorText);
        }
      } else {
        console.log("Simple endpoint failed, falling back to localStorage");
        const errorText = await simpleRes.text();
        console.error("Server response:", errorText);
      }
      
      // If we get here, server storage failed - use localStorage as fallback
      storeInLocalStorage();
      
    } catch (err) {
      console.error("Server error:", err);
      
      // Fall back to localStorage
      storeInLocalStorage();
    }
  };
  
  // Function to store item in localStorage
  const storeInLocalStorage = () => {
    try {
      // Store the item data in localStorage
      const newItem = {
        item_condition: data.item_condition,
        item_tag: data.item_tag,
        item_description: data.item_description,
        item_name: data.item_name,
        item_age: data.item_age,
        item_price: data.item_price,
        item_image: data.item_image,
        timestamp: new Date().toISOString(),
      };
      
      // Get existing items or initialize empty array
      const savedItems = JSON.parse(localStorage.getItem('pendingItems') || '[]');
      
      // Add new item
      savedItems.push(newItem);
      
      // Save to localStorage
      localStorage.setItem('pendingItems', JSON.stringify(savedItems));
      
      // Show success message
      setIsSubmitting(false);
      window.alert("Item listed successfully! It is stored locally until server connection is restored.");
      
      // Navigate to profile
      navigate("/profile");
    } catch (err) {
      setIsSubmitting(false);
      console.error("Error storing in localStorage:", err);
      window.alert("Failed to list item: " + err.message);
    }
  };

  if (!isloggedin) {
    return <Navigate to="/Signin" />;
  } else {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 right-10 w-64 h-64 rounded-full bg-yellow-300 opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-blue-400 opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-purple-400 opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Form Header with animated badge */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.5
                }}
                className="absolute -top-2 -right-2 bg-yellow-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg"
              >
                Easy & Quick
              </motion.div>
              <h2 className="text-2xl font-bold mb-1">List Your Item</h2>
              <p className="text-violet-100">Share your items with the KiitHub community</p>
              
              {/* Process steps */}
              <div className="flex items-center space-x-2 mt-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center"
                >
                  <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span className="ml-1 text-sm font-medium">Fill Details</span>
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "20px" }}
                  transition={{ delay: 0.8 }}
                  className="h-0.5 bg-indigo-300"
                />
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center"
                >
                  <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span className="ml-1 text-sm font-medium">Upload Photo</span>
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "20px" }}
                  transition={{ delay: 1.0 }}
                  className="h-0.5 bg-indigo-300"
                />
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-center"
                >
                  <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span className="ml-1 text-sm font-medium">Submit</span>
                </motion.div>
              </div>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                postData();
              }}
              className="p-6 space-y-6"
            >
              {/* First Row - Item Name */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                Item Name
              </label>
              <input
                name="item_name"
                value={data.item_name}
                type="text"
                id="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter item name"
                onChange={handleInputs}
                required
              />
              </motion.div>

              {/* Second Row - Age and Price */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label htmlFor="item_age" className="block text-sm font-medium text-gray-700">
                    Item Age (months)
                </label>
                <input
                    type="number"
                  name="item_age"
                    id="item_age"
                  value={data.item_age}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Item age in months"
                  onChange={handleInputs}
                  required
                />
              </div>
                <div>
                  <label htmlFor="item_price" className="block text-sm font-medium text-gray-700">
                    Price (₹)
                </label>
                <input
                    type="number"
                  name="item_price"
                    id="item_price"
                  value={data.item_price}
                  onChange={handleInputs}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Expected price in ₹"
                  required
                />
              </div>
              </motion.div>

              {/* Item Description */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Item Description
              </label>
              <textarea
                name="item_description"
                id="message"
                rows="4"
                value={data.item_description}
                onChange={handleInputs}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your item (condition, features, etc.)"
                  required
              ></textarea>
              </motion.div>

              {/* Category and Condition */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                <Box sx={{ minWidth: 120 }}>
                  <FormControl fullWidth>
                      <InputLabel id="category-select-label">
                        Select Category
                    </InputLabel>
                    <Select
                        labelId="category-select-label"
                        id="category-select"
                      name="item_tag"
                      value={data.item_tag}
                        label="Category"
                      onChange={handleInputs}
                        className="rounded-md"
                        required
                    >
                      <MenuItem value="Stationary">Stationary</MenuItem>
                      <MenuItem value="Sports">Sports</MenuItem>
                      <MenuItem value="Clothing_essentials">
                        Clothing Essentials
                      </MenuItem>
                      <MenuItem value="Books">Books</MenuItem>
                      <MenuItem value="Daily-use">Daily Use</MenuItem>
                      <MenuItem value="Others">Others</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </div>
                <div>
                  <Box>
                    <Typography component="legend" className="block text-sm font-medium text-gray-700 mb-2">
                      Item Condition
                    </Typography>
                  <Rating
                    name="item_condition"
                    value={data.item_condition}
                    onChange={handleInputs}
                      size="large"
                      className="mt-1"
                      required
                  />
                </Box>
              </div>
              </motion.div>

              {/* Image Upload */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="border-2 border-dashed border-indigo-200 rounded-lg p-6 transition-all duration-300 hover:border-indigo-500 focus-within:border-indigo-500 hover:bg-indigo-50/30 group"
              >
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Upload Item Image
              </label>
                <div className="flex flex-col items-center">
              <input
                type="file"
                    id="itemImage"
                    name="item_image"
                    accept="image/*"
                    onChange={uploadImage}
                    className="hidden"
                  />
                  <label 
                    htmlFor="itemImage" 
                    className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-full px-6 py-2.5 transition-all duration-300 transform group-hover:scale-105 flex items-center shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                      <path d="M8 7a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V8a1 1 0 00-1-1H8z" />
                      <path d="M3 10.075V14c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.925l-3.536 3.536a1 1 0 01-1.414 0L8 10.586 5.536 13.05a1 1 0 01-1.414 0L3 11.636v-1.561z" />
                    </svg>
                    Choose Photo
                  </label>
                  <p className="text-xs text-gray-500 mt-2 mb-4">JPEG, PNG or GIF (max. 5MB)</p>
                  
                  {data.item_image ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-2 w-full"
                    >
                      <div className="border rounded-md p-3 bg-white shadow-sm">
                        <p className="text-sm text-gray-600 mb-2 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Image Preview:
                        </p>
                        <div className="relative overflow-hidden rounded-md bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center p-2">
                          <img 
                            src={data.item_image} 
                            alt="Item preview" 
                            className="max-h-60 object-contain mx-auto drop-shadow-sm" 
                            onError={(e) => {
                              console.error("Preview image failed to load");
                              e.target.src = "https://via.placeholder.com/300x200?text=Preview+Not+Available";
                            }}
              />
            </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full max-w-md h-32 flex flex-col items-center justify-center border rounded-md bg-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400">No image selected</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="pt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
              <button
                type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-6 rounded-lg text-white font-medium relative overflow-hidden group
                    ${isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/30'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        List Item Now
                      </span>
                      <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10 group-hover:opacity-20 left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                    </>
                  )}
              </button>
                
                <p className="text-xs text-center text-gray-500 mt-2">
                  By submitting, your item will be visible to all KIIT community members
                </p>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }
};

export default Form;
