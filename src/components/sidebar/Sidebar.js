import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { useMessage } from '../../chat/MessageProvider';
import { ChatIcon } from '../../img/ChatIcon';
import UseWebSocket from '../../chat/hooks/UseWebSocket';

function Sidebar() {
  const location = useLocation();
  const { message } = useMessage();
  const isAdminPage = location.pathname === '/admin';
  const isNotChatPage = location.pathname !== '/chat';
  const { connect, joinChatRoom, fetchChatHistory } = UseWebSocket();

  const handleConnect = () => {
    // connect();
    // alert('채팅방에 입장하셨습니다');
    // joinChatRoom();
    // fetchChatHistory();
  }

  return (
    <div className="sidebar">
      <div className="sidebar-container">
        <div className="dashboard">
          Dashboard 
          {/* 이미지? 수정필요 */}
        </div>
        <br />
        <ul>
          <li><Link to="/login">메인 화면</Link></li>
          <li><Link to="/quizlist">문제 풀기</Link></li>
          <li><Link to="/editortest">테스트용 IDE</Link></li>
          <li><Link to="/editor">질의응답 게시판</Link></li>
          <li><Link to="/chat">채팅</Link></li>
          <li><Link to="/editor">Test Menu</Link></li>
          {isAdminPage && (
            <div className="admin-menu">
              <li><Link to="/admin">관리자 메뉴</Link></li>
              <li><Link to="/delete">삭제 메뉴</Link></li>
            </div>
          )}
        </ul>

      </div>
        {isNotChatPage && (
          <div className="chat-wrapper">
            <div className="chat-container">
              <div className="chat-header">
                채팅헤더
                <div className='header-right'>
                  <Link to='/chat' onClick={handleConnect}>
                    <ChatIcon />
                  </Link>
                </div>
              </div>
              <div className='chat-message-div'>
                {message.map(chat => (
                  <div key={chat.chatId} className='chat-message'>
                    <strong>{chat.senderName}</strong>: {chat.chatBody}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default Sidebar;