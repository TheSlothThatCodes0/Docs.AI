import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, listAll, getDownloadURL, getBlob, deleteObject } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faDownload, faPlus } from "@fortawesome/free-solid-svg-icons";

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const auth = getAuth();
  const storage = getStorage();
  const navigate = useNavigate();

  const handleFileClick = async (file) => {
    try {
      const blob = await getBlob(file.fileContentRef);
      const contentJson = JSON.parse(await blob.text());
      navigate('/editor', { state: { content: contentJson, title: file.fileName } });
    } catch (error) {
      console.error("Error loading file content:", error);
    }
  };

  const handleDelete = async (e, file) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${file.fileName}?`)) {
      try {
        await deleteObject(file.fileContentRef);
        await deleteObject(ref(storage, file.thumbnailURL));
        setFiles(files.filter(f => f.fileName !== file.fileName));
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleDownload = async (e, file) => {
    e.stopPropagation();
    try {
      const blob = await getBlob(file.fileContentRef);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.fileName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userID = user.uid;
        const basePath = `users/${userID}/documents`;

        try {
          const storageRef = ref(storage, basePath);
          const documentRefs = await listAll(storageRef);

          const filesData = await Promise.all(
            documentRefs.prefixes.map(async (folderRef) => {
              const fileName = folderRef.name;
              const fileContentRef = ref(
                storage,
                `${basePath}/${fileName}/file_contents.json`
              );
              const fileThumbnailRef = ref(
                storage,
                `${basePath}/${fileName}/file_thumbnail.png`
              );

              const thumbnailURL = await getDownloadURL(fileThumbnailRef);

              return { fileName, fileContentRef, thumbnailURL };
            })
          );

          setFiles(filesData);
        } catch (error) {
          console.error("Error fetching files:", error);
        }
      } else {
        console.log("User is not authenticated.");
      }
    });
  }, [auth, storage]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Documents</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors duration-200 aspect-[3/4]"
              onClick={() => navigate('/editor')}
            >
              <FontAwesomeIcon icon={faPlus} className="text-4xl mb-2" />
              <span className="text-sm font-medium">Create new document</span>
            </div>
            {files.map((file) => (
              <div
                key={file.fileName}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group relative aspect-[3/4] flex flex-col"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex-grow flex flex-col p-2">
                  <div className="flex-grow overflow-hidden rounded-t-lg">
                    <img
                      src={file.thumbnailURL}
                      alt={`${file.fileName} thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">{file.fileName}</h2>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={(e) => handleDelete(e, file)}
                    className="text-white p-3 rounded-full hover:bg-red-600 transition-colors duration-200 mx-4"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-2xl" />
                  </button>
                  <button 
                    onClick={(e) => handleDownload(e, file)}
                    className="text-white p-3 rounded-full hover:bg-green-600 transition-colors duration-200 mx-4"
                  >
                    <FontAwesomeIcon icon={faDownload} className="text-2xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesPage;