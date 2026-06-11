import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RecruiterRouterProtector = () => {

  const { token, setToken } = useContext(AppContext);

  if (!token) {
    return <Navigate to="/auth?type=recruiter&mode=login" replace />;
  }

  try {

    const decoded = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      setToken(null);
      return <Navigate to="/auth?type=recruiter&mode=login" replace />;
    }

    if (decoded.role !== 'recruiter') {
      return <Navigate to='/' replace />;
    }

    return <Outlet />;

  } catch (error) {
    localStorage.removeItem('token');
    setToken(null);
    return <Navigate to="/auth?type=recruiter&mode=login" replace />;
  }

}

export default RecruiterRouterProtector