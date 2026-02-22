import { type Table } from '@tanstack/react-table'
import { UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { useActivateUser } from '../api/use-activate-user'
import { useDeactivateUser } from '../api/use-deactivate-user'
import { type User } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const activateUser = useActivateUser()
  const deactivateUser = useDeactivateUser()

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    const mutate = status === 'active' ? activateUser : deactivateUser
    const action = status === 'active' ? 'Activating' : 'Deactivating'

    let completed = 0
    selectedUsers.forEach((user) => {
      mutate.mutate(user.id_, {
        onSuccess: () => {
          completed++
          if (completed === selectedUsers.length) {
            table.resetRowSelection()
            toast.success(
              `${status === 'active' ? 'Activated' : 'Deactivated'} ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`
            )
          }
        },
        onError: (err) => {
          toast.error(`${action} ${user.username} failed: ${err.message}`)
        },
      })
    })
  }

  return (
    <BulkActionsToolbar table={table} entityName='user'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('active')}
            className='size-8'
            aria-label='Activate selected users'
            title='Activate selected users'
          >
            <UserCheck />
            <span className='sr-only'>Activate selected users</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Activate selected users</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('inactive')}
            className='size-8'
            aria-label='Deactivate selected users'
            title='Deactivate selected users'
          >
            <UserX />
            <span className='sr-only'>Deactivate selected users</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Deactivate selected users</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
