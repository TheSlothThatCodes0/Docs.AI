import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, listAll, getDownloadURL, getBlob } from "firebase/storage";
import { useNavigate } from "react-router-dom";


const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const auth = getAuth();
  const storage = getStorage();
  const navigate = useNavigate();

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

  const handleFileClick = async (file) => {
    try {
      

      const blob = await getBlob(file.fileContentRef);
      const contentJson = JSON.parse(await blob.text());
      navigate('/editor', { state: { content: contentJson, title: file.fileName } });
    } catch (error) {
      console.error("Error loading file content:", error);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="p-6 flex flex-wrap gap-6 overflow-x-auto">
        <h1 className="text-2xl font-bold w-full mb-4">Your Documents</h1>
        {files.map((file) => (
          <div
            key={file.fileName}
            className="border p-2 rounded-md shadow-md max-w-[200px] bg-white cursor-pointer"
            onClick={() => handleFileClick(file)}
          >
            <img
              src={file.thumbnailURL}
              alt={`${file.fileName} thumbnail`}
              className="w-full h-[150px] object-cover rounded-t-md"
            />
            <div className="p-2">
              <h2 className="text-lg font-semibold">{file.fileName}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesPage;