import React from "react";
import { FaBirthdayCake } from "react-icons/fa";
import { FaLocationArrow } from "react-icons/fa";
import { BiBookBookmark } from "react-icons/bi";
import { GoMail } from "react-icons/go";
import { BsFillCalendar2DateFill } from "react-icons/bs";
import { IoLogoGameControllerB } from "react-icons/io";
import { FaUniversity } from "react-icons/fa";
import { AiFillPhone } from "react-icons/ai";
import Item from "../components/AboutItem";
import { Typewriter } from "react-simple-typewriter";
const datasForAbout = [
  {
    icon: <FaBirthdayCake />,
    h1: "Birthday",
    p: "2001.10.30",
  },
  {
    icon: <FaLocationArrow />,
    h1: "Location",
    p: "Ulaanbaatar, Mongolia",
  },
  {
    icon: <BiBookBookmark />,
    h1: "Study",
    p: "Mongolian National University of Medical Science",
  },
  {
    icon: <BsFillCalendar2DateFill />,
    h1: "Age",
    p: "22",
  },
  {
    icon: <GoMail />,
    h1: "Mail",
    p: "bilguunzx011030@gmail.com",
  },
  {
    icon: <IoLogoGameControllerB />,
    h1: "Interests",
    p: "Video Games, Sing",
  },
  {
    icon: <FaUniversity />,
    h1: "Degree",
    p: "Bachelor's",
  },
  {
    icon: <AiFillPhone />,
    h1: "Phone",
    p: "+976 88096710",
  },
];

function About() {
  return (
    <div className="">
      <div className="">
        <p className="text-red-500 text-l ml-5 mt-5">BIOGRAPHY</p>
        <h1 className=" text-black text-5xl font-bold m-5 mb-10">About Me</h1>
      </div>
      <div className="flex ">
        <img
          className="ml-10"
          src="https://w0.peakpx.com/wallpaper/72/62/HD-wallpaper-anime-jujutsu-kaisen-suguru-geto.jpg"
          width={400}
        />
        <div className=" ml-8 flex flex-col justify-center items-center ">
          <h1 className="text-black text-l mb-5 text-xl">
            I'm Bilguun and
            <span className="text-red-500">
              <Typewriter
                words={[" Web Developer", " Doctor"]}
                loop={999}
                cursor
                cursorStyle="_"
                typeSpeed={50}
                deleteSpeed={30}
                delaySpeed={1000}
              />
            </span>
          </h1>
          <p className="mb-5">
            Hi! My name is Albert Walkers. I am a Web Developer, and I'm very
            passionate and dedicated to my work. With 20 years experience as a
            professional Web developer, I have acquired the skills and knowledge
            necessary to make your project a success.
          </p>
          <div className="w-full flex flex-wrap mb-5">
            {datasForAbout.map((data) => {
              return <Item data={data} />;
            })}
          </div>
          <button className="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2">
            Download CV
          </button>
        </div>
      </div>
    </div>
  );
}

export default About;
