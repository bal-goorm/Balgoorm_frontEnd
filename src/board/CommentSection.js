import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './CommentSection.module.css';
import { useAuth } from '../user/auth/AuthContext';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`https://k618de24a93cca.user-app.krampoline.com/api/board/${postId}/comment`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      console.error('댓글 내용을 입력해주세요.');
      return;
    }

    if (!user) {
      console.error('사용자가 로그인되지 않았습니다.');
      return;
    }

    const postData = {
      commentContent: newComment,
      nickname: user.nickname,
      userId: user.id,
    };

    try {
      const response = await axios.post(`https://k618de24a93cca.user-app.krampoline.com/api/board/${postId}/comment`, postData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('댓글 등록 중 오류 발생:', error);
      if (error.response) {
        console.error(`서버 오류: ${error.response.status} - ${error.response.data.message}`);
      } else {
        console.error('서버와 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
      }

      // 서버 연결 오류 시 임의로 댓글 추가
      const fakeComment = {
        commentId: Date.now(),
        boardId: postId,
        userId: user.id,
        nickname: user.nickname,
        commentContent: newComment,
        likesCount: 0,
        commentCreateDate: new Date().toISOString(),
      };
      setComments([...comments, fakeComment]);
      setNewComment('');
    }
  };

  const confirmDeleteComment = async () => {
    if (commentToDelete !== null) {
      try {
        await axios.delete(`https://k618de24a93cca.user-app.krampoline.com/api/board/${postId}/comment/${commentToDelete}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });

        setComments(comments.filter(comment => comment.commentId !== commentToDelete));
        setCommentToDelete(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const openModal = (commentId) => {
    setCommentToDelete(commentId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCommentToDelete(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className={styles.commentSection}>
      <ul className={styles.commentList}>
        {comments.map(comment => (
          <li key={comment.commentId} className={styles.commentItem}>
            <div className={styles.commentHeader}>
              <span className={styles.commentAuthor}>{comment.nickname}</span>
              <span className={styles.commentContent}>{comment.commentContent}</span>
              {comment.userId === user?.id && (
                <button
                  className={styles.deleteButton}
                  onClick={() => openModal(comment.commentId)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
        <div className={styles.inputContainer}>
          <div className={styles.userIcon}>
            <FontAwesomeIcon icon={faUser} />
          </div>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={styles.commentInput}
            placeholder="댓글 추가..."
          />
          <button type="submit" className={styles.submitButton}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </form>
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>댓글을 삭제하시겠습니까?</p>
            <div className={styles.modalButtons}>
              <button onClick={confirmDeleteComment} className={styles.confirmButton}>삭제</button>
              <button onClick={closeModal} className={styles.cancelButton}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
