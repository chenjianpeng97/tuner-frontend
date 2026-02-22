import { Shield, UserCheck, Users } from 'lucide-react'
import { type UserStatus } from './schema'

export const statusTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const roles = [
  {
    label: 'Super Admin',
    value: 'super_admin',
    icon: Shield,
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: UserCheck,
  },
  {
    label: 'User',
    value: 'user',
    icon: Users,
  },
] as const
