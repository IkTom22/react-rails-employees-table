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

  def create(attributes)
    permitted = attributes.slice(:first_name, :last_name, :age, :position, :department_id) if attributes
    employee = Employee.new(permitted)
    
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
      raise Graphiti::Errors::RecordInvalid.new(employee)
      employee.errors.add(:base, "Employee could not be saved.")
      return employee
    end
  end

  # def self.default_sort
  #   [{ first_name: :asc }]
  # end
 
  # def apply_sort(scope, attribute, direction)
  #   puts "apply_sort scope class: #{scope.class}"
  #   return scope unless scope.respond_to?(:order) # prevents the error
  #   if attribute && direction
  #     scope.order(attribute => direction)
  #   else
  #     scope
  #   end
  # end
 

  def self.apply_sorting(scope, params)
    if params[:sort]
      field, direction = params[:sort].split(":")
      direction = direction == "desc" ? :desc : :asc
      scope = scope.order(field.to_sym => direction)
    end
    scope
  end

  # Custom pagination (if necessary)
  def paginate(scope, params)
    page = params[:page] || {}
    page_number = page[:number].to_i || 1
    page_size = page[:size].to_i || 10
    puts "Page Number: #{page_number}, Page Size: #{page_size}"
    scope.page(page_number).per(page_size)
     # Ensure scope is an ActiveRecord::Relation before calling `.page`
    if scope.respond_to?(:page)
      scope = scope.page(page_number).per(page_size)
    else
      # Handle the case where scope is not an ActiveRecord relation
      raise "Scope is not an ActiveRecord relation."
    end

    scope
  end
  
  # This is where we generate meta information
  def meta(options)
    # Get base meta data from Graphiti, if available
    base_meta = super(options) 
    base_meta[:positions] = Employee.distinct.pluck(:position).compact.sort
    base_meta
   
  end

  
  filter :first_name
  filter :last_name
  filter :department_name, :string do
    eq do |scope, value|
      puts "department_name filter scope class: #{scope.class}"
      scope.joins(:department).where(departments: { name: value })
    end
  end

end
