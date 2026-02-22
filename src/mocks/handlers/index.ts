import { accountHandlers } from './account'
import { usersHandlers } from './users'

export const handlers = [...accountHandlers, ...usersHandlers]
