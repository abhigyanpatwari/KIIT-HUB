import React from "react";
import "flowbite";
import { Accordion } from "flowbite-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import data from "../components/message.json";
import KnowMore from "./KnowMore";
import { ClassNames } from "@emotion/react";
const image1 = require("../assets/img/icons8-age-100.png");
const image2 = require("../assets/img/icons8-rating-100.png");
const image5 = require("../assets/img/search.ico");

const Listing = () => {
  const navigate = useNavigate();
  let x1 = 0,
    x2 = 0,
    x3 = 0,
    x4 = 0,
    x5 = 0,
    x6 = 0,
    x = 0;

  const [Data, setData] = useState([]);
  const [dat, setdat] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  const CallAboutPage = async () => {
    setIsFetching(true);
    setError(null);
    console.log("Fetching listings...");
    try {
      const res = await fetch("/db", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const object = await res.json();
      console.log("Received listings:", object);
      
      if (!object || !Array.isArray(object)) {
        throw new Error("Invalid data format received from server");
      }
      
      filterr(object);
      setIsFetching(false);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err.message || "Failed to fetch data. Please try again later.");
      setIsFetching(false);
    }
  };

  const searchtags = (e) => {
    if (!Data || Data.length === 0) return;
    
    const searchTerm = e.target.value.toLowerCase();
    const ress = Data.map((element) => {
      return {
        ...element,
        list: element.list.filter((currentVal) => {
          if (!currentVal.item_name) return false;
          return currentVal.item_name.toLowerCase().includes(searchTerm);
        }),
      };
    });
    setdat(ress);
  };

  const filtertags = (val, b) => {
    if (!Data || Data.length === 0) return;
    
    const res = Data.map((element) => {
      return {
        ...element,
        list: element.list.filter((currentVal) => {
          if (val === "") return true;
          return currentVal.item_tag === val;
        }),
      };
    });
    setdat(res);
  };

  const filterr = (object) => {
    if (!object || !Array.isArray(object)) {
      setData([]);
      setdat([]);
      return;
    }
    
    const res = object.filter((currentValue) => {
      return currentValue.list && currentValue.list.length !== 0;
    });
    setData(res);
    setdat(res);
  };

  useEffect(() => {
    CallAboutPage();
  }, []);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-semibold">Loading items...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">{error}</h1>
        <button 
          onClick={CallAboutPage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!Data || Data.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-semibold">No items found</h1>
      </div>
    );
  }

  return (
    <>
      <div className="">
        <div className="flex justify-center bg-[url('https://source.unsplash.com/1600x400/?home')] bg-cover">
          <div className="flex justify-center w-4/5">
            <input
              type="text"
              className="my-36 w-9/12 sm:h-20 rounded-l-xl px-4 outline-none"
              placeholder="Search here..."
              onChange={(e) => searchtags(e)}
            />
            <button className="my-36 sm:h-20 w-20 rounded-l-none rounded-r-xl px-4 bg-sky-600 border-0 hover:bg-sky-700">
              <img className="object-contain py-2 w-10" src={image5} alt="Search" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row bg-bg">
        <div className="w-full lg:w-[340px] bg-white mb-3 mt-3 mr-10 lg:mr-0 lg:ml-3 rounded-sm block lg:sticky top-3 shadow-md shadow-gray-600 h-fit m-auto">
          <Accordion alwaysOpen={true}>
            <Accordion.Panel>
              <Accordion.Title>Filters</Accordion.Title>
              <Accordion.Content>
                <div className="xyz">
                  <div className="ml-3">
                    <div className="text-slate-600 text-[105%]">
                      Choose tag as per your buying needs
                    </div>
                    <div className="gap-6 lg:block">
                      <div className="block my-1">
                        <input
                          type="radio"
                          id="All"
                          name="tag"
                          className="mr-2"
                          onChange={() => filtertags("", !x1)}
                        />
                        All
                      </div>
                      <div className="block my-1">
                        <input
                          type="radio"
                          id="Stationary"
                          name="tag"
                          className="mr-2"
                          onChange={() => filtertags("Stationary", !x)}
                        />
                        Stationary
                      </div>
                      <div className="block my-1">
                        <input
                          type="radio"
                          id="Sports"
                          name="tag"
                          className="mr-2"
                          onChange={() => filtertags("Sports", !x2)}
                        />
                        Sports
                      </div>
                      <div className="block my-1">
                        <input
                          type="radio"
                          id="Clothing"
                          name="tag"
                          className="mr-2"
                          onChange={() => filtertags("Clothing_essentials", !x3)}
                        />
                        Clothing Essentials
                      </div>
                      <div className="block my-1">
                        <input
                          type="radio"
                          id="Daily"
                          name="tag"
                          className="mr-2"
                          onChange={() => filtertags("Daily-use", !x4)}
                        />
                        Daily Use
                      </div>
                    </div>
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Panel>
          </Accordion>
        </div>

        <div className="flex-1 p-4">
          {dat && dat.map((item, index) => (
            <div key={index} className="mb-4">
              {item.list && item.list.map((listItem, listIndex) => (
                <div key={listIndex} className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <h3 className="text-xl font-semibold">{listItem.item_name}</h3>
                  <p className="text-gray-600">{listItem.item_description}</p>
                  <div className="mt-2">
                    <span className="text-blue-600 font-semibold">₹{listItem.item_price}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Listing;
