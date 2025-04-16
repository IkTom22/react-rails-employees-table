# cleanup_employees.rb
require './app' # or wherever your ActiveRecord config is defined

Employee.where(first_name: [nil, ''], last_name: [nil, '']).each do |e|
  puts "Deleting: #{e.inspect}"
  e.destroy
end
