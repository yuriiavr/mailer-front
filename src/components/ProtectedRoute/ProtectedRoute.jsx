import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../utils/Notifications/Notifications';

const ProtectedRoute = () => {
    const { isLoggedIn, isRefreshing } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    
    const hasRedirected = useRef(false);

    useEffect(() => {
        
        if (!isLoggedIn && !isRefreshing && !hasRedirected.current) {
            hasRedirected.current = true;
            
            showNotification('Ви повинні увійти, щоб переглянути цю сторінку.', 'error');
            
            setTimeout(() => {
                navigate('/login');
            }, 100);
        }
    }, [isLoggedIn, isRefreshing, navigate, showNotification]);

    return isLoggedIn ? <Outlet /> : null;
};

export default ProtectedRoute;