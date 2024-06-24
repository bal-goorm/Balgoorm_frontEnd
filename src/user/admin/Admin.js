/**
 * 관리자 페이지
 * 오늘 가입자 수
 */

import React, { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import './Admin.css';
import { useAuth } from '../auth/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

function Admin() {
  const { user, allUsers, fetchAllUsers, fetchCount, isLoading } = useAuth();
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    fetchAllUsers();
    fetchCount().then(count => setUserCount(count));
  }, []);

  if(isLoading) {
    return <div>Loading...</div>;
  }

  const handleDeleteUser = async (user) => {
    try {
      await axios.delete(`https://k618de24a93cca.user-app.krampoline.com/api/deleteUser/${user.userId}`, {data: {userId: user.userId}});
      Cookies.remove('token');
      Cookies.remove('role');
      alert("계정이 삭제되었습니다.");
      fetchAllUsers();
    } catch (error) {
      console.log("계정 삭제 실패 ", error);
    }
  }
  
  return (
    <div>
      <div className='d-flex'>
        <div className='ms-5'>
          <h2 className='mt-5 fw-bold'>유저 관리</h2>
          <p>총 회원수: {userCount} 명</p>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th className='column'>아이디</th>
                <th className='column'>닉네임</th>
                <th className='column-email'>이메일</th>
                <th className='column-email'>생성시간</th>
                <th className='column'>방출</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user, index) => (
                <tr key={user.id}>
                  <td className='column-user'>{index + 1}</td>
                  <td className='column-user'>{user.userId}</td>
                  <td className='column-user'>{user.nickname}</td>
                  <td className='column-user'>{user.email}</td>
                  <td className='column-user'>{user.createDate}</td>
                  <td>
                    <Button variant='secondary' onClick={() => handleDeleteUser(user)}>방출</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default Admin;