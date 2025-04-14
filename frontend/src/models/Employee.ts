import Department from './Department';
import { Model, SpraypaintBase, Attr, BelongsTo } from 'spraypaint';

// I have created .env and added to .gitignore though, just the testing purposes, I used the link directly.
// const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_API_URL = 'http://localhost:4567';

//Base class for the API communication
@Model()
class ApplicationRecord extends SpraypaintBase {
  static baseUrl = BASE_API_URL;
  static apiNamespace = '/api/v1';
}

@Model()
class Employee extends ApplicationRecord {
  static jsonapiType = 'employees'; // The type that matches the API endpoint

  @Attr() firstName: string;
  @Attr() lastName: string;
  @Attr() age: number;
  @Attr() position: string;
  @Attr() departmentId: number;

  @BelongsTo() departments: Department;
}
export default Employee;
