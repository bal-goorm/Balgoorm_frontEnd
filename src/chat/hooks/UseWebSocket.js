import { useCallback, useRef, useState } from 'react';
import { useMessage } from '../MessageProvider.js';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';
import { useAuth } from '../../user/auth/AuthContext.js';
import SockJS from 'sockjs-client';

const UseWebSocket = () => {
  const { addMessage } = useMessage(); // MessageProvider에서 제공하는 컨텍스트 사용
  const { fetchedUser } = useAuth(); // 사용자 인증 정보 사용
  const stompClient = useRef(null); // 웹소켓 클라이언트 객체를 useRef를 통해 저장
  const { inputValue, setMessage} = useMessage();
  const [chatCount, setChatCount] = useState(0);

  function wait(ms) {
    return new Promise(waitJoin => {
      setTimeout(waitJoin, ms)
    });
  }

  // 채팅방에 입장하는 함수
  const joinChatRoom = useCallback(() => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send(
        "/api/pub/join",
        {},
        JSON.stringify({
          senderName : fetchedUser.nickname,
          chatBody : ""
        })
      );
      // 입장 메시지를 로컬 상태에 추가
      addMessage({
        senderName: fetchedUser.nickname,
        chatBody: fetchedUser.nickname + "님이 입장하셨습니다.",
        currentUser: true
      });

    }
  }, [addMessage, fetchedUser?.nickname]);

    // 웹소켓 연결 해제 함수
  const disconnect = useCallback(() => {
    console.log("웹소켓 연결해제")
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send(
        "/api/pub/disconnect",
        {},
        JSON.stringify({
          senderName : fetchedUser.nickname,
          chatBody : ""
        })
      );

      stompClient.current.disconnect();
    }
  }, []);
  

  // 웹소켓 연결 함수
  const connect = useCallback(() => {
    const socket = new SockJS("http://localhost:8080/api/chat", {withCredentials:true}); // SockJS를 이용한 소켓 생성
    stompClient.current = Stomp.over(socket); // Stomp 클라이언트 생성 및 소켓 연결

    //실제 연결 시도 하는 부분 
    stompClient.current.connect({}, () => {
      console.log("웹소켓 연결@@")
      // joinChatRoom();
      stompClient.current.subscribe(
        "/api/sub/chat",
        (message) => {
          //구독한 경로로부터 메시지가 들어오는 부분 
          const messageBody = message.body.trim();
          const [senderName, chatBody, chatHour, chatMin, chatSec] = messageBody.split(':');

          if(senderName !== fetchedUser.nickname) {
            addMessage({
              senderName: senderName.trim(),
              chatBody: chatBody.trim(),
              chatHour: chatHour.trim(),
              chatMin: chatMin.trim(),
              chatSec: String(Math.floor(parseFloat(chatSec.trim()))).padStart(2, '0'),
              currentUser: senderName.trim() === fetchedUser.nickname, // 현재 사용자인지 확인
            });
          }
        });

        stompClient.current.subscribe(
          "/api/sub/join",
          (message) => {
            //구독한 경로로부터 메시지가 들어오는 부분 
            const messageBody = message.body.trim();
            const [senderName, chatBody] = messageBody.split(':');

            if(senderName !== fetchedUser.nickname) {
              addMessage({
                senderName: senderName.trim(),
                chatBody: chatBody.trim(),
                currentUser: senderName.trim() === fetchedUser.nickname, // 현재 사용자인지 확인
              });
            }
          });

          stompClient.current.subscribe(
            "/api/sub/disconnect",
            (message) => {
              const messageBody = message.body.trim();
              const [senderName, chatBody] = messageBody.split(':');
  
              if(senderName !== fetchedUser.nickname) {
                addMessage({
                  senderName: senderName.trim(),
                  chatBody: chatBody.trim(),
                  currentUser: senderName.trim() === fetchedUser.nickname, // 현재 사용자인지 확인
                });
              }
            });


      stompClient.current.subscribe(
          "/api/sub/active-users",
          (message) => {
            //구독한 경로로부터 메시지가 들어오는 부분 
            const messageBody = message.body.trim();
            console.log("/api/sub/active-users 에서 들어온 메시지: " + messageBody);
            setChatCount(parseInt(messageBody, 10));
          });

          // async function waitTime(){
          //   await wait(500);
          //   joinChatRoom();
          // }
          // waitTime();
          joinChatRoom();
        }, (error) => {
          console.error('Connection error: ', error); // 연결 실패 시 에러 처리
        }
      );
    }, [addMessage, joinChatRoom, fetchedUser?.nickname]
  );

  const sendMessage = () => {
    if (stompClient.current && stompClient.current.connected) {
      const now = new Date();
      const chatHour = String(now.getHours()).padStart(2, '0');
      const chatMin = String(now.getMinutes()).padStart(2, '0');
      const chatSec = String(now.getSeconds()).padStart(2, '0');

      stompClient.current.send(
        "/api/pub/chat",
        {},
        JSON.stringify({
          senderName : fetchedUser.nickname,
          chatBody : inputValue
        })
      );
      addMessage({
          senderName : fetchedUser.nickname,
          chatBody : inputValue,
          chatHour: chatHour,
          chatMin: chatMin,
          chatSec: chatSec,
          currentUser: true
      })
    };
  };

  // 채팅 히스토리 가져오기 함수
  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/history', {withCredentials:true}); // 채팅 히스토리 요청
      const chatHistory = response.data.reverse(); // 응답 데이터 저장 및 역순 정렬

      console.log("채팅 히스토리", chatHistory)


      if (!fetchedUser?.nickname) {
        return
      }

      // const newMessageList = chatHistory.map(({ senderName, chatBody, chatTime }) => ({
      //   senderName: senderName.trim(),
      //   chatBody: chatBody.trim(),
      //   chatTime,
      //   currentUser: fetchedUser.nickname === senderName.trim()
      // }));

      const newMessageList = chatHistory.map(({ senderName, chatBody, chatTime }) => {
        const [chatHour, chatMin, chatSec] = chatTime.split(':');

        return {
          senderName: senderName.trim(),
          chatBody: chatBody.trim(),
          chatHour: chatHour.trim(),
          chatMin: chatMin.trim(),
          chatSec: String(Math.floor(parseFloat(chatSec.trim()))).padStart(2, '0'),
          currentUser: fetchedUser.nickname === senderName.trim()
        };
      });

      setMessage(newMessageList);
    } catch (error) {
      console.error('failed to fetch chat history', error); // 히스토리 가져오기 실패 시 에러 처리
    }
  }, [setMessage, fetchedUser?.nickname]);

  // sendMessage, connect, disconnect 함수를 외부에 제공
  return { sendMessage, connect, disconnect, fetchChatHistory, joinChatRoom, chatCount };
}

export default UseWebSocket;
