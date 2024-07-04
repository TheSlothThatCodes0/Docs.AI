import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, listAll, getDownloadURL, getBlob, deleteObject } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();
  const storage = getStorage();
  const navigate = useNavigate();

  const handleFileClick = async (file) => {
    try {
      const fileMetadata = metadata[file.id];
      if (!fileMetadata) {
        console.error("Metadata not found for file:", file.id);
        return;
      }

      const blob = await getBlob(file.fileContentRef);
      const contentJson = JSON.parse(await blob.text());
      const filePath = file.fileContentRef.fullPath.replace('/file_contents.json', '');
      
      navigate(`/editor?userID=${currentUser.uid}&fileName=${file.id}`);
    } catch (error) {
      console.error("Error loading file content:", error);
    }
  };

  const handleDelete = async (e, file) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${file.title}?`)) {
      try {
        await deleteObject(file.fileContentRef);
        await deleteObject(ref(storage, file.thumbnailURL));
        await deleteObject(ref(storage, file.metadataRef));
        setFiles(files.filter(f => f.id !== file.id));
        setMetadata(prevMetadata => {
          const newMetadata = {...prevMetadata};
          delete newMetadata[file.id];
          return newMetadata;
        });
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const fetchFiles = async (userID) => {
    const basePath = `users/${userID}/documents`;

    try {
      const storageRef = ref(storage, basePath);
      const documentRefs = await listAll(storageRef);

      const filesData = await Promise.all(
        documentRefs.prefixes.map(async (folderRef) => {
          const fileId = folderRef.name;
          const fileContentRef = ref(
            storage,
            `${basePath}/${fileId}/file_contents.json`
          );
          const fileThumbnailRef = ref(
            storage,
            `${basePath}/${fileId}/file_thumbnail.png`
          );
          const metadataRef = ref(
            storage,
            `${basePath}/${fileId}/metadata.json`
          );

          const metadataBlob = await getBlob(metadataRef);
          const fileMetadata = JSON.parse(await metadataBlob.text());
          const thumbnailURL = await getDownloadURL(fileThumbnailRef);

          // Update the global metadata state
          setMetadata(prevMetadata => ({
            ...prevMetadata,
            [fileId]: fileMetadata
          }));

          return { 
            id: fileId,
            title: fileMetadata.title, 
            fileContentRef, 
            thumbnailURL, 
            metadataRef 
          };
        })
      );

      setFiles(filesData);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchFiles(user.uid);
      } else {
        console.log("User is not authenticated.");
        setCurrentUser(null);
        setFiles([]);
        setMetadata({});
      }
    });

    return () => unsubscribe();
  }, [auth, storage]);

  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="bg-gray-200 flex">
        <img src={require('../assets/logo7.png')} alt='logo' className="h-14 w-auto top-5 left-5 absolute" />
      </div>
      <div className="max-w-[90%] mx-auto py-6 sm:px-6 lg:px-8 relative">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 relative top-10">My Documents</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div 
              className="top-10 relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors duration-200 aspect-[3/4]"
              onClick={() => navigate('/editor')}
            >
              <FontAwesomeIcon icon={faPlus} className="text-4xl mb-2" />
              <span className="text-sm font-medium">Create new document</span>
            </div>
            {files.map((file) => (
          <div
            key={file.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group relative aspect-[3/4] flex flex-col top-10"
            onClick={() => handleFileClick(file)}
          >
            <div className="flex-grow flex flex-col p-2">
              <div className="flex-grow overflow-hidden rounded-t-lg">
                <img
                  src={file.thumbnailURL}
                  alt={`${file.title} thumbnail`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="p-4 bg-white">
              <h2 className="text-xl font-semibold text-gray-900 truncate">{file.title}</h2>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={(e) => handleDelete(e, file)}
                className="text-white p-3 rounded-full hover:bg-red-600 transition-colors duration-200 mx-4"
              >
                <FontAwesomeIcon icon={faTrash} className="text-2xl" />
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