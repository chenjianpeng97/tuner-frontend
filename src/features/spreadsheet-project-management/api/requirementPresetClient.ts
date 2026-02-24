import { apiClient } from '@/api/client'

export interface InstantiateRequirementPresetRequest {
    template_key?: 'project_tracking_view'
    table_name: string
}

export interface InstantiateRequirementPresetResponse {
    project_id: string
    template_key: 'project_tracking_view'
    spreadsheet_table_id: string | null
}

export interface DrilldownRequirementRequest {
    labels?: string[]
}

export interface DrilldownRequirementResponse {
    customer_requirement_id: string
    decomposition_allowed: boolean
    product_requirement_ids: string[]
}

export interface CreateProductRequirementRequest {
    title: string
    description?: string
    product_requirement_id?: string
    table_id?: string
}

export interface CreateProductRequirementResponse {
    customer_requirement_id: string
    product_requirement_id: string
    association_created: boolean
}

export async function instantiateProjectTrackingPreset(
    projectId: string,
    payload: InstantiateRequirementPresetRequest
): Promise<InstantiateRequirementPresetResponse> {
    const response = await apiClient.post<InstantiateRequirementPresetResponse>(
        `/api/v1/projects/${projectId}/requirements/presets/project-tracking:instantiate`,
        payload
    )
    return response.data
}

export async function drilldownRequirement(
    projectId: string,
    customerRequirementId: string,
    payload: DrilldownRequirementRequest
): Promise<DrilldownRequirementResponse> {
    const response = await apiClient.post<DrilldownRequirementResponse>(
        `/api/v1/projects/${projectId}/customer-requirements/${customerRequirementId}/drilldown`,
        payload
    )
    return response.data
}

export async function createProductRequirement(
    projectId: string,
    customerRequirementId: string,
    payload: CreateProductRequirementRequest
): Promise<CreateProductRequirementResponse> {
    const response = await apiClient.post<CreateProductRequirementResponse>(
        `/api/v1/projects/${projectId}/customer-requirements/${customerRequirementId}/product-requirements`,
        payload
    )
    return response.data
}
