import React, { useState, useEffect } from "react";
import { Carousel } from "flowbite-react";
import MDImg2 from "../assets/img/boyimage.avif";
import MDImg from "../assets/img/boyimage.webp";
import MDImg3 from "../assets/img/girlimage.avif";
const backendUrl = "http://localhost:5001";

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default testimonials data
  const defaultTestimonials = [
    {
      name: "Harsh Shandilya",
      avatar: MDImg,
      text: "KIITHUB has revolutionized how I buy and sell items at KIIT... Highly recommend!"
    },
    {
      name: "Priya Sharma",
      avatar: MDImg3,
      text: "As a first-year student, KIITHUB helped me find affordable supplies. The community is amazing, and transactions are smooth."
    },
    {
      name: "Rahul Verma",
      avatar: MDImg2,
      text: "What I love about KIITHUB is the sense of trust. You're dealing with fellow students, so it's always a comfortable experience. I've found so many great deals here!"
    }
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      
      try {
        // Get testimonials from localStorage
        const localTestimonials = JSON.parse(localStorage.getItem('testimonials') || '[]');
        
        // Attempt to fetch from backend
        try {
          const response = await fetch(`${backendUrl}/testimonials`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Combine backend testimonials with default and local ones
            const allTestimonials = [
              ...defaultTestimonials,
              ...localTestimonials,
              ...(data.testimonials || [])
            ];
            
            setTestimonials(allTestimonials);
          } else {
            // If backend fetch fails, combine default and local
            setTestimonials([...defaultTestimonials, ...localTestimonials]);
          }
        } catch (err) {
          console.error("Error fetching testimonials from backend:", err);
          // If backend fetch fails, combine default and local
          setTestimonials([...defaultTestimonials, ...localTestimonials]);
        }
      } catch (error) {
        console.error("Error processing testimonials:", error);
        setError("Failed to load testimonials");
        setTestimonials(defaultTestimonials);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (isLoading) {
    return (
      <div className="relative min-h-screen py-12 bg-gradient-to-r from-gray-900 via-black to-[#c7cdd6] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-12 bg-gradient-to-r from-gray-900 via-black to-[#c7cdd6]">
      {/* Optional overlay on top of the background gradient */}
      <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>

      <div className="container relative mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Testimonials
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 drop-shadow-md">
            What our students say about KIITHUB
          </p>
        </div>

        {/* Carousel container with floating animation */}
        <div className="h-[60vh] max-w-5xl mx-auto relative animate-floatUpDown hover:animate-floatSideToSide transition-all duration-700 ease-in-out">
          <Carousel
            slide={false}
            indicators={true}
            leftControl={
              <button
                className="
                  absolute 
                  left-[-100px] 
                  top-1/2 
                  transform -translate-y-1/2 
                  px-6 py-3 
                  bg-gradient-to-r from-pink-500 to-red-500 
                  text-white 
                  font-semibold 
                  rounded-full 
                  shadow-lg 
                  hover:scale-105 
                  transition-transform 
                  duration-300
                "
              >
                Prev
              </button>
            }
            rightControl={
              <button
                className="
                  absolute 
                  right-[-100px] 
                  top-1/2 
                  transform -translate-y-1/2 
                  px-6 py-3 
                  bg-gradient-to-r from-blue-500 to-green-500 
                  text-white 
                  font-semibold 
                  rounded-full 
                  shadow-lg 
                  hover:scale-105 
                  transition-transform 
                  duration-300
                "
              >
                Next
              </button>
            }
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex items-center justify-center h-full">
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 w-[95%] h-[95%] mx-auto shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center justify-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-60 h-60 rounded-full object-cover border-6 border-black/10 mb-4"
                  />
                  <div className="text-center">
                    <h3 className="text-4xl font-bold text-gray-800 mb-2">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-700">
                      "{testimonial.text}"
                    </p>
                    {testimonial.date && (
                      <p className="text-sm text-gray-500 mt-4">
                        {new Date(testimonial.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* Floating Animations */}
      <style>
        {`
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-floatUpDown {
          animation: floatUpDown 3s infinite ease-in-out;
        }

        @keyframes floatSideToSide {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(10px); }
        }
        .hover\\:animate-floatSideToSide:hover {
          animation: floatSideToSide 1.5s infinite ease-in-out;
        }
        `}
      </style>
    </div>
  );
}

export default Testimonials;
