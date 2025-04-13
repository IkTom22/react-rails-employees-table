# app/serializers/employee_serializer.rb
class EmployeeSerializer < Graphiti::Serializer
    # Define the attributes you want to serialize
    attribute :first_name
    attribute :last_name
    attribute :age
    attribute :position
    attribute :department_id
  
    # Serialize the department name manually
    attribute :department_name do
      @object.department&.name
    end
  
    # Define the relationships
    relationship :department, type: :departments do
      # Returning both the type, id, and name for department in the relationship data
      department = @object.department
      if department
        { 
          data: {
            type: :departments,
            id: department.id,
            name: department.name  # Adding the department name here
          }
        }
      else
        nil
      end
    end
  end
  