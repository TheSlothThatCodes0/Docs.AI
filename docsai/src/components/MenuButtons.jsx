import React, { useState, useRef } from "react";
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
  faDownload,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import { useValue } from "./TextEditor";
import ReactQuill from "react-quill";
import mammoth from "mammoth";
import axios from "axios";

export default function MenuButtons() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const { fullContent, title, quillRef, userID, fileName, docPath } = useValue();
  const fileInputRef = useRef(null);

  const handleDownload = async () => {
    try {
      const quill = quillRef.current.getEditor();
      const delta = quill.getContents(); // Gets the contents of the document

      const children = delta.ops
        .map((op) => {
          if (op.insert && typeof op.insert === "string") {
            let text = op.insert;
            let formatting = {};

            // Check for text formatting
            if (op.attributes) {
              formatting = {};

              // Example: Handling bold and italic formatting
              if (op.attributes.bold) {
                formatting.bold = true;
              }
              if (op.attributes.italic) {
                formatting.italic = true;
              }
              // Handle font size
              if (op.attributes.fontSize) {
                formatting.size = op.attributes.fontSize + "px";
              }
              // Add more attributes handling as needed (underline, color, etc.)
            }

            return new Paragraph({
              children: [
                new TextRun({
                  text,
                  ...formatting, // Apply formatting options
                }),
              ],
            });
          } else if (op.insert && op.insert.image) {
            const base64String = op.insert.image.split(",")[1];
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
        })
        .filter((child) => child !== null);

      const doc = new Document({
        sections: [
          {
            properties: {},
            children,
          },
        ],
      });

      // Generate and download the document
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
    }
  };

  const handleNew = () => {
    if (
      window.confirm(
        "Are you sure you want to create a new document? Unsaved changes will be lost."
      )
    ) {
      if (quillRef.current) {
        quillRef.current.getEditor().setText("");
      }
    }
  };

  const handleOpen = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.html,.docx";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            if (file.name.endsWith(".docx")) {
              const arrayBuffer = event.target.result;
              const result = await mammoth.convertToHtml({
                arrayBuffer: arrayBuffer,
              });
              quill.clipboard.dangerouslyPasteHTML(result.value);
            } else {
              const content = event.target.result;
              quill.setText(content);
            }
          }
        };
        if (file.name.endsWith(".docx")) {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsText(file);
        }
      }
    };
    input.click();
  };

  const handleInsertImage = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", e.target.result, "user");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      quill.formatText(range.index, range.length, "link", url);
    }
  };

  const menuItems = [
    { 
      id: "edit", 
      icon: faPencil, 
      options: ["New", "Open"], 
      icons: [faPlus, faFile],
      actions: [handleNew, handleOpen]
    },
    {
      id: "insert",
      icon: faPaperclip,
      options: ["Image", "Link"],
      icons: [faImage, faLink],
      actions: [handleInsertImage, handleInsertLink],
    },
  ];

  const handleClick = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleFileClick = () => {
    navigate("/files");
  };

  const handleColabourationClick = async () => {
    const email = prompt(
      "Enter the email of the user you want to share the document with:"
    );
    if (email) {
      console.log("Sharing document with:", email);
    }

    if (email) {
      try {
        const response = await axios.post(
          "http://34.16.205.25:5001/api/send-colaboration-link",
          {
            email: email,
            userID: userID,
            fileName: fileName,
          }
        );

        navigate(`/collaborate?userID=${userID}&fileName=${fileName}`)
      } catch (error) {
        console.error("Error sending collaboration link:", error);
        alert("Failed to send collaboration link");
      }
    }
  };

  return (
    <div className="fixed left-6 top-52 bg-white rounded-3xl shadow-lg p-4">
      <ul className="flex flex-col items-center space-y-6">
        {menuItems.map((item) => (
          <li key={item.id} className="relative">
            <button
              onClick={() => handleClick(item.id)}
              className="focus:outline-none transition-all duration-200 ease-in-out"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full border border-gray-200">
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-gray-600 w-5 h-5"
                />
              </div>
            </button>
            {openDropdown === item.id && (
              <div className="absolute left-full ml-2 top-0 py-2 w-48 bg-white rounded-lg shadow-lg z-50">
                <ul>
                  {item.options.map((option, index) => (
                    <li
                      key={index}
                      className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm flex items-center"
                      onClick={() => {
                        if (item.actions && item.actions[index]) {
                          item.actions[index]();
                        }
                        setOpenDropdown(null);
                      }}
                    >
                      {item.icons && item.icons[index] && (
                        <FontAwesomeIcon
                          icon={item.icons[index]}
                          className="mr-3 text-gray-500"
                        />
                      )}
                      <span className="text-gray-700">{option}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
        <li>
          <button
            onClick={handleDownload}
            className="focus:outline-none transition-all duration-200 ease-in-out"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full border border-gray-200">
              <FontAwesomeIcon
                icon={faDownload}
                className="text-gray-600 w-5 h-5"
              />
            </div>
          </button>
        </li>
        <li>
          <button
            onClick={handleColabourationClick}
            className="focus:outline-none transition-all duration-200 ease-in-out"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full border border-gray-200">
              <FontAwesomeIcon
                icon={faUserPlus}
                className="text-gray-600 w-5 h-5"
              />
            </div>
          </button>
        </li>
        <li>
          <button
            onClick={handleFileClick}
            className="focus:outline-none transition-all duration-200 ease-in-out"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full border border-gray-200">
              <FontAwesomeIcon
                icon={faFolderOpen}
                className="text-gray-600 w-5 h-5"
              />
            </div>
          </button>
        </li>
      </ul>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  );
}
