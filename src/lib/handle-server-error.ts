import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  let errMsg = 'Something went wrong!'

  if (error instanceof AxiosError) {
    // Backend returns { error: "..." } via SimpleErrorResponseModel
    const data = error.response?.data
    if (data?.error) {
      errMsg = data.error
    } else if (data?.title) {
      errMsg = data.title
    } else if (error.message) {
      errMsg = error.message
    }
  }

  toast.error(errMsg)
}
