import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getUser } from '@/lib/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const token = getToken();
    const user = getUser();
    const location = useLocation();

    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasPermission = user.roles?.some(role => allowedRoles.includes(role));
        if (!hasPermission) {
            return <Navigate to="/403" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
