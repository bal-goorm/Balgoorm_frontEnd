import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './MainPage.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../user/auth/AuthContext';

function MainPage() {
  const { user } = useAuth();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="main-container">
      <div className="main-title" data-aos="fade-down">📘발구름 코딩 테스트</div>
      <div className="site-description" data-aos="fade-up">
        <p>환영합니다! 발구름 코딩 테스트 사이트에 오신 것을 환영합니다. 이곳에서는 다양한 코딩 문제를 통해 실력을 향상시킬 수 있습니다.</p>
      </div>
      {user ? (
        <div className="welcome-message" data-aos="fade-left">
          <p>좌측 메뉴에서 코딩 테스트를 시작해 보세요!</p>
        </div>
      ) : (
        <div className="login-button-container" data-aos="fade-up">
          <Link to="/login" className="login-button">로그인</Link>
          <Link to="/signup" className="login-button">회원가입</Link>
        </div>
      )}
    </div>
  );
}

export default MainPage;
