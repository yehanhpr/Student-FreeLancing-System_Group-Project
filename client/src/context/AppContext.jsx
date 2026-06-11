import { createContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [allApplicants, setAllApplicants] = useState([]);
    const [recommendedProjects, setRecommendedProjects] = useState([]);
    const [fetchingRecommendations, setFetchingRecommendations] = useState(false);

    const recommendationFetchRef = useRef(false);


    const fetchUserProfile = async () => {
        if (!token) return;

        let endpoint = '';

        if (role === 'student') {
            endpoint = `${import.meta.env.VITE_REACT_BACKEND_URL}/api/student/profile`;
        } else if (role === 'recruiter') {
            endpoint = `${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/profile`;
        } else if (role === 'admin') {
            endpoint = `${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/profile`;
        }

        try {
            const { success, student, recruiter, admin } = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => res.json());
            if (success) {
                setUser(student || recruiter || admin);
            }

        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }

    useEffect(() => {
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            setRole(decoded.role);
            const expiryTime = decoded.exp * 1000 - Date.now();

            if (expiryTime <= 0) {
                setToken(null);
                setRole(null);
                setUser(null);
                setRecommendedProjects([]);
                recommendationFetchRef.current = false;
                localStorage.removeItem('token');
                return;
            }

            const timer = setTimeout(() => {
                setToken(null);
                setRole(null);
                setUser(null);
                setRecommendedProjects([]);
                recommendationFetchRef.current = false;
                localStorage.removeItem('token');
            }, expiryTime);

            return () => clearTimeout(timer);
        } catch (error) {
            setToken(null);
            setRole(null);
            setUser(null);
            setRecommendedProjects([]);
            recommendationFetchRef.current = false;
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (role && token) {
            fetchUserProfile();
        }
    }, [token, role]);


    //Get All projects
    const fetchAllProjects = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/projects`);
            const data = await response.json();
            setProjects(data.projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    //Get All companies
    const fetchAllCompanies = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/companies`);
            const data = await response.json();

            if (data.success) {
                console.log('Companies:', data.companies);
                setCompanies(data.companies);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    }

    useEffect(() => {
        fetchAllProjects();
        fetchAllCompanies();
    }, [token]);


    const fetchApplications = async () => {

        if (!token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/project-applicants`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                console.error('Error fetching applications:', data.message || 'Unknown error');
                return;
            }

            setAllApplicants(data.applications);

        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }

    useEffect(() => {
        if (token && user && role === 'recruiter') {
            fetchApplications();
        }
    }, [token, user, role]);

    const fetchRecommendedProjects = async () => {
        if (!token || !user || role !== 'student') return;

        setFetchingRecommendations(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/student/recommendations`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                console.error('Error fetching recommended projects:', data.message || 'Failed to fetch recommendations');
                return;
            }

            setRecommendedProjects(data.recommendedProjects || []);
            recommendationFetchRef.current = true; // Mark that recommendations have been fetched at least once

        } catch (error) {
            console.error('Error fetching recommended projects:', error);
        } finally {
            setFetchingRecommendations(false);
        }
    }

    useEffect(() => {
        if (token && user && role === 'student' && !recommendationFetchRef.current) {
            //fetchRecommendedProjects();
        }
    }, [token, user, role]);

    useEffect(() => {
        recommendationFetchRef.current = false;
    }, [token]);

    const value = {
        token,
        setToken,
        role,
        user,
        setUser,
        projects,
        setProjects,
        companies,
        setCompanies,
        allApplicants,
        setAllApplicants,
        fetchApplications,
        recommendedProjects,
        fetchingRecommendations,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;