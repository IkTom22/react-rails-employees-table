import Employee from './Employee';
import { Model, SpraypaintBase, Attr, HasMany } from 'spraypaint';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
@Model()
class ApplicationRecord extends SpraypaintBase {
  static baseUrl = BASE_API_URL;
  static apiNamespace = '/api/v1';
}
@Model()
class Department extends ApplicationRecord {
  static jsonapiType = 'departments';

  @Attr() name: string;

  @HasMany() employees: Employee[];
}
export default Department;
