import { createFileRoute, redirect } from '@tanstack/react-router'
import { getMe } from '@/api/endpoints/account'
import { useAuthStore, type UserRole } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()

    // Already authenticated in this session — proceed
    if (auth.user) return

    // Not in store — try to hydrate from backend session cookie
    // (httpOnly cookie is sent automatically by the browser, we can't read it via JS)
    try {
      const userData = await getMe()
      auth.setUser({
        id: userData.id_,
        username: userData.username,
        role: userData.role as UserRole,
        is_active: userData.is_active,
      })
    } catch {
      // No valid session — redirect to sign in
      throw redirect({ to: '/sign-in' })
    }
  },
  component: AuthenticatedLayout,
})
