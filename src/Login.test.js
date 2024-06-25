import React from 'react';
import { server } from './mocks/server';
import { rest } from 'msw'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from './user/Login';
import '@testing-library/jest-dom/extend-expect'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './user/auth/AuthContext';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const mock = new MockAdapter(axios);

// 테스트 설정 구성
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mock.reset();

});
afterAll(() => server.close());

beforeEach(() => {
  window.alert = jest.fn();
});

test('successful login', async () => {
  mock.onPost('https://k618de24a93cca.user-app.krampoline.com/login').reply(200, {
    token: 'fake_token',
    role: 'USER'
  });
  
  render(
    <AuthProvider>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthProvider>
  );

  fireEvent.change(screen.getByPlaceholderText("id 입력"), {target: {value: 'test'}});
  fireEvent.change(screen.getByPlaceholderText("비밀번호 입력"), {target: {value: '1234'}});

  fireEvent.click(screen.getByRole("button", {name: /로그인 버튼/i}));

  await waitFor(() => {
    expect(window.alert).not.toHaveBeenCalled();
  });

 });

 test('failed login', async () => {
  mock.onPost('https://k618de24a93cca.user-app.krampoline.com/login').reply(401, {
    message: 'login failed'
  });

  render(
  <AuthProvider>
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  </AuthProvider>);
  
  fireEvent.change(screen.getByPlaceholderText("id 입력"), { target: { value: 'wrong' } });
  fireEvent.change(screen.getByPlaceholderText("비밀번호 입력"), { target: { value: 'wrong' } });
  
  fireEvent.click(screen.getByRole("button", {name: /로그인 버튼/i}));
  
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith({"message" : "login failed"});
  });
});