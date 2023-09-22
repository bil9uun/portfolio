import React from "react";
import { PiLightbulbFilamentDuotone } from "react-icons/pi";
import { BsLaptop } from "react-icons/bs";
import { FaPaperPlane } from "react-icons/fa";
import { DiPhotoshop } from "react-icons/di";
import { DiIllustrator } from "react-icons/di";
import { TbSocial } from "react-icons/tb";
import ServicesItem from "../components/ServicesItem";

const datas = [
  {
    icon: (
      <PiLightbulbFilamentDuotone style={{ color: "red", fontSize: "60px" }} />
    ),
    h1: "Creative Design",
    p: "Web Design is similar process of creation, with the intention of presenting",
  },
  {
    icon: <BsLaptop style={{ color: "red", fontSize: "60px" }} />,
    h1: "Web Development",
    p: "Web Design is similar process of creation, with the intention of presenting",
  },
  {
    icon: <FaPaperPlane style={{ color: "red", fontSize: "60px" }} />,
    h1: "Brand Identity",
    p: "Web Design is similar process of creation, with the intention of presenting",
  },
  {
    icon: <DiPhotoshop style={{ color: "red", fontSize: "60px" }} />,
    h1: "Adobe Photoshop",
    p: "Web Design is similar process of creation, with the intention of presenting",
  },
  {
    icon: <DiIllustrator style={{ color: "red", fontSize: "60px" }} />,
    h1: "Adobe Illustrator",
    p: "Web Design is similar process of creation, with the intention of presenting",
  },
  {
    icon: <TbSocial style={{ color: "red", fontSize: "60px" }} />,
    h1: "Social Media",
    p: "Web Design is similar process of creation, with the intention of presenting",
  },
];

const Services = () => {
  return (
    <div>
      <div className="ml-10 mt-10">
        <p className="text-red-500 text-l ml-5 mt-5">SERVICES</p>
        <h1 className=" text-black text-5xl font-bold m-5 mb-10">
          Quality Services
        </h1>
      </div>
      <div className="flex flex-wrap justify-center">
        {datas.map((data) => {
          return <ServicesItem data={data} />;
        })}
      </div>
      <p className="text-black text-xl ml-5 mt-5">
        Are you interested in working with me?{" "}
        <a
          href="https://www.facebook.com/bil9uun/"
          target="_ blank"
          className=" underline-offset-5"
        >
          Let's started now
        </a>
      </p>
    </div>
  );
};

export default Services;
