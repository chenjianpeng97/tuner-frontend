import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createUser, type CreateUserRequest } from '@/api/endpoints/users'
import { LIST_USERS_KEY } from './use-list-users'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_USERS_KEY] })
      toast.success('User created successfully.')
    },
  })
}
