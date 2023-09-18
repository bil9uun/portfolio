import React from "react";

const ServicesItem = ({ data }) => {
  return (
    <div className=" flex flex-col justify-around w-1/4 h-80 m-5 bg-white rounded-xl p-4 ">
      <div className="w-full flex justify-center">{data.icon}</div>
      <h1 className=" font-bold text-xl">{data.h1}</h1>
      <p>{data.p}</p>
    </div>
  );
};

export default ServicesItem;
