import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { activateUser } from '@/api/endpoints/users'
import { LIST_USERS_KEY } from './use-list-users'

export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_USERS_KEY] })
      toast.success('User activated.')
    },
  })
}
