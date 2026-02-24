import { apiClient } from '@/api/client'

export interface CreateTableFromTemplateRequest {
    template_key: 'project_tracking_view' | 'product_requirement_list'
    table_name: string
    level_names?: string[]
}

export interface TableSummary {
    id: string
    project_id: string
    template_key: string
    table_name: string
    version: number
    etag?: string | null
}

export interface TableCellInput {
    row_id: string
    column_key: string
    value: string | number | boolean | null
}

export interface TableViewResponse {
    table: TableSummary
    columns: Array<{
        id: string
        key: string
        title: string
        data_type: string
        is_fixed: boolean
        order: number
        hidden: boolean
    }>
    rows: Array<{
        id: string
        parent_row_id: string | null
        order: number
        cells: Array<{
            row_id: string
            column_key: string
            value: string | number | boolean | null
        }>
    }>
}

export async function createTableFromTemplate(
    projectId: string,
    payload: CreateTableFromTemplateRequest
): Promise<void> {
    await apiClient.post(`/api/v1/spreadsheets/projects/${projectId}/tables`, payload)
}

export async function listProjectTables(projectId: string): Promise<TableSummary[]> {
    const response = await apiClient.get<TableSummary[]>(
        `/api/v1/spreadsheets/projects/${projectId}/tables`
    )
    return response.data
}

export async function getTableView(tableId: string): Promise<TableViewResponse> {
    const response = await apiClient.get<TableViewResponse>(`/api/v1/spreadsheets/tables/${tableId}`)
    return response.data
}

export async function addTableRow(
    tableId: string,
    payload: { parent_row_id?: string | null; cells?: Record<string, string | number | boolean | null> }
): Promise<void> {
    await apiClient.post(`/api/v1/spreadsheets/tables/${tableId}/rows`, payload)
}

export async function batchUpsertCells(
    tableId: string,
    payload: { cells: TableCellInput[]; expected_version?: number }
): Promise<void> {
    await apiClient.post(`/api/v1/spreadsheets/tables/${tableId}/cells:batch-upsert`, payload)
}
