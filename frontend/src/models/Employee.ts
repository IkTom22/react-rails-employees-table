import Department from './Department';
import { Model, SpraypaintBase, Attr, BelongsTo } from 'spraypaint';
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

//Base class for the API communication
@Model()
class ApplicationRecord extends SpraypaintBase {
  static baseUrl = BASE_API_URL;
  static apiNamespace = '/api/v1';
}

@Model()
class Employee extends ApplicationRecord {
  static jsonapiType = 'employees'; // The type that matches the API endpoint
  // static jsonApiAttributes = [
  //   'first_name',
  //   'last_name',
  //   'age',
  //   'position',
  //   'department_id',
  // ];

  @Attr() first_name: string;
  @Attr() last_name: string;
  @Attr() age: number;
  @Attr() position: string;
  @Attr() department_id: number;

  @BelongsTo() departments: Department;
}
export default Employee;
