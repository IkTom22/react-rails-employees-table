class Employee < ActiveRecord::Base
  belongs_to :department, foreign_key: 'department_id'

  validates :first_name, :last_name, presence: true
  validates :age, numericality: { only_integer: true }, allow_nil: true
  validate :name_must_be_unique_within_department

  private

  def name_must_be_unique_within_department
    return if first_name.blank? || last_name.blank? || department_id.blank?

    existing = Employee.where(
      first_name: first_name,
      last_name: last_name,
      department_id: department_id
    )

    existing = existing.where.not(id: id) if persisted?

    if existing.exists?
      errors.add(:base, "An employee with the same name already exists in this department.")
    end
  end
end
