class DepartmentResource < Graphiti::Resource
  self.adapter = Graphiti::Adapters::ActiveRecord
  self.model = Department
  self.type = :departments

  attribute :name, :string

  # Define the relationship with employees
  has_many :employees, type: :employees
end
