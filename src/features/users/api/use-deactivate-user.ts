import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deactivateUser } from '@/api/endpoints/users'
import { LIST_USERS_KEY } from './use-list-users'

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_USERS_KEY] })
      toast.success('User deactivated.')
    },
  })
}
