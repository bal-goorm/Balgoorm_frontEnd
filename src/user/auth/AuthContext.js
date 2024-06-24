import axios from 'axios';
import React, { useState, createContext, useContext, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie';

const AuthContext = createContext({
    user: null,
    signup: () => {},
    login: () => {},
    logout: () => {},
    setAuthToken: () => {},
    setUserRole: () => {},
    loadUserInfo: () => {},
    fetchAllUsers: () => {},
    fetchCount: () => {}
});

export function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // 현재 유저의 정보 가져오기
    const [isLoading, setIsLoading] = useState(true); // 로딩여부
    const [allUsers, setAllUsers] = useState([]); // 모든 유저들의 정보 가져오는 변수
    const [userCount, setUserCount] = useState(0); // 총 유저 수
    const [fetchedUser, setFetchedUser] = useState(null); // 패치한 유저 가져오기

    const setAuthToken = (token) => {
        Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'Strict' });
    }

    const setUserRole = (role) => {
        Cookies.set('role', role, { expires: 7, secure: true, sameSite: 'Strict' });
    }
    
    const signup = async (postData) => {
    try {
        const response = await axios.post('http://localhost:8080/api/signup', postData, {
            withCredentials: true
        });
        console.log("회원가입 성공!", response);
        alert("회원가입 성공!");
        setUser(response.data);
        return response.data;
    } catch (error) {
        console.error('signup error: ', error)
        throw error.response ? error.response.data : "회원가입 실패";
    }};
    
    const login = async (userData, navigateCallback) => {
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:8080/api/login", userData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }, withCredentials: true}
            );
            const { token, role } = response.data;
            setAuthToken(token);
            setUserRole(role);
            setUser({ "userId": userData.userId, "role": role, "id": response.data.userId });
            console.log("로그인 성공");
            alert('로그인 성공!');
            await loadUserInfo();
            navigateCallback(role);
        } catch(error) {
            alert(error.response ? error.response.data : "로그인 실패");
        } finally {
            setIsLoading(false);
        }
    }
    
    const logout = async (navigate) => {
        setIsLoading(true);
        try {
            await axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true });
            Cookies.remove('token');
            Cookies.remove('role');
            setUser(null);
            setFetchedUser(null);
            navigate('/login');
        } catch (error) {
            console.error('로그아웃 실패', error);
            if(error.response) {
                alert("error: ", error.response.data);
            } else {
                alert("로그아웃 실패");
            }
        } finally {
            setIsLoading(false);
        }
    }
    
    const loadUserInfo = async () => {
        const token = Cookies.get('token');
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8080/api/myinfo', {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setFetchedUser({
                userId: response.data.userId,
                nickname: response.data.nickname,
                email: response.data.email,
                createDate: response.data.createDate,
                role: response.data.role
            });
            console.log("response info: ", response);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // 모든 유저 정보 가져오기
    const fetchAllUsers = async() => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/all', {
                withCredentials: true
        });
        const formattedUsers = response.data.map(user => ({
            ...user,
            createDate: formatDate(user.createDate) // 날짜 포맷팅
        }));
        setAllUsers(formattedUsers);
        } catch (error) {
        console.error("모든 유저 정보 가져오기 실패: ", error);
        }
    }

    const fetchCount = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/totalUsers', {
                withCredentials: true
        });
        console.log("response data: ", response.data);
        setUserCount(response.data);
        // console.log("user count: ", response.data.totalUsers);
        } catch (error) {
        console.error('총 회원수 가져오기 실패', error);
        }
    }

    useEffect(() => {
        loadUserInfo();
      }, []
    );
    
    const value = { 
        user, allUsers, setAllUsers, userCount, signup, login, logout, isLoading, 
        loadUserInfo, fetchAllUsers, fetchCount, fetchedUser 
    };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;