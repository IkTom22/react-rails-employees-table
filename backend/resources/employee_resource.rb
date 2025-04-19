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

  # define it as a class method using self.
  def self.create(attributes)
    puts "Raw attributes: #{attributes.inspect}"
  
    # Convert string keys to symbols if needed
    attrs = attributes.is_a?(Hash) ? attributes.transform_keys(&:to_sym) : attributes
    puts "Converted attributes: #{attrs.inspect}"
  
    # Permit only relevant fields
    permitted = attrs.slice(:first_name, :last_name, :age, :position, :department_id)
    puts "Permitted attributes: #{permitted.inspect}"
  
    # Normalize for duplicate check
    first_name = permitted[:first_name].to_s.strip.downcase
    last_name  = permitted[:last_name].to_s.strip.downcase
    dept_id    = permitted[:department_id]
    puts "first_name: #{first_name}"
    # Duplicate check
    existing = Employee.where(
      "LOWER(TRIM(first_name)) = ? AND LOWER(TRIM(last_name)) = ? AND department_id = ?",
      first_name, last_name, dept_id
    ).first

    if existing 
      employee = Employee.new(permitted)
      employee.errors.add(:base, "An employee: #{permitted[:first_name]} #{permitted[:last_name]} already exists in this department.")
      return { ok: false, errors: employee.errors.full_messages }
    end
  
    # Create and validate employee
    employee = Employee.new(permitted)
    unless employee.valid?
      puts "Validation errors: #{employee.errors.full_messages.inspect}"
     
      return {ok: false,  errors: employee.errors.full_messages }
    end
  
    begin
      if employee.save
        puts "Employee successfully created!"
        return {ok: true, data: employee}
        
      else
        puts "Failed to save employee: #{employee.errors.full_messages.inspect}"
        raise Graphiti::Errors::RecordInvalid.new(employee)
       
        return { ok: false, errors: employee.errors.full_messages }
      end
    rescue => e
      puts "Exception: #{e.class} - #{e.message}"
      puts e.backtrace
      raise e
    end
  end


  
  def self.default_sort
    [{ first_name: :asc }]
  end
 
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