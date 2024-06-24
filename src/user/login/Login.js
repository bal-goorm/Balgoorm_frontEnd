/**
 * 로그인 페이지
 * 아이디 찾기 시간되면 만들기
 * 쿠키로 토큰 관리하기
 * 로그인을 하면 마이페이지로 이동하게 설정
 * 관리자 계정으로 로그인하면 관리자 페이지 접근 가능하게 설정
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Container, Form } from 'react-bootstrap';
import { useNavigate} from 'react-router-dom';
import logo1 from "../../img/Logo1.png";
import { useAuth } from '../auth/AuthContext.js';
import './Login.css';

function Login() {
    const { register, handleSubmit, formState: {errors} } = useForm();
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const submitForm = async (data) => {
      const { userId, userPassword }  = data;

      const navigateCallback = (role) => {
        role === "ADMIN"? navigate('/admin') : navigate('/mypage');
      };

      try {
        await login({userId, userPassword}, navigateCallback);
      } catch (error) {
        console.error("error:", error);
      }
    };
    
    return (
    <div>      
      <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="text-center mb-4">
          <img src={logo1} alt="BalGoorm Logo" className="logo-img" />
          <h1 className="logo-text mt-2">BalGoorm</h1>
        </div>
        
        <Form onSubmit={handleSubmit(submitForm)} className="login-form w-100">
          <Form.Group>
            <Form.Label htmlFor='userId'>아이디</Form.Label>
            <Form.Control 
            id="userId" 
            type="text" 
            placeholder="id 입력" 
            aria-label='아이디'
            {...register("userId", {required: "아이디를 입력해주세요"})} />
          </Form.Group>
          {errors.userId && <div className='error-message'>{errors.userId.message}</div>}
          <br />
          
          <Form.Group>
            <Form.Label htmlFor='userPassword'>비밀번호</Form.Label>
            <Form.Control 
            id='userPassword' 
            type="password" 
            placeholder="비밀번호 입력" 
            aria-label='비밀번호' 
            {...register("userPassword", {required: "비밀번호를 입력하세요"})}/>
          </Form.Group>
          {errors.userPassword && <div className='error-message'>{errors.userPassword.message}</div>}

          <Button variant="primary" type="submit" className="w-100 mt-4" aria-label='로그인 버튼'>
            로그인
          </Button>
        </Form>
        
        <div className="mt-3">
          <p>회원이 아니신가요? <a href="signup">회원가입</a></p>
          <p>아이디를 까먹으셨나요? <a href="find">아이디 찾기</a></p>
          <p>비밀번호를 까먹으셨나요? <a href="edit">비밀번호 변경</a></p>
        </div>    
      </Container>
    </div>
  );
}

export default Login;