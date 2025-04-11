import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import API from '../api/api';
import styles from '../styles/theme.module.css';

const CreatePostForm = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');

  // Set up drag and drop functionality with react-dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*,video/*', // Allow only images and videos
    onDrop: (acceptedFiles) => setSelectedFiles(acceptedFiles), // Add dropped files to state
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);

    // Append files if any
    selectedFiles.forEach((file) => {
      formData.append('media', file);
    });

    try {
      await API.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensure that files are sent as form data
          Authorization: `Bearer ${token}`,
        },
      });

      setContent('');
      setSelectedFiles([]);
      onPostCreated(); // Notify parent component that a post was created
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Could not create post');
    }
  };

  return (
    <div className={styles.createPostContainer}>
      <h3 className={styles.formTitle}>Create a new post</h3>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.form}>
        <textarea
          className={styles.textarea}
          rows="4"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        
        {/* Drag-and-drop zone */}
        <div
          {...getRootProps()}
          className={styles.dragAndDropArea}
          style={{
            border: '2px dashed #ccc',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginTop: '10px',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          {!selectedFiles.length ? (
            <p>Drag and drop your files here, or click to select</p>
          ) : (
            <div>
              {selectedFiles.map((file, index) => (
                <p key={index}>{file.name}</p>
              ))}
            </div>
          )}
        </div>
        
        <button className={styles.button} type="submit" disabled={!content.trim() && selectedFiles.length === 0}>
          Post
        </button>
      </form>
    </div>
  );
};

export default CreatePostForm;
