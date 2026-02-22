import { http, HttpResponse } from 'msw'
import { BASE_URL } from '../config'
import { db } from '../data/db'

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 3,
  admin: 2,
  user: 1,
}

function isAuthenticatedAdmin(cookies: Record<string, string>) {
  if (!cookies.access_token) return { ok: false as const, status: 401, error: 'Not authenticated.' }
  const current = db.getCurrentUser()
  if (!current) return { ok: false as const, status: 401, error: 'Not authenticated.' }
  if ((ROLE_HIERARCHY[current.role] ?? 0) < 2) {
    return { ok: false as const, status: 403, error: 'Forbidden. Admin role required.' }
  }
  return { ok: true as const, user: current }
}

export const usersHandlers = [
  // POST /api/v1/users/ — Create User
  http.post(`${BASE_URL}/api/v1/users/`, async ({ request, cookies }) => {
    const auth = isAuthenticatedAdmin(cookies)
    if (!auth.ok) {
      return HttpResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = (await request.json()) as {
      username: string
      password: string
      role?: string
    }

    if (db.findByUsername(body.username)) {
      return HttpResponse.json(
        { error: `Username "${body.username}" already exists.` },
        { status: 409 }
      )
    }

    const targetRole = body.role ?? 'user'
    // Role hierarchy check
    if ((ROLE_HIERARCHY[targetRole] ?? 0) >= (ROLE_HIERARCHY[auth.user.role] ?? 0)) {
      return HttpResponse.json(
        { error: `Cannot create user with role "${targetRole}".` },
        { status: 422 }
      )
    }

    const id = crypto.randomUUID()
    db.users.set(id, {
      id_: id,
      username: body.username,
      password: body.password,
      role: targetRole as 'super_admin' | 'admin' | 'user',
      is_active: true,
    })

    return HttpResponse.json({ id }, { status: 201 })
  }),

  // GET /api/v1/users/ — List Users
  http.get(`${BASE_URL}/api/v1/users/`, ({ request, cookies }) => {
    const auth = isAuthenticatedAdmin(cookies)
    if (!auth.ok) {
      return HttpResponse.json({ error: auth.error }, { status: auth.status })
    }

    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') ?? 20)
    const offset = Number(url.searchParams.get('offset') ?? 0)
    const sortField = url.searchParams.get('sorting_field') ?? 'username'
    const sortOrder = url.searchParams.get('sorting_order') ?? 'ASC'

    let all = db.allUsers().map(({ password: _pwd, ...rest }) => rest)

    // Sort
    all.sort((a, b) => {
      const aVal = String((a as Record<string, unknown>)[sortField] ?? '')
      const bVal = String((b as Record<string, unknown>)[sortField] ?? '')
      return sortOrder === 'ASC' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })

    const total = all.length
    const users = all.slice(offset, offset + limit)

    return HttpResponse.json({ users, total })
  }),

  // PUT /api/v1/users/:user_id/password — Set User Password
  http.put(`${BASE_URL}/api/v1/users/:user_id/password`, async ({ params, request, cookies }) => {
    const auth = isAuthenticatedAdmin(cookies)
    if (!auth.ok) {
      return HttpResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = db.users.get(params.user_id as string)
    if (!user) {
      return HttpResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const password = (await request.json()) as string
    user.password = password
    return new HttpResponse(null, { status: 204 })
  }),

  // PUT /api/v1/users/:user_id/roles/admin — Grant Admin
  http.put(`${BASE_URL}/api/v1/users/:user_id/roles/admin`, ({ params, cookies }) => {
    const auth = isAuthenticatedAdmin(cookies)
    if (!auth.ok) {
      return HttpResponse.json({ error: auth.error }, { status: auth.status })
    }
    if (auth.user.role !== 'super_admin') {
      return HttpResponse.json({ error: 'Only super admins can grant admin.' }, { status: 403 })
    }

    const user = db.users.get(params.user_id as string)
    if (!user) {
      return HttpResponse.json({ error: 'User not found.' }, { status: 404 })
    }
    user.role = 'admin'
    return new HttpResponse(null, { status: 204 })
  }),

  // DELETE /api/v1/users/:user_id/roles/admin — Revoke Admin
  http.delete(`${BASE_URL}/api/v1/users/:user_id/roles/admin`, ({ params, cookies }) => {
    const auth = isAuthenticatedAdmin(cookies)
    if (!auth.ok) {
      return HttpResponse.json({ error: auth.error }, { status: auth.status })
    }
    if (auth.user.role !== 'super_admin') {
      return HttpResponse.json({ error: 'Only super admins can revoke admin.' }, { status: 403 })
    }

    const user = db.users.get(params.user_id as string)
    if (!user) {
      return HttpResponse.json({ error: 'User not found.' }, { status: 404 })
    }
    user.role = 'user'
    return new HttpResponse(null, { status: 204 })
  }),

  // PUT /api/v1/users/:user_id/activation — Activate User
  http.put(`${BASE_URL}/api/v1/users/:user_id/activation`, ({ params, cookies }) => {
    const auth = isAuthenticatedAdmin(cookies)
    if (!auth.ok) {
      return HttpResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = db.users.get(params.user_id as string)
    if (!user) {
      return HttpResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    // Only super admins can activate admins
    if (user.role === 'admin' && auth.user.role !== 'super_admin') {
      return HttpResponse.json(
        { error: 'Only super admins can activate other admins.' },
        { status: 403 }
      )
    }

    user.is_active = true
    return new HttpResponse(null, { status: 204 })
  }),

  // DELETE /api/v1/users/:user_id/activation — Deactivate User
  http.delete(`${BASE_URL}/api/v1/users/:user_id/activation`, ({ params, cookies }) => {
    const auth = isAuthenticatedAdmin(cookies)
    if (!auth.ok) {
      return HttpResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = db.users.get(params.user_id as string)
    if (!user) {
      return HttpResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    if (user.role === 'super_admin') {
      return HttpResponse.json(
        { error: 'Super admins cannot be deactivated.' },
        { status: 403 }
      )
    }

    if (user.role === 'admin' && auth.user.role !== 'super_admin') {
      return HttpResponse.json(
        { error: 'Only super admins can deactivate other admins.' },
        { status: 403 }
      )
    }

    user.is_active = false
    return new HttpResponse(null, { status: 204 })
  }),
]
