import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ko';  
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import BoardWrite from './BoardWrite';
import BoardPagination from './BoardPagination';
import SearchBar from './SearchBar';
import styles from './Board.module.css';
import { useAuth } from '../user/auth/AuthContext';

moment.locale('ko');  

const Board = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visiblePost, setVisiblePost] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const postsPerPage = 5;

  const fetchPosts = async () => {
    try {
      const response = await axios.get('https://k618de24a93cca.user-app.krampoline.com/api/boards?page=0&pageSize=10&direction=DESC&sortBy=boardCreateDate',  { withCredentials: true });
      setPosts(response.data);
      setDisplayedPosts(response.data.slice(0, postsPerPage));
      setTotalPages(Math.ceil(response.data.length / postsPerPage));
    } catch (error) {
      const tempPost = {
        boardId: 'temp-id',
        boardTitle: '임시 게시물 제목',
        boardContent: '서버에 연결할 수 없어 임시로 추가된 게시물입니다.',
        category: '기타',
        nickname: '관리자',
        boardCreateDate: new Date().toISOString(),
        views: 0,
        likesCount: 0,
        comments: [],
      };
      setPosts([tempPost]);
      setDisplayedPosts([tempPost]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchPosts();

    // localStorage에서 선택된 카테고리 값을 불러오기
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
      setSelectedCategory(savedCategory);
      filterPosts(savedCategory);
    }
  }, []);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    filterPosts(category);
    setCurrentPage(1);

    // localStorage에 선택된 카테고리 값을 저장
    localStorage.setItem('selectedCategory', category);
  };

  const filterPosts = (category) => {
    const filteredPosts = category === 'All' ? posts : posts.filter(post => post.category === category);
    setDisplayedPosts(filteredPosts.slice(0, postsPerPage));
    setTotalPages(Math.ceil(filteredPosts.length / postsPerPage));
  };

  const handleSearch = (searchTerm) => {
    const filteredPosts = posts.filter(post => post.boardTitle.includes(searchTerm));
    setDisplayedPosts(filteredPosts.slice(0, postsPerPage));
    setTotalPages(Math.ceil(filteredPosts.length / postsPerPage));
    setCurrentPage(1);
  };

  const togglePostVisibility = (postId) => {
    setVisiblePost(visiblePost === postId ? null : postId);
  };

  const handleLikeToggle = async (postId, isLiked) => {
    try {
      const response = await axios.post(`https://k618de24a93cca.user-app.krampoline.com/api/posts/${postId}/like`, { isLiked });
      const updatedPosts = posts.map(post =>
        post.boardId === postId ? { ...post, likesCount: response.data.likesCount } : post
      );
      setPosts(updatedPosts);
      filterPosts(selectedCategory);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentUpdate = async (postId) => {
    try {
      const response = await axios.get(`https://k618de24a93cca.user-app.krampoline.com/api/boards/${postId}`);
      const updatedPosts = posts.map(post =>
        post.boardId === postId ? response.data : post
      );
      setPosts(updatedPosts);
      filterPosts(selectedCategory);
    } catch (error) {
    }
  };

  const handleButtonClick = () => {
    if (!user) {
      setShowLoginMessage(true);
      return;
    }
    setIsFormOpen(true);
    setPostToEdit(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleEditButtonClick = (post) => {
    setPostToEdit(post);
    setIsFormOpen(true);
  };

  
  // 삭제
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setIsModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(`https://k618de24a93cca.user-app.krampoline.com/api/boards/${postToDelete.boardId}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
  
      await fetchPosts(); 
      // window.location.reload();  // 페이지 새로고침
    } catch (error) {
      console.error('Error deleting post:', error);
      if (error.response) {
        // alert(`Error: ${error.response.status} - ${error.response.data.message || '게시글 삭제 중 오류가 발생했습니다.'}`);
      } else {
        alert('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setIsModalOpen(false);
      setPostToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setPostToDelete(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIdx = (page - 1) * postsPerPage;
    const endIdx = startIdx + postsPerPage;
    setDisplayedPosts(posts.slice(startIdx, endIdx));
  };

  const handlePostSubmit = async () => {
    await fetchPosts();
    setIsFormOpen(false);
  };

  const handleCloseLoginMessage = () => {
    setShowLoginMessage(false);
  };

  return (
    <div className={styles.boardContainer}>
      <h2 className={styles.boardTitle}>토론</h2>

      <div className={styles.filterContainer}>
        <div className={styles.categoryFilter}>
          <select onChange={handleCategoryChange} value={selectedCategory} className={styles.categorySelect}>
            <option value="All">All</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="C++">C++</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <SearchBar onSearch={handleSearch} />
      </div>

      <ul className={styles.postList}>
        {displayedPosts.map((post) => (
          <li key={post.boardId} className={styles.postItem}>
            <div className={styles.postHeader} onClick={() => togglePostVisibility(post.boardId)}>
              <div className={styles.categoryBox}>{post.category || '기타'}</div>
              <span className={styles.titleText}>{post.boardTitle}</span>
              <div>
                <div className={styles.nicknameContainer}>
                  <FontAwesomeIcon icon={faUser} />
                  <span className={styles.nicknameText}>{post.nickname}</span>
                </div>
                <span className={styles.date}>{moment(post.boardCreateDate).fromNow()}</span>
              </div>
              {visiblePost !== post.boardId && (
                <div className={styles.postMeta}>
                  <span className={styles.likes}>추천 {post.likesCount}</span>  
                  <span className={styles.comments}>댓글 {post.comments.length}</span>
                </div>
              )}
            </div>
            {visiblePost === post.boardId && (
              <div className={styles.postContent}>
                <p>{post.boardContent}</p>
                <LikeButton postId={post.boardId} isLiked={false} onLikeToggle={handleLikeToggle} />
                <CommentSection postId={post.boardId} userId={user ? user.id : null} />
                <div className={styles.editDeleteButtons}>
                  <button onClick={() => handleEditButtonClick(post)} className={styles.editButton}>수정</button>
                  <button onClick={() => handleDeleteClick(post)} className={styles.deleteButton}>삭제</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className={styles.buttonContainer}>
        <button className={styles.newPostButton} onClick={handleButtonClick}>새 글</button>
        {isFormOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <BoardWrite 
                onClose={handleCloseForm} 
                postToEdit={postToEdit} 
                onPostSubmit={handlePostSubmit} 
              />
            </div>
          </div>
        )}
        {showLoginMessage && (
          <div className={styles.modalOverlay}>
            <div className={styles.loginModal}>
              <p>로그인한 사용자만 글을 작성할 수 있습니다.</p>
              <button onClick={handleCloseLoginMessage}>확인</button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>게시글을 삭제하시겠습니까?</p>
            <button onClick={handleConfirmDelete} className={styles.confirmButton}>삭제</button>
            <button onClick={handleCancelDelete} className={styles.cancelButton}>취소</button>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <BoardPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </footer>
    </div>
  );
};

export default Board;
