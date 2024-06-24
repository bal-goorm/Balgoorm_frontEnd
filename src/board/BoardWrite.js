import React, { useState } from 'react';
import axios from 'axios';
import styles from './BoardWrite.module.css';

const BoardWrite = ({ onClose, postToEdit, onPostSubmit }) => {
  const [title, setTitle] = useState(postToEdit ? postToEdit.boardTitle : '');
  const [content, setContent] = useState(postToEdit ? postToEdit.boardContent : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('boardTitle', title);
      formData.append('boardContent', content);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };

      let response;
      if (postToEdit) {
        response = await axios.put(`http://localhost:8080/api/boards/${postToEdit.boardId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        });
      } else {
        response = await axios.post('http://localhost:8080/api/boards', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        });
      }
      console.log("Response:", response);

      onPostSubmit(); // 부모 컴포넌트에게 알림
      onClose(); // 폼 닫기
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <div className={styles.boardWrite}>
      <h3>{postToEdit ? '글 수정' : '새 글 작성'}</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>제목</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            placeholder="제목을 입력하세요" 
            className={styles.input}
          />
        </div>
        <div>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
            placeholder="내용을 입력하세요" 
            className={styles.textarea}
          />
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit">{postToEdit ? '수정' : '작성'}</button>
          <button type="button" onClick={onClose}>취소</button>
        </div>
      </form>
    </div>
  );
};

export default BoardWrite;
