import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className=" bg-white  flex justify-between shadow-2xl just ">
      <img
        className="  w-12 h-10 m-2.5 ml-10  cursor-pointer"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png"
      />
      <nav className="flex">
        <Link
          className="flex m-3 hover:text-red-500 cursor-pointer "
          href="/Home"
        >
          Home
        </Link>
        <Link
          className="flex m-3 hover:text-red-500 cursor-pointer"
          href="/About"
        >
          About
        </Link>
        <Link
          className="flex m-3 hover:text-red-500 cursor-pointer"
          href="/Services"
        >
          Services
        </Link>
        <Link
          href="/Portfolio"
          className="flex m-3 hover:text-red-500 cursor-pointer"
        >
          Portfolio
        </Link>
        <ul href="/News" className="flex m-3 hover:text-red-500 cursor-pointer">
          News
        </ul>
        <ul className="flex m-3 mr-10 hover:text-red-500 cursor-pointer">
          Contact
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
