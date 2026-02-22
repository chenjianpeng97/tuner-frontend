import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { logIn, getMe, type LogInRequest } from '@/api/endpoints/account'
import { setCookie } from '@/lib/cookies'
import { useAuthStore, type AuthUser, type UserRole } from '@/stores/auth-store'

interface UseLoginOptions {
    redirectTo?: string
}

export function useLogin({ redirectTo }: UseLoginOptions = {}) {
    const navigate = useNavigate()
    const { auth } = useAuthStore()

    return useMutation({
        mutationFn: async (data: LogInRequest) => {
            await logIn(data)
            // In mock mode, Set-Cookie won't work through service worker, so we set it manually
            if (import.meta.env.VITE_ENABLE_MSW === 'true') {
                setCookie('access_token', 'mock-jwt-token', 86400)
            }
            // Fetch current user info after successful login
            return getMe()
        },
        onSuccess: (userData) => {
            const user: AuthUser = {
                id: userData.id_,
                username: userData.username,
                role: userData.role as UserRole,
                is_active: userData.is_active,
            }

            auth.setUser(user)
            toast.success(`Welcome back, ${user.username}!`)
            navigate({ to: redirectTo || '/', replace: true })
        },
    })
}
