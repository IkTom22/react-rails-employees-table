export interface EmployeeType {
  // id: string;
  first_name: string;
  last_name: string;
  age: number;
  position: string;
  department_id: number;
  department_name?: string;
}
export interface Meta {
  total_count: number;
  total_pages: number;
}

export interface FetchedEmployeeDataType {
  id: string;
  type: string;
  attributes: EmployeeType;
  meta: Meta;
}

export interface DepartmentAttributes {
  id: string;
  name: string;
}
export interface IncludedDepartmentDataType {
  id: string;
  type: string;
  attributes: DepartmentAttributes;
}
