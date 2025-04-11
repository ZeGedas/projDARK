import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import API from '../api/api';
import styles from '../styles/theme.module.css';

const CoverUpload = ({ user, onCoverUpdated }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('cover', file);

      const uploadCover = async () => {
        try {
          await API.post(`/users/${user.id}/cover`, formData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data',
            },
          });
          onCoverUpdated(file.name);
        } catch (err) {
          console.error('Error uploading cover:', err);
        }
      };

      uploadCover();
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <div>
      {isEditing ? (
        <div {...getRootProps()} className={styles.dragAndDropContainer}>
          <input {...getInputProps()} />
          <div className={styles.dragAndDrop}>
            {isDragActive ? (
              <p>Drop the cover here to upload</p>
            ) : (
              <p>Drag & drop your cover here, or click to select</p>
            )}
          </div>
        </div>
      ) : (
        <p></p>
      )}
      <button
        onClick={() => setIsEditing((prev) => !prev)} // Toggling the editing state
        className={styles.buttonEdit}
      >
        {isEditing ? 'Cancel' : 'Edit cover'}
      </button>
    </div>
  );
};

export default CoverUpload;