import React from "react";
import Link from "next/link";
import { Typewriter } from "react-simple-typewriter";

function Home() {
  return (
    <>
      <div className="homeSection">
        <img
          className="w-full h-full absolute top-0 -z-10 "
          src="https`://images.hdqwalls.com/wallpapers/mountains-minimal-landscape-4k-5b.jpg"
        />
        <div className=" w-125 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center ">
          <img
            className=" w-60 h-1/3 bor bg-white rounded-full shadow-2xl"
            src="https://w0.peakpx.com/wallpaper/666/961/HD-wallpaper-anime-jujutsu-kaisen-satoru-gojo.jpg"
          />
          <h1 className=" text-5xl mb-0">Bilguun B</h1>
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
        </div>
      </div>
    </>
  );
}

export default Home;
