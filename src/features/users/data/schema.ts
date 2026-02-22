import { z } from 'zod'

export const userRoleSchema = z.union([
  z.literal('super_admin'),
  z.literal('admin'),
  z.literal('user'),
])
export type UserRole = z.infer<typeof userRoleSchema>

export const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

export const userSchema = z.object({
  id_: z.string().uuid(),
  username: z.string(),
  role: userRoleSchema,
  is_active: z.boolean(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
