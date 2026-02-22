import { type UserQueryModel } from '@/api/endpoints/users'

/** Simple in-memory database for MSW handlers */

export interface MockUser extends UserQueryModel {
  password: string
}

// Seed data derived from feature files Given conditions
const seedUsers: MockUser[] = [
  {
    id_: '00000000-0000-0000-0000-000000000001',
    username: 'super_admin',
    role: 'super_admin',
    is_active: true,
    password: 'admin123',
  },
  {
    id_: '00000000-0000-0000-0000-000000000002',
    username: 'alice',
    role: 'admin',
    is_active: true,
    password: 'alice123',
  },
  {
    id_: '00000000-0000-0000-0000-000000000003',
    username: 'bob',
    role: 'user',
    is_active: false,
    password: 'bob12345',
  },
  {
    id_: '00000000-0000-0000-0000-000000000004',
    username: 'carol',
    role: 'user',
    is_active: false,
    password: 'carol123',
  },
  {
    id_: '00000000-0000-0000-0000-000000000005',
    username: 'dave',
    role: 'user',
    is_active: true,
    password: 'dave1234',
  },
]

class MockDB {
  users: Map<string, MockUser>
  /** Currently authenticated username (set by login handler) */
  currentUser: string | null = null

  constructor() {
    this.users = new Map()
    this.reset()
  }

  reset() {
    this.users.clear()
    for (const u of seedUsers) {
      this.users.set(u.id_, u)
    }
    this.currentUser = null
  }

  findByUsername(username: string): MockUser | undefined {
    return Array.from(this.users.values()).find((u) => u.username === username)
  }

  getCurrentUser(): MockUser | undefined {
    if (!this.currentUser) return undefined
    return this.findByUsername(this.currentUser)
  }

  allUsers(): MockUser[] {
    return Array.from(this.users.values())
  }
}

export const db = new MockDB()
