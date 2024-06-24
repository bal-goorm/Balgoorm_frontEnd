import { useCallback, useEffect, useRef } from 'react';
import { useMessage } from '../MessageProvider.js';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';
import { useAuth } from '../../user/auth/AuthContext.js';
import SockJS from 'sockjs-client';

const UseWebSocket = () => {
  const { addMessage, setInputValue } = useMessage(); // MessageProvider에서 제공하는 컨텍스트 사용
  const { fetchedUser } = useAuth(); // 사용자 인증 정보 사용
  const stompClient = useRef(null); // 웹소켓 클라이언트 객체를 useRef를 통해 저장

  // 웹소켓 연결 함수
  const connect = useCallback(() => {
    const socket = new SockJS("http://localhost:8080/chat"); // SockJS를 이용한 소켓 생성
    stompClient.current = Stomp.over(socket); // Stomp 클라이언트 생성 및 소켓 연결
    console.log("connect 함수 동작");

    //실제 연결 시도 하는 부분 
    stompClient.current.connect({}, () => {
      stompClient.current.subscribe(
        "/sub/chat",
        (message) => {
          //구독한 경로로부터 메시지가 들어오는 부분 
          // console.log("/sub/chat 에서 들어온 메시지: " + message);
          const messageBody = message.body.trim();
          console.log("/sub/chat 에서 들어온 메시지: " + messageBody);
        }
      )
    }, (error) => {
      console.error('Connection error: ', error); // 연결 실패 시 에러 처리
    });
  }, [addMessage]);

  const sendMessage = () => {
    console.log("sendMessage 조건문 외부");
    if (stompClient.current && stompClient.current.connected) {
      console.log("sendMessage 조건문 내부");
      stompClient.current.send(
        "/pub/chat",
        {},
        JSON.stringify({
          senderName : "testSenderName",
          chatBody : "testChatbody"
        })
      );
    };
  };

  // const subscribe = () => {
  //   // Stomp 클라이언트를 사용하여 서버와 연결
  //   stompClient.current.connect({}, (frame) => {
  //     console.log("connected: ", frame);
      
  //     // "/sub/chat" 주제를 구독하여 새 메시지 수신 대기
  //     stompClient.current.subscribe("/sub/chat", (message) => {
  //       console.log("구독 동작");
  //       const messageBody = message.body.trim();
  //       const [senderName, chatBody] = messageBody.split(": ");
  //       const newMessage = { senderName: senderName.trim(), chatBody: chatBody.trim() };
  //       addMessage(newMessage); // 메시지를 MessageProvider에 추가
  //       console.log("Added message: ", newMessage);
  //     });
  //   }, (error) => {
  //     console.error('Connection error: ', error); // 연결 실패 시 에러 처리
  //   });
  // };

  // 채팅방에 입장하는 함수
  const joinChatRoom = useCallback(() => {
    // if (stompClient.current && stompClient.current.connected && fetchedUser && fetchedUser?.nickname) {
      if (stompClient.current && stompClient.current.connected) {
      // const chatMessage = `${fetchedUser.nickname}: 입장하였습니다.`;
      console.log("채팅방 입장 함수: ");
      stompClient.current.send(
        "pub/chat",
        {},
        JSON.stringify({
          senderName : "testNameJoin",
          chatBody : "testChatBody"
        })); // "/pub/join" 주제로 입장 메시지 전송
    }
  }, [fetchedUser]);

  // 웹소켓 연결 해제 함수
  const disconnect = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.disconnect(() => {
        console.log("Disconnected"); // 연결 해제 완료 시 로그 출력
      });
    }
  }, []);



  // 메시지 전송 함수
  // const sendMessage = (inputValue) => {
  //   console.log("Sending message: ", inputValue);
  //   if (stompClient.current && stompClient.current.connected) {
  //     const senderName = fetchedUser.nickname;
  //     const chatMessage = {
  //       senderName,
  //       chatBody: inputValue
  //     };
  //     stompClient.current.send("/pub/chat", {}, JSON.stringify(chatMessage)); // "/pub/chat" 주제로 메시지 전송
  //     addMessage(chatMessage); // 메시지를 MessageProvider에 추가
  //     setInputValue(''); // 입력값 초기화
  //   }
  // };

  // 채팅 히스토리 가져오기 함수
  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/history'); // 채팅 히스토리 요청
      const chatHistory = response.data; // 응답 데이터 저장
      console.log("Fetched chat history: ", chatHistory);

      chatHistory.forEach(message => {
        const [senderName, chatBody] = message.split(": ");
        const newMessage = {
          senderName: senderName.trim(),
          chatBody: chatBody.trim(),
          currentUser: fetchedUser.nickname === senderName.trim()
        };
        console.log('Adding history message:', newMessage);
        addMessage(newMessage); // 히스토리 메시지를 MessageProvider에 추가
      });
    } catch (error) {
      console.error('failed to fetch chat history', error); // 히스토리 가져오기 실패 시 에러 처리
    }
  }, [addMessage, fetchedUser]);

  // sendMessage, connect, disconnect 함수를 외부에 제공
  return { sendMessage, connect, disconnect };
}

export default UseWebSocket;
