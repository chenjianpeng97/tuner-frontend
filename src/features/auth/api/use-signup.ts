import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { signUp, type SignUpRequest } from '@/api/endpoints/account'

export function useSignUp() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: SignUpRequest) => signUp(data),
    onSuccess: () => {
      toast.success('Account created! Please sign in.')
      navigate({ to: '/sign-in', replace: true })
    },
  })
}
