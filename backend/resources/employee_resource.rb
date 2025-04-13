require_relative './department_resource'
require_relative '../serializers/employee_serializer.rb'

class EmployeeResource < Graphiti::Resource
  self.adapter = Graphiti::Adapters::ActiveRecord
  self.model = Employee
  self.type = :employees
  self.serializer = EmployeeSerializer

  attribute :first_name, :string, sortable: true
  attribute :last_name, :string, sortable: true
  attribute :age, :integer, sortable: true
  attribute :position, :string, sortable: true
  attribute :department_id, :integer

  belongs_to :department, resource: DepartmentResource, foreign_key: :department_id

   # This is key: make sure we return ActiveRecord::Relation
  def base_scope
    Employee.all
  end

  def self.default_sort
    [{ first_name: :asc }]
  end

  # Custom pagination (if necessary)
  def paginate(scope, params)
    page = params[:page] || {}
    page_number = page[:number].to_i || 1
    page_size = page[:size].to_i || 10
    puts "Page Number: #{page_number}, Page Size: #{page_size}"
    scope.page(page_number).per(page_size)
  end
  # def paginate(scope, params)
  #   # page = params[:page] || {}
  #   page = params.fetch(:page, {})
  #   page_number = page[:number].to_i > 0 ? page[:number].to_i : 1
  #   page_size = page[:size].to_i > 0 ? page[:size].to_i : 10
  
  #   puts "Page Number: #{page_number}, Page Size: #{page_size}"
  
  #   # Ensure scope is an ActiveRecord relation and apply pagination
  #   if scope.is_a?(ActiveRecord::Relation)
  #     scope.page(page_number).per(page_size)
  #   else
  #     # If scope is not an ActiveRecord relation, return an empty array
  #     []
  #   end
  # end
  
  # This is where we generate meta information
  def meta(options)
    # Get base meta data from Graphiti, if available
    base_meta = super(options) rescue {}
  
    # Add positions to the meta information (distinct positions from employees)
    # base_meta[:positions] = self.class.model.select(:position).distinct.compact.sort.pluck(:position)
  
    base_meta
  end


  def create(attributes)
    employee = Employee.new(attributes)

    # Check if an employee with the same full name already exists in the same department
    if Employee.exists?(
      first_name: attributes[:first_name],
      last_name: attributes[:last_name],
      department_id: attributes[:department_id]
    )
      # Add error if duplicate found
      employee.errors.add(:base, "An employee with that full name already exists in this department.")
      return employee
    end

    unless employee.valid?
      employee.errors.add(:base, "Employee data is invalid.")
      return employee
    end

    # Save the employee if valid and return the employee object
    if employee.save
      employee
    else
      employee.errors.add(:base, "Employee could not be saved.")
      return employee
    end
  end

  filter :first_name
  filter :last_name
  filter :department_name, :string do
    eq do |scope, value|
      scope.joins(:department).where(departments: { name: value })
    end
  end

  
end
