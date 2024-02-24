import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase/firebase";

export default function MyComponent() {
  const [value, setValue] = useState('');
  const inputFileRef = useRef(null);
  const editorRef = useRef(null);

  const handleImageSelect = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  async function handleUploadAndInsertImage(e) {
    const img = e.target.files[0];
    if (!img) return; // Validate file selection

    try {
      // Upload the image to Firebase Storage
      const path = `/images/${img.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, img);
      const downloadURL = await getDownloadURL(storageRef);
      console.log(downloadURL);

      // Insert the image into the editor
      const editor = editorRef.current.getEditor();
      const range = editor.getSelection();
      editor.insertEmbed(range ? range.index : 0, 'image', downloadURL);

      console.log('Image uploaded and inserted successfully!');
    } catch (error) {
      console.error('Error uploading or inserting image:', error);
    }
  }

  const modules = {
    toolbar: {
      container: [
        [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
        [{size: []}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, 
         {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'], // Add 'link' to include the link button
        ['clean']
      ],
      handlers: {
        'image': handleImageSelect // Override the default image handler
      }
    }
  };

  return (
    <div>
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={setValue} 
        modules={modules} 
        ref={editorRef}
      />
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={inputFileRef}
        onChange={(e) => handleUploadAndInsertImage(e)}
      />
    </div>
  );
}
