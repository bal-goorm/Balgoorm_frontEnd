import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Button, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import 'aos/dist/aos.css';
import AOS from 'aos';
import './EditorPage.css';
import ResponseModal from '../components/modal/Modal';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import defaultValues from './DefaultValues';
import { useAuth } from '../user/auth/AuthContext';
import Board from '../board/Board';

function EditorPage() {
  const { id } = useParams(); // 퀴즈 ID에 해당
  const editorRef = useRef(null);
  const [output, setOutput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseData, setResponseData] = useState({});
  const [quiz, setQuiz] = useState({ quiz_title: '', quiz_content: '', quiz_reg_date: '' });
  const [selectedLanguage, setSelectedLanguage] = useState("JAVA");
  const [editorValue, setEditorValue] = useState(defaultValues.JAVA);
  const [isLanguageContainerVisible, setLanguageContainerVisible] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    AOS.init({ duration: 500 });

    console.log("user :", user);
    console.log("user dbid :", user.id);
    axios.get(`https://k618de24a93cca.user-app.krampoline.com/api/quiz/detail/${id}?userId=${user.id}`, { withCredentials: true } )
      .then(response => {
        const data = response.data;
        console.log('Fetched problem data:', data);
        setQuiz(data);
      })
      .catch(error => {
        console.error('Error fetching problem data:', error);
      });
  }, [id]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function runCode() {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      const requestData = {
        quizId: id,
        language: selectedLanguage,
        code: code,
        userId: user.id
      };
      console.log("reqData :", requestData);
      axios.post("https://k618de24a93cca.user-app.krampoline.com/api/ide/run", requestData, { withCredentials: true })
        .then(response => {
          const data = response.data;
          setOutput(data.result);
          setResponseData(data);
          setIsModalOpen(true);
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleLanguageChange(event) {
    const selectedLang = event.target.value;
    setSelectedLanguage(selectedLang);
    setEditorValue(defaultValues[selectedLang]);
  }

  function toggleLanguageContainer() {
    setLanguageContainerVisible(!isLanguageContainerVisible);
  }

  return (
    <div className="editor-page">
      <div className="problem-container" data-aos="fade-up">
        <Tabs defaultActiveKey="problem" id="problem-tabs">
          {/* <Tab eventKey="basic" title="기본 개념" className="tab-content">
            <div className="basic-content">
              기본 개념 내용
            </div>
          </Tab> */}
          <Tab eventKey="problem" title="문제" className="tab-content">
            <div className="problem-name">
              {quiz.quizTitle}
            </div>
            <div className="problem-content">
              {quiz.quizContent ? quiz.quizContent.split('\\n').map((line, index) => (
                <div key={index}>{line}</div>
              )) : 'Loading...'}
            </div>
            <div className="problem-detail">
              <div className="problem-detail-name">
                코드 실행 결과
              </div>
              <div className="problem-detail-content">
                <p><strong>Answer:</strong> {responseData.answer}</p>
                <p><strong>Correct:</strong> {responseData.correct === undefined ? '' : responseData.correct ? '정답' : '오답. 위 정답을 참고해서 다시 작성이 필요'}</p>
                <p><strong>Memory Usage:</strong> {responseData.memoryUsage}</p>
                <p><strong>Result:</strong> {responseData.result}</p>
                <p><strong>Run Time:</strong> {responseData.runTime}</p>
              </div>
            </div>
          </Tab>
          <Tab eventKey="qnaboard" title="질의응답">
            <div className="placeholder-content">
            <Board /> 
              {/* 여기에 나중에 내용을 추가할 수 있습니다 */}
            </div>
          </Tab>
        </Tabs>
      </div>

      <div className="editor-container" data-aos="fade-left">
        <div className="horizontal-menu">
          <div className="language-selection-text">언어 선택</div>
          {isLanguageContainerVisible ? (
            <div className="language-container fade-in" data-aos="fade-left"
            >
              <div>
                <input
                  type="radio"
                  id="java"
                  name="language"
                  value="JAVA"
                  checked={selectedLanguage === "JAVA"}
                  onChange={handleLanguageChange}
                />
                <label htmlFor="java">Java</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="python"
                  name="language"
                  value="PYTHON"
                  checked={selectedLanguage === "PYTHON"}
                  onChange={handleLanguageChange}
                />
                <label htmlFor="python">Python</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="cpp"
                  name="language"
                  value="CPP"
                  checked={selectedLanguage === "CPP"}
                  onChange={handleLanguageChange}
                />
                <label htmlFor="cpp">C++</label>
              </div>
              <ArrowLeftIcon onClick={toggleLanguageContainer} />
            </div>
          ) : (
            <ArrowRightIcon
              onClick={toggleLanguageContainer}
              data-aos="fade-right"
            />
          )}
        </div>

        <div className="editor-box">
          <Editor
            width="100%"
            height="100%"
            language={selectedLanguage.toLowerCase()}
            theme="vs-dark"
            value={editorValue}
            onMount={handleEditorDidMount}
            options={{
              padding: {
                top: 10
              }
            }}
          />
        </div>
        <div className="run-btn">
          <Button variant="outline-dark" onClick={runCode}>답안제출</Button>
        </div>
        <div className="output-container">
          <div className="output-title">Output: {output}</div>
        </div>
        <ResponseModal
          show={isModalOpen}
          onHide={closeModal}
          responseData={responseData}
        />
      </div>
    </div>
  );
}

export default EditorPage;
