import React from "react";

const Item = ({ data }) => {
  return (
    <div className="flex w-1/2 flex-wrap">
      <div className="mr-3">{data.icon}</div>
      <h1>{data.h1}</h1>:<p className="ml-2">{data.p}</p>
    </div>
  );
};

export default Item;
