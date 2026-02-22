import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { setUserPassword } from '@/api/endpoints/users'
import { LIST_USERS_KEY } from './use-list-users'

export function useSetUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      setUserPassword(userId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_USERS_KEY] })
      toast.success('Password updated.')
    },
  })
}
