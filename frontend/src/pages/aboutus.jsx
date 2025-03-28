import React from "react";
import illus from "../assets/img/illus.svg";
import handshake from "../assets/img/handshake.jpg";
import group from "../assets/img/group.png";
import av1 from "../assets/Avatar/av_1.svg";
import av2 from "../assets/Avatar/av_2.svg";
import av3 from "../assets/Avatar/av_3.svg";
import av4 from "../assets/Avatar/av_4.svg";

const Aboutus = () => {
  return (
    <div>
      <div>
        {/* Section - 1 */}
        <div className="w-full h-[40rem] mb-[10rem]">
          <div className="h-[10rem] pt-16 text-center  mx-auto text-3xl font-bold">
            <h1>"KIIT-HUB: Empowering Campus Commerce for New & Pre-Loved Treasures"</h1>
          </div>
          <div>
            <div className="w-[35%] float-left h-[30rem] text-center">
              <ul className="pt-[3rem]">
                <ul>
                  <li>
                    <h1 className="text-[4rem] font-medium">150+</h1>
                  </li>
                  <li>
                    <h3 className="text-[1.5rem] text-gray-500 mb-[3rem]  ">
                      Products Available
                    </h3>
                  </li>
                </ul>
                <ul>
                  <li>
                    <h1 className="text-[4rem] font-medium">50+</h1>
                  </li>
                  <li>
                    <h3 className="text-[1.5rem] text-gray-500 mb-[3rem]">
                      Customers Served
                    </h3>
                  </li>
                </ul>
              </ul>
            </div>
            <div className="w-[30%] float-left h-[30rem] text-center">
              <img src={group} alt="description-image" />
            </div>
            <div className="w-[35%] float-right h-[30rem] text-center">
              <ul className="pt-[3rem]">
                <ul>
                  <li>
                    <h1 className="text-[4rem] font-medium">100%</h1>
                  </li>
                  <li>
                    <h3 className="text-[1.5rem] text-gray-500 mb-[3rem]">
                      in-house & independent
                    </h3>
                  </li>
                </ul>
                <ul>
                  <li>
                    <h1 className="text-[4rem] font-medium">KIIT Bhubaneswar</h1>
                  </li>
                  <li>
                    <h3 className="text-[1.5rem] text-gray-500 mb-[3rem]">
                      Working Locally Right Now
                    </h3>
                  </li>
                </ul>
              </ul>
            </div>
          </div>
        </div>
        {/* Section - 2 */}
        <div className="w-full h-full">
          {/* Cards - 1 */}
          <div className="flex flex-col sm:flex-row ">
            <div className=" w-[100%] sm:w-[25%] h-[30rem] ml-[7%] mr-[5%] m-[auto] k rotate-3">
              <div class="max-w-sm rounded overflow-hidden shadow-lg">
                <img
                  class="w-full bg-green-200"
                  src={av1}
                  alt="Sunset in the mountains"
                />
                <div class="px-6 py-1 bg-green-200">
                  <div class="font-bold text-xl mb-2">The Coldest Sunset</div>
                  <p class="text-gray-700 text-base">
                  Capture the magic of campus life even after hours! At KiitHub, we celebrate late-night study sessions, weekend adventures, and everything in between. Whether you’re trading a gently-used item or discovering a hidden gem, each transaction lights up your college journey. Let “The Coldest Sunset” be a reminder that, even when the sun goes down, the spirit of our student marketplace keeps glowing.
                  </p>
                </div>
                <div class="px-6 pt-4 pb-2 bg-green-200">
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #photography
                  </span>
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #travel
                  </span>
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #winter
                  </span>
                </div>
              </div>
            </div>
            <div className=" w-[100%] sm:w-[50%] h-[30rem] mr-[7%] m-[auto]">
              <h2 className="text-4xl text-center pt-[15%] font-bold">
                Where Campus Meets Convenience
              </h2>
              <p className="text-xl text-center mt-16">
              KiitHub was founded on the belief that students deserve a safe, hassle-free way to find what they need—and pass on what they no longer use. We offer a user-friendly platform where you can list your items, explore great deals, and meet fellow students in a secure environment. Whether you’re decluttering your dorm or searching for a bargain, KiitHub is here to make campus life easier.
              </p>
            </div>
          </div>
          {/* Cards - 2 */}
          <div className="flex flex-col-reverse sm:flex-row ">
            <div className=" w-[100%] sm:w-[50%] h-[30rem] mr-[7%] m-[auto]">
              <h2 className="text-4xl text-center pt-[15%] font-bold">
              Connecting Students, Building Community
              </h2>
              <p className="text-xl text-center mt-16">
              We’re more than just a marketplace; we’re a community hub that brings KIIT students closer together. KiitHub encourages everyone to swap stories, share resources, and support each other’s entrepreneurial spirit. Our goal is to help you save money, earn extra cash, and contribute to a more sustainable future—one transaction at a time.
              </p>
            </div>
            <div className=" w-[100%] sm:w-[25%] h-[30rem] ml-[7%] mr-[5%] m-[auto] k rotate-[-3deg]">
              <div class="max-w-sm rounded overflow-hidden shadow-lg">
                <img
                  class="w-full bg-green-200"
                  src={av2}
                  alt="Sunset in the mountains"
                />
                <div class="px-6 py-1 bg-green-200">
                  <div class="font-bold text-xl mb-2">Midnight Catalyst</div>
                  <p class="text-gray-700 text-base">
                  In the quiet hours when the campus sleeps, something extraordinary awakens. The Midnight Catalyst symbolizes those unexpected moments of ingenuity and connection—when ideas spark and opportunities ignite. It’s a nod to the energy that fuels late-night study sessions, spontaneous collaborations, and the drive to transform challenges into breakthroughs. Let this be a reminder that even in darkness, new beginnings and vibrant possibilities are just a spark away.
                  </p>
                </div>
                <div class="px-6 pt-4 pb-2 bg-green-200">
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #photography
                  </span>
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #travel
                  </span>
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #winter
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Cards - 3 */}
          <div className="flex flex-col sm:flex-row ">
            <div className=" w-[100%] sm:w-[25%] h-[30rem] ml-[7%] mr-[5%] m-[auto] k rotate-3">
              <div class="max-w-sm rounded overflow-hidden shadow-lg">
                <img
                  class="w-full bg-green-200"
                  src={av3}
                  alt="Sunset in the mountains"
                />
                <div class="px-6 py-1 bg-green-200">
                  <div class="font-bold text-xl mb-2">The KIIT Campus Alchemy</div>
                  <p class="text-gray-700 text-base">
                  At KiitHub, everyday transactions turn into transformative experiences. The Campus Alchemy celebrates the art of converting unused items and ideas into golden opportunities. It's where creativity meets resourcefulness, and every exchange fuels a community of innovation on campus.
                  </p>
                </div>
                <div class="px-6 pt-4 pb-2 bg-green-200">
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #photography
                  </span>
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #travel
                  </span>
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #winter
                  </span>
                </div>
              </div>
            </div>
            <div className=" w-[100%] sm:w-[50%] h-[30rem] mr-[7%] m-[auto]">
              <h2 className="text-4xl text-center pt-[15%] font-bold">
              KiitHub: Empowering Student Commerce
              </h2>
              <p className="text-xl text-center mt-16">
              At KiitHub, we connect the KIIT community through a dedicated platform for buying and selling both pre-loved and brand-new items. From textbooks and gadgets to unique handmade crafts, our mission is to foster a budget-friendly, eco-conscious marketplace right on campus. By enabling students to trade locally, we’re reducing waste, encouraging sustainability, and strengthening our vibrant student network.
              </p>
            </div>
          </div>
          {/* Cards - 4 */}
          <div className="flex flex-col-reverse sm:flex-row ">
            <div className=" w-[100%] sm:w-[50%] h-[30rem] mr-[7%] m-[auto]">
              <h2 className="text-4xl text-center pt-[15%] font-bold">
              Your One-Stop Campus Marketplace
              </h2>
              <p className="text-xl text-center mt-16">
              From essential study materials and electronics to fashion and sports gear, KiitHub is the go-to platform for all your campus needs. We’re driven by the idea that trading items within a trusted community benefits everyone—reducing costs, promoting reuse, and forging meaningful connections among students.
              </p>
            </div>
            <div className=" w-[100%] sm:w-[25%] h-[30rem] ml-[7%] mr-[5%] m-[auto] k rotate-[-3deg]">
              <div class="max-w-sm rounded overflow-hidden shadow-lg">
                <img
                  class="w-full bg-green-200"
                  src={av4}
                  alt="Sunset in the mountains"
                />
                <div class="px-6 py-1 bg-green-200">
                  <div class="font-bold text-xl mb-2">The KIIT Convergence</div>
                  <p class="text-gray-700 text-base">
                  Imagine a place where innovation, opportunity, and community seamlessly merge. At The KIIT Convergence, every trade and transaction weaves together diverse talents and ideas from across campus, sparking fresh connections and inspiring growth. It's not just a marketplace—it’s where the collective energy of KIIT students comes together to create lasting impact and shared success.
                  </p>
                </div>
                <div class="px-6 pt-4 pb-2 bg-green-200">
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #photography
                  </span>
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #travel
                  </span>
                  <span class="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #winter
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Section - 3 */}
        <div className="w-full h-[50rem] text-center pt-[5rem]">
          <img className="w-[40%] m-[auto]" src={handshake} alt="grp-pic" />
        </div>
      </div>
    </div>
  );
};

export default Aboutus;
