import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faFile,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";

export default function MenuButtons() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const menuItems = [
    { id: "edit", icon: faPencil, options: ["Option 1", "Option 2"] },
    { id: "files", icon: faFile, options: ["Option 1", "Option 2"] },
    { id: "insert", icon: faPaperclip, options: ["Option 1", "Option 2"] },
  ];

  const handleClick = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };
  
  return (
    <div className="fixed left-12 top-40 ">
      <ul className="flex flex-col items-center space-y-8">
        {menuItems.map((item) => (
          <li key={item.id} className="relative">
            <div className="flex items-center">
              <button
                onClick={() => handleClick(item.id)}
                className="focus:outline-none z-10"
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-3xl cursor-pointer w-6 h-6 rounded-full bg-white bg-opacity-20 backdrop-blur-sm p-2 shadow z-50 shadow-md p-3"
                />
              </button>
              {openDropdown === item.id && (
              <div className="absolute left-full top-6 ml-2 py-1 w-64 bg-white rounded-md shadow-2xl z-105"
                  style={{ borderColor: 'gray', borderWidth: 1, borderStyle: 'solid' }}>
                <ul>
                  {item.options.map((option, index) => (
                    <li
                      key={index}
                      className="cursor-pointer hover:bg-gray-100 p-1 ml-2 text-sm" // Reduced padding here
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


