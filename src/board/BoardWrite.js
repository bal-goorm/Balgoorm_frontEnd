import React, { useState } from 'react';
import axios from 'axios';
import styles from './BoardWrite.module.css';

const BoardWrite = ({ onClose, postToEdit, onPostSubmit }) => {
  const [title, setTitle] = useState(postToEdit ? postToEdit.boardTitle : '');
  const [content, setContent] = useState(postToEdit ? postToEdit.boardContent : '');
  const [category, setCategory] = useState(postToEdit ? postToEdit.category : 'Java'); // 카테고리 관련 상태
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('boardTitle', title);
      formData.append('boardContent', content);
      formData.append('category', category); // 카테고리 추가

      let response;
      if (postToEdit) {
        response = await axios.put(`https://k618de24a93cca.user-app.krampoline.com/api/boards/${postToEdit.boardId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        });
      } else {
        response = await axios.post('https://k618de24a93cca.user-app.krampoline.com/api/boards', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        });
      }

      setTitle('');
      setContent('');
      onClose(); // 폼 닫기
      onPostSubmit(); // 부모 컴포넌트에게 알림
    } catch (error) {
      console.error('Error submitting post:', error);
      if (error.response) {
        console.error('Response headers:', error.response.headers);
        setError('서버 오류가 발생했습니다. 다시 시도해 주세요.');
      } else {
        setError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }
  };

  return (
    <div className={styles.boardWrite}>
      <h3>{postToEdit ? '글 수정' : '새 글 작성'}</h3>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="category" className={styles.label}>카테고리</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.categorySelect}
          >
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="C++">C++</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="title" className={styles.label}>제목</label>
          <input 
            type="text" 
            id="title"
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
