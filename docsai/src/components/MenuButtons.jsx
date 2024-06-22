import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faFile,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";

export default function MenuButtons() {
  const handleClick = (iconName) => {
    console.log(`${iconName} icon clicked`);
  };

  return (
    <div className="fixed left-12">
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={() => handleClick("edit")}
          className="focus:outline-none"
        >
          <FontAwesomeIcon
            icon={faPencil}
            className="text-3xl cursor-pointer w-6 h-6 rounded-full bg-white bg-opacity-20 backdrop-blur-sm p-2 shadow z-50 shadow-md p-3"
          />
        </button>
        <button
          onClick={() => handleClick("files")}
          className="focus:outline-none"
        >
          <FontAwesomeIcon icon={faFile} className="text-3xl cursor-pointer w-6 h-6 rounded-full bg-white bg-opacity-20 backdrop-blur-sm p-2 shadow z-50 shadow-md p-3" />
        </button>
        <button
          onClick={() => handleClick("insert")}
          className="focus:outline-none"
        >
          <FontAwesomeIcon
            icon={faPaperclip}
            className="text-3xl cursor-pointer w-6 h-6 rounded-full bg-white bg-opacity-20 backdrop-blur-sm p-2 shadow z-50 shadow-md p-3"
          />
        </button>
      </div>
    </div>
  );
}
