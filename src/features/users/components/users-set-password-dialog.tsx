'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { useSetUserPassword } from '../api/use-set-user-password'
import { type User } from '../data/schema'

const formSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required.')
      .min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

type SetPasswordForm = z.infer<typeof formSchema>

type UsersSetPasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersSetPasswordDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersSetPasswordDialogProps) {
  const setUserPassword = useSetUserPassword()

  const form = useForm<SetPasswordForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (values: SetPasswordForm) => {
    setUserPassword.mutate(
      { userId: currentRow.id_, password: values.password },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to set password.')
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <KeyRound size={18} /> Set Password
          </DialogTitle>
          <DialogDescription>
            Set a new password for{' '}
            <span className='font-bold'>{currentRow.username}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='set-password-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='e.g., S3cur3P@ssw0rd'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='e.g., S3cur3P@ssw0rd'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='set-password-form'
            disabled={setUserPassword.isPending}
          >
            {setUserPassword.isPending ? 'Saving...' : 'Set Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
