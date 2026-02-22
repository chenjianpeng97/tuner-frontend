import { apiClient } from '../client'
import { type components } from '../generated/schema'

// ---- Types derived from openapi schema ----
export type SignUpRequest = components['schemas']['SignUpRequest']
export type SignUpResponse = components['schemas']['SignUpResponse']
export type LogInRequest = components['schemas']['LogInRequest']
export type UserQueryModel = components['schemas']['UserQueryModel']
export type ChangePasswordRequest =
    components['schemas']['Body_change_password_api_v1_account_password_put']

// ---- API functions ----

export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
    const res = await apiClient.post<SignUpResponse>(
        '/api/v1/account/signup',
        data
    )
    return res.data
}

export async function logIn(data: LogInRequest): Promise<void> {
    await apiClient.post('/api/v1/account/login', data)
}

export async function getMe(): Promise<UserQueryModel> {
    const res = await apiClient.get<UserQueryModel>('/api/v1/account/me')
    return res.data
}

export async function logOut(): Promise<void> {
    await apiClient.delete('/api/v1/account/logout')
}

export async function changePassword(
    data: ChangePasswordRequest
): Promise<void> {
    await apiClient.put('/api/v1/account/password', data)
}
