/**
 * Task Property Order Configuration
 * Task Editor의 body params 영역에서 property들의 표시 순서를 제어
 */

export interface PropertyOrderRule {
  path: string;  // 적용할 경로 (예: 'body_params', 'body_params.servers[]')
  order: string[];  // 순서대로 나열할 property 이름들
}

/**
 * Task별 Property 순서 설정
 * - step.type (task component type)을 key로 하여 각 task의 순서 규칙을 정의
 * - step.name이 아닌 step.type을 사용 (step.name은 사용자가 수정 가능하므로)
 * - path 기반으로 특정 경로의 property 순서를 제어
 * - 설정이 없는 task는 기본 순서 유지
 */
export const TASK_PROPERTY_ORDER_CONFIG: Record<string, PropertyOrderRule[]> = {
  // Beetle Infra Migration Task
  'beetle_task_infra_migration': [
    {
      path: 'body_params',
      order: [  
        'description',
        'targetCloud',
        'targetVmInfra',
        'targetVmSpecList',
        'targetVmOsImageList',
        'targetVNet',
        'targetSecurityGroupList',
        'targetSshKey',
        'status'
      ]
    },
    {
      path: 'body_params.targetVmInfra',
      order: [
        'name',
        'description',        
        'subGroups',
        'installMonAgent',  
        'label',
        'systemLabel',
        'postCommand'
      ]
    }
  ],
  
  // Grasshopper Software Migration Task
  'grasshopper_task_software_migration': [
    {
      path: 'body_params.targetSoftwareModel.servers[]',
      order: [
        'source_connection_info_id',
        'migration_list',
        'errors'
      ]
    },
    {
        path: 'body_params.targetSoftwareModel.servers[].migration_list.packages[]',
        order: [
          'name',
          'version',
          'order',
          'repo_use_os_version_code',          
          'repo_url',
          'gpg_key_url',
          'custom_configs'
        ]
      }
  ]
};

/**
 * 현재 path에 해당하는 순서 규칙 찾기
 * 
 * @param taskName - Task component type (step.type, not step.name)
 * @param currentPath - 현재 필드의 경로 (예: 'body_params.servers[]')
 * @returns 순서 배열 또는 null (설정이 없는 경우)
 */
export function getPropertyOrder(
  taskName: string,
  currentPath: string
): string[] | null {
  const rules = TASK_PROPERTY_ORDER_CONFIG[taskName];
  if (!rules) return null;

  const matchedRule = rules.find(rule => rule.path === currentPath);
  return matchedRule ? matchedRule.order : null;
}

/**
 * Property 키 배열을 순서에 맞게 정렬
 * - order에 있는 property들을 먼저 순서대로 배치
 * - 나머지 property들은 원래 순서대로 뒤에 배치
 * 
 * @param properties - 정렬할 property 키 배열
 * @param order - 우선 순서 배열
 * @returns 정렬된 property 키 배열
 */
export function sortPropertiesByOrder(
  properties: string[],
  order: string[]
): string[] {
  // order에 있는 property들 중 실제로 존재하는 것만 먼저 배치
  const ordered = order.filter(key => properties.includes(key));
  
  // order에 없는 나머지 property들 (원래 순서 유지)
  const remaining = properties.filter(key => !order.includes(key));
  
  return [...ordered, ...remaining];
}

