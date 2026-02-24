import { apiClient } from '@/api/client'

export interface RequirementStatisticsResponse {
    project_id: string
    customer_requirement_id: string | null
    total_assets: number
    linked_assets: number
    unlinked_assets: number
    product_requirement_count: number
}

export interface StatusLabelsResponse {
    project_id: string
    labels: string[]
}

export async function queryRequirementStatistics(
    projectId: string,
    customerRequirementId?: string
): Promise<RequirementStatisticsResponse> {
    const response = await apiClient.get<RequirementStatisticsResponse>(
        `/api/v1/projects/${projectId}/requirements/statistics`,
        {
            params: customerRequirementId
                ? { customer_requirement_id: customerRequirementId }
                : undefined,
        }
    )
    return response.data
}

export async function listStatusLabels(projectId: string): Promise<StatusLabelsResponse> {
    const response = await apiClient.get<StatusLabelsResponse>(
        `/api/v1/projects/${projectId}/status-labels`
    )
    return response.data
}

export async function upsertStatusLabel(
    projectId: string,
    label: string
): Promise<StatusLabelsResponse> {
    const response = await apiClient.post<StatusLabelsResponse>(
        `/api/v1/projects/${projectId}/status-labels`,
        { label }
    )
    return response.data
}
