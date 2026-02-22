import { useQuery } from '@tanstack/react-query'
import { listUsers, type ListUsersParams } from '@/api/endpoints/users'

export const LIST_USERS_KEY = 'users'

export function useListUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: [LIST_USERS_KEY, params],
    queryFn: () => listUsers(params),
  })
}
