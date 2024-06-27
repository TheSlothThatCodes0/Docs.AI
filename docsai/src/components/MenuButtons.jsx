import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faFile,
  faPaperclip,
  faPlus,
  faFolderOpen,
  faCopy,
  faImage,
  faIcons,
  faPhotoFilm,
  faLink,
  faShare,
  faDownload,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import { useValue } from './TextEditor';

export default function MenuButtons() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const { fullContent, title, quillRef } = useValue();

  const handleDownload = async () => {
    try {
      const quill = quillRef.current.getEditor();
      const delta = quill.getContents(); //gets the contents of the document
  
      const children = delta.ops.map((op) => {
        if (op.insert && typeof op.insert === 'string') {
          return new Paragraph({
            children: [new TextRun(op.insert)],
          });
        } else if (op.insert && op.insert.image) {
          const base64String = op.insert.image.split(',')[1];
          const imageBuffer = Uint8Array.from(atob(base64String), (c) =>
            c.charCodeAt(0)
          );
  
          return new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 300, 
                  height: 300, 
                },
              }),
            ],
          });
        }
        return null;
      }).filter((child) => child !== null);
  
      const doc = new Document({
        sections: [
          {
            properties: {},
            children,
          },
        ],
      });
  
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      alert("Failed to generate DOCX. Please try again.");
    }
  };

  const menuItems = [
    { id: "edit", icon: faPencil, options: ["New", "Open", "Make a copy"], icons: [faPlus, faFolderOpen, faCopy] },
    { id: "insert", icon: faPaperclip, options: ["Image", "Emoji", "video", "Link"], icons: [faImage, faIcons, faPhotoFilm, faLink]},
    { id: "share", icon: faShare, options: ["Download", "Collaborate"], icons: [faDownload, faUserPlus], actions: [handleDownload, null] },
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
                      className="cursor-pointer hover:bg-gray-100 p-1 ml-2 text-sm"
                      onClick={() => item.actions && item.actions[index] && item.actions[index]()}
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
      </ul>
    </div>
  );
}



