/**
 * 회원 탈퇴 페이지
 * 제대로 동작하는지 확인해야됨
 */

import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import logo1 from '../img/Logo1.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './auth/AuthContext.js';
import Cookies from 'js-cookie';

function DeleteAccount() {
  const [password, setPassword] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log('사용자 정보를 불러오는 중...');
    } else {
      console.log('사용자 정보:', user);
    }
  }, [user]);

  const handleDelete = async () => {
    if(!password) {
      alert('비밀번호를 입력하세요');
      return;
    }

    if(!user || user.userId) {
      console.log("유저 정보 불러오기 실패");
    }
    
    if(password) {
      try {
        await axios.delete(`https://k618de24a93cca.user-app.krampoline.com/api/deleteUser/${user.userId}`, {data: user.userId});
        Cookies.remove('token');
        Cookies.remove('role');
        alert("계정이 삭제되었습니다. 그동안 저희 서비스를 이용해주셔서 감사합니다.");
        navigate('/login');
      } catch (error) {
        // alert('계정 삭제 실패', error);
        console.log("계정 삭제 실패", error);
      }
    }
  }

  return (
  <div> 
      <Container className='flex-grow-1'>
        <div className="text-center mb-4 mt-4">
          <img src={logo1} alt="BalGoorm Logo" className='logo-img' />
          <h1 className="mt-2 logo-text">BalGoorm</h1>
        </div>
        
        <div className='border border-2 border-secondary rounded'>
          <Row className='justify-content-center'>
            <Col md={6} className='main-content'>
              <h1 className='text-center fw-bold'>회원탈퇴</h1>
              <br />
              <p className='fs-4'>회원 탈퇴하시면 발구름 관련 모든 서비스에 대한 정보가 사라집니다.</p>
              <p className='fs-4'>위 내용을 확인하셨으면, 비밀번호를 입력하고 회원탈퇴 버튼을 눌러주세요.</p>
              <br />
              <Form>
                <Form.Group as={Row} className="d-flex mb-3">
                  <Form.Label className='fw-bolder' column sm={3}>비밀번호</Form.Label>
                    <Col sm={5}>
                      <Form.Control 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='비밀번호를 입력하세요.' />
                    </Col>
                  </Form.Group>

                  <Button variant="primary" onClick={handleDelete} className="w-100 mt-4">
                    회원 탈퇴
                  </Button>
              </Form>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  )
}

export default DeleteAccount;