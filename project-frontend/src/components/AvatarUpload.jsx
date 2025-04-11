import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import API from '../api/api';
import styles from '../styles/theme.module.css';

const AvatarUpload = ({ user, onAvatarUpdated }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Būsenos valdymas, kad rodyti drag and drop tik tada, kai paspaudžiamas Edit

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('avatar', file);

      const uploadAvatar = async () => {
        try {
          await API.post(`/users/${user.id}/avatar`, formData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data',
            },
          });
          onAvatarUpdated(file.name);
        } catch (err) {
          console.error('Error uploading avatar:', err);
        }
      };

      uploadAvatar();
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
              <p>Drop the avatar here to upload</p>
            ) : (
              <p>Drag & drop your avatar here, or click to select</p>
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
        {isEditing ? 'Cancel' : 'Edit avatar'}
      </button>
    </div>
  );
};

export default AvatarUpload;