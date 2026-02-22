import { apiClient } from '../client'
import { type components } from '../generated/schema'

// ---- Types derived from openapi schema ----
export type CreateUserRequest = components['schemas']['CreateUserRequestPydantic']
export type CreateUserResponse = components['schemas']['CreateUserResponse']
export type ListUsersResponse = components['schemas']['ListUsersQM']
export type UserQueryModel = components['schemas']['UserQueryModel']
export type UserRole = components['schemas']['UserRole']
export type SortingOrder = components['schemas']['SortingOrder']

export interface ListUsersParams {
  limit?: number
  offset?: number
  sorting_field?: string
  sorting_order?: SortingOrder
}

// ---- API functions ----

export async function createUser(
  data: CreateUserRequest
): Promise<CreateUserResponse> {
  const res = await apiClient.post<CreateUserResponse>('/api/v1/users/', data)
  return res.data
}

export async function listUsers(
  params?: ListUsersParams
): Promise<ListUsersResponse> {
  const res = await apiClient.get<ListUsersResponse>('/api/v1/users/', {
    params,
  })
  return res.data
}

export async function setUserPassword(
  userId: string,
  password: string
): Promise<void> {
  await apiClient.put(`/api/v1/users/${userId}/password`, JSON.stringify(password), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function grantAdmin(userId: string): Promise<void> {
  await apiClient.put(`/api/v1/users/${userId}/roles/admin`)
}

export async function revokeAdmin(userId: string): Promise<void> {
  await apiClient.delete(`/api/v1/users/${userId}/roles/admin`)
}

export async function activateUser(userId: string): Promise<void> {
  await apiClient.put(`/api/v1/users/${userId}/activation`)
}

export async function deactivateUser(userId: string): Promise<void> {
  await apiClient.delete(`/api/v1/users/${userId}/activation`)
}
