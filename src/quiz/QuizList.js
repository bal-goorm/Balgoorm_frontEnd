import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './QuizList.css';
import { useAuth } from '../user/auth/AuthContext';

function QuizList() {
  const [quiz, setQuiz] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 500 });

    const fetchData = async () => {
      try {
        const response = await axios.get(`https://k618de24a93cca.user-app.krampoline.com/api/quiz/list/${page}?userId=${user.id}`, { withCredentials: true });
        setQuiz(response.data);
      } catch (error) {
        console.error('문제 요청 실패:', error);
      }
    };

    fetchData();
  }, [page, user]);

  useEffect(() => {
    if (dropdownOpen) {
      AOS.refresh();
    }
  }, [dropdownOpen]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setDropdownOpen(false);
  };

  const filteredQuiz = quiz.filter(quizItem => {
    if (filter === 'solved') return quizItem.solved;
    if (filter === 'unsolved') return !quizItem.solved;
    return true;
  });

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-title-container">
          <div>문제 풀어보기</div>
        </div>
        <div className="filter-dropdown">
          <div className={`dropdown ${dropdownOpen ? 'show' : ''}`}>
            <button onClick={toggleDropdown} className="dropdown-toggle">
              {filter === 'all' ? '모든 문제' : filter === 'solved' ? '해결된 문제' : '해결되지 않은 문제'}
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu" data-aos="fade-in">
                <a onClick={() => handleFilterChange('all')}>모든 문제</a>
                <a onClick={() => handleFilterChange('solved')}>해결된 문제</a>
                <a onClick={() => handleFilterChange('unsolved')}>해결되지 않은 문제</a>
              </div>
            )}
          </div>
        </div>

        <div className="quizlist-container">
          <div className="quizlist-header">
            <div className="header-checkbox">완료 여부</div>
            <div className="header-title">퀴즈 이름</div>
          </div>
          <ul className="quizlist">
            {filteredQuiz.map((quizItem) => (
              <li key={quizItem.quizId} className="quizlist-item" data-aos="fade-up">
                <div className="quizlist-checkbox">
                  <input
                    type="checkbox"
                    checked={quizItem.solved}
                    readOnly
                  />
                </div>
                <div className="quizlist-title">
                  <Link to={`/quiz/detail/${quizItem.quizId}`}>
                    {quizItem.quizTitle}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="list-container">
          <Button variant="primary" onClick={handlePreviousPage} disabled={page === 1}>
            이전
          </Button>
          <span>페이지 {page}</span>
          <Button variant="primary" onClick={handleNextPage}>
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizList;
