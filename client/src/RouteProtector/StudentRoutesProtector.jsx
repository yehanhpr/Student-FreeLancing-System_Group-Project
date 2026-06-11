import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { jwtDecode } from 'jwt-decode';

const StudentRoutesProtector = () => {

    const { token, setToken } = useContext(AppContext);

    if (!token) {
        return <Navigate to="/auth?type=student&mode=login" replace />;
    }

    try {

        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setToken(null);
            return <Navigate to="/auth?type=student&mode=login" replace />;
        }

        if (decoded.role !== 'student') {
            return <Navigate to='/' replace />;
        }

        return <Outlet />;

    } catch (error) {
        localStorage.removeItem('token');
        setToken(null);
        return <Navigate to="/auth?type=student&mode=login" replace />;
    }

}

export default StudentRoutesProtector