import React from "react";

const datasPortfolio = [
  {
    id: 1,
    imgUrl: "https://cdn.wallpapersafari.com/92/48/J9diP0.jpg",
  },
  {
    id: 2,
    imgUrl:
      "https://e0.pxfuel.com/wallpapers/544/338/desktop-wallpaper-widescreen-pix-1000x1000.jpg",
  },
  {
    id: 3,
    imgUrl: "https://wallpaperaccess.com/full/1289380.png",
  },
  {
    id: 4,
    imgUrl: "https://wallpaperaccess.com/full/2472433.jpg",
  },
  {
    id: 5,
    imgUrl: "https://wallpaper.dog/large/5461716.jpg",
  },
  {
    id: 6,
    imgUrl:
      "https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NXx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80",
  },
];

const hi = () => {
  datasPortfolio.filter((data) => {
    return console.log(data.id % 2 == 1);
  });
};

const Portfolio = () => {
  return (
    <div className="flex flex-col w-3/5 absolute left-1/2 -translate-x-1/2 mt-5">
      <div className="ml-10">
        <p className="text-red-500 text-l">PORTFOLIO</p>
        <h1 className=" text-black text-5xl font-bold mb-10">
          Feautured Works
        </h1>
      </div>
      <div className="">
        <button className="ml-10" onClick={hi}>
          All
        </button>
        <button className="ml-5">Design</button>
        <button className="ml-5">Branding</button>
        <button className="ml-5">Photography</button>
      </div>
      <div className="flex flex-wrap m-5 max-w-screen-2xl">
        {datasPortfolio.map((data) => {
          return <img className="w-80 m-5" src={data.imgUrl} />;
        })}
      </div>
    </div>
  );
};

export default Portfolio;
