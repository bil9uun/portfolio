import React from "react";

const Contact = () => {
  return (
    <div className="flex flex-col m-10 h-[calc(100vh-150px)] ">
      <div className=" flex-[3] flex justify-center flex-col">
        <p className="text-red-500 text-l">Contact</p>
        <h1 className=" text-black text-5xl font-bold mb-10">Get in Touch</h1>
      </div>
      <div className=" flex flex-[7]">
        <div className="flex flex-col flex-1 justify-center items-center">
          <p className=" mb-[100px]">
            Please fill out the form on this section to contact with me. Or call
            between 9:00 a.m. and 8:00 p.m. ET, Monday through Friday
          </p>
          <input
            className="border-solid w-full border h-10 mb-10"
            type="text"
            placeholder="Name"
          />
          <input
            className="border-solid border w-full h-10 mb-10"
            type="email"
            placeholder="E-Mail"
          />
          <input
            className=" border-solid border w-full h-32 mb-10"
            type="text"
            placeholder="Message"
          />
          <button className="text-white bg-gradient-to-r w-60 h-12 from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2">
            Send Message
          </button>
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  );
};

export default Contact;
