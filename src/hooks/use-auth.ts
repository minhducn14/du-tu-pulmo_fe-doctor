import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { LoginCredentials } from '@/types/auth';

// Keys for React Query cache management regarding Auth (if needed)
export const AUTH_KEYS = {
    all: ['auth'] as const,
};

/**
 * Hook to handle User Login.
 * Uses useMutation to manage loading/error states automatically.
 */
export function useLogin() {
    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    });
}

/**
 * Hook to handle User Logout.
 */
export function useLogout() {
    return useMutation({
        mutationFn: () => authService.logout(),
    });
}

export function useForgotPasswordOtp() {
    return useMutation({
        mutationFn: (email: string) => authService.forgotPasswordOtp(email),
    });
}

export function useResetPasswordOtp() {
    return useMutation({
        mutationFn: (payload: { email: string; otp: string; newPassword: string }) =>
            authService.resetPasswordOtp(payload.email, payload.otp, payload.newPassword),
    });
}
