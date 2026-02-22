import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Extract backend error message from SimpleErrorResponseModel
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      error.message = error.response.data.error
    }
    return Promise.reject(error)
  }
)

export { apiClient }
