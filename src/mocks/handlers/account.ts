import { http, HttpResponse } from 'msw'
import { BASE_URL } from '../config'
import { db } from '../data/db'

const MOCK_TOKEN = 'mock-jwt-token'

export const accountHandlers = [
    // POST /api/v1/account/signup
    http.post(`${BASE_URL}/api/v1/account/signup`, async ({ request, cookies }) => {
        if (cookies.access_token && db.getCurrentUser()) {
            return HttpResponse.json(
                { error: 'Already authenticated. Log out first.' },
                { status: 403 }
            )
        }

        const body = (await request.json()) as {
            username: string
            password: string
        }

        if (!body.username || !body.password) {
            return HttpResponse.json(
                { error: 'Username and password are required.' },
                { status: 400 }
            )
        }

        if (db.findByUsername(body.username)) {
            return HttpResponse.json(
                { error: `Username "${body.username}" already exists.` },
                { status: 409 }
            )
        }

        const id = crypto.randomUUID()
        db.users.set(id, {
            id_: id,
            username: body.username,
            password: body.password,
            role: 'user',
            is_active: true,
        })

        return HttpResponse.json({ id }, { status: 201 })
    }),

    // POST /api/v1/account/login
    http.post(`${BASE_URL}/api/v1/account/login`, async ({ request, cookies }) => {
        if (cookies.access_token && db.getCurrentUser()) {
            return HttpResponse.json(
                { error: 'Already authenticated. Log out first.' },
                { status: 403 }
            )
        }

        const body = (await request.json()) as {
            username: string
            password: string
        }

        const user = db.findByUsername(body.username)
        if (!user) {
            return HttpResponse.json(
                { error: `User "${body.username}" not found.` },
                { status: 404 }
            )
        }

        if (!user.is_active) {
            return HttpResponse.json(
                { error: 'User account is deactivated.' },
                { status: 401 }
            )
        }

        if (user.password !== body.password) {
            return HttpResponse.json(
                { error: 'Invalid credentials.' },
                { status: 401 }
            )
        }

        db.currentUser = user.username

        return new HttpResponse(null, {
            status: 204,
            headers: {
                'Set-Cookie': `access_token=${MOCK_TOKEN}; Path=/; Max-Age=86400`,
            },
        })
    }),

    // GET /api/v1/account/me
    http.get(`${BASE_URL}/api/v1/account/me`, ({ cookies }) => {
        if (!cookies.access_token) {
            return HttpResponse.json(
                { error: 'Not authenticated.' },
                { status: 401 }
            )
        }

        const currentUser = db.getCurrentUser()
        if (!currentUser) {
            return HttpResponse.json(
                { error: 'Not authenticated.' },
                { status: 401 }
            )
        }

        return HttpResponse.json(
            {
                id_: currentUser.id_,
                username: currentUser.username,
                role: currentUser.role,
                is_active: currentUser.is_active,
            },
            { status: 200 }
        )
    }),

    // PUT /api/v1/account/password
    http.put(`${BASE_URL}/api/v1/account/password`, async ({ request, cookies }) => {
        if (!cookies.access_token) {
            return HttpResponse.json(
                { error: 'Not authenticated.' },
                { status: 401 }
            )
        }

        const body = (await request.json()) as {
            current_password: string
            new_password: string
        }

        const currentUser = db.getCurrentUser()
        if (!currentUser) {
            return HttpResponse.json(
                { error: 'Not authenticated.' },
                { status: 401 }
            )
        }

        if (currentUser.password !== body.current_password) {
            return HttpResponse.json(
                { error: 'Current password is incorrect.' },
                { status: 400 }
            )
        }

        if (body.current_password === body.new_password) {
            return HttpResponse.json(
                { error: 'New password must differ from current password.' },
                { status: 400 }
            )
        }

        currentUser.password = body.new_password
        return new HttpResponse(null, { status: 204 })
    }),

    // DELETE /api/v1/account/logout
    http.delete(`${BASE_URL}/api/v1/account/logout`, ({ cookies }) => {
        if (!cookies.access_token) {
            return HttpResponse.json(
                { error: 'Not authenticated.' },
                { status: 401 }
            )
        }

        db.currentUser = null

        return new HttpResponse(null, {
            status: 204,
            headers: {
                'Set-Cookie': 'access_token=; Path=/; Max-Age=0',
            },
        })
    }),
]
