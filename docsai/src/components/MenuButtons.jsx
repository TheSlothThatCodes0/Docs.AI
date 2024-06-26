import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faFile,
  faPaperclip,
  faPlus,
  faFolderOpen,
  faCopy,
  faRotateLeft,
  faRotateRight,
  faImage,
  faIcons,
  faPhotoFilm,
  faLink,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function MenuButtons() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { id: "edit", icon: faPencil, options: ["New", "Open", "Make a copy"], icons: [faPlus, faFolderOpen, faCopy] },
    { id: "insert", icon: faPaperclip, options: ["Image", "Emoji", "video", "Link"], icons: [faImage, faIcons, faPhotoFilm, faLink]},
  ];

  const handleClick = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleFileClick = () => {
    navigate('/files');
  }
  
  return (
    <div className="fixed left-12 top-40 ">
      <ul className="flex flex-col items-center space-y-8">
        {menuItems.map((item) => (
          <li key={item.id} className="relative">
            <div className="flex items-center">
              <button
                onClick={() => handleClick(item.id)}
                className="focus:outline-none z-50"
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-3xl cursor-pointer w-6 h-6 rounded-full bg-gray-50 backdrop-blur-sm p-2 shadow z-50 shadow-md p-3"
                />
              </button>
              {openDropdown === item.id && (
              <div className="absolute left-full ml-5 py-1 w-40 bg-gray-50 rounded-md shadow-xl z-500 backdrop-blur-sm">
                <ul>
                  {item.options.map((option, index) => (
                    <li
                      key={index}
                      className="cursor-pointer hover:bg-gray-100 p-1 ml-2 text-sm" // Reduced padding here
                    >
                      {item.icons && item.icons[index] && <FontAwesomeIcon icon={item.icons[index]} className="mr-3" style={{color: 'grey'}}/>}
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
          </li>
        ))}


          <button className="focus:outline-none z-50">
            <FontAwesomeIcon
              icon={faFile}
              className="text-3xl cursor-pointer w-6 h-6 rounded-full bg-gray-50 backdrop-blur-sm p-2 shadow z-50 shadow-md p-3"
              onClick={handleFileClick}
            />
          </button>
          <button className="focus:outline-none z-50">
            <FontAwesomeIcon
              icon={faShare}
              className="text-3xl cursor-pointer w-6 h-6 rounded-full bg-gray-50 backdrop-blur-sm p-2 shadow z-50 shadow-md p-3"
            />
          </button>


      </ul>
    </div>
  );
}