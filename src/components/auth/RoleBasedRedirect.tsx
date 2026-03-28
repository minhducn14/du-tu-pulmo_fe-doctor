import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '@/lib/auth';
import { Role } from '@/constants/roles';

/**
 * RoleBasedRedirect
 * Redirects the user to their appropriate dashboard based on their role.
 * - RECEPTIONIST -> /doctor/reception
 * - Others (DOCTOR, ADMIN, etc.) -> /doctor/overview
 */
const RoleBasedRedirect: React.FC = () => {
    const user = getUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if the user is a receptionist
    const isReceptionist = user.roles?.includes(Role.RECEPTIONIST);

    if (isReceptionist) {
        return <Navigate to="/doctor/reception" replace />;
    }

    // Default to doctor overview for other roles (Doctor, Admin, etc.)
    return <Navigate to="/doctor/overview" replace />;
};

export default RoleBasedRedirect;
