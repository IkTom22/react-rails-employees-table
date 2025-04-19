require 'faker'
require 'active_record'
require './seeds'
require 'kaminari'
require 'sinatra/base'
require 'graphiti'
require 'graphiti/adapters/active_record'

class ApplicationResource < Graphiti::Resource
  self.abstract_class = true
  self.adapter = Graphiti::Adapters::ActiveRecord
  self.base_url = 'http://localhost:4567'
  self.endpoint_namespace = '/api/v1'
  # implement Graphiti.config.context_for_endpoint for validation
  self.validate_endpoints = false
end


  # Graphiti.config.context_for_endpoint = ->(path, action) { {} }
Graphiti.config.context_for_endpoint = ->(path, action) { nil }
Graphiti.setup!

require './resources/employee_resource'
require './resources/department_resource'

class EmployeeDirectoryApp < Sinatra::Application
  
  configure do
    mime_type :jsonapi, 'application/vnd.api+json'
  end

  before do
    content_type :jsonapi
  end

  after do
    ActiveRecord::Base.connection_handler.clear_active_connections!
  end

  get '/api/v1/departments' do
    departments = DepartmentResource.all(params)
    departments.to_jsonapi
  end

  get '/api/v1/departments/:id' do
    departments = DepartmentResource.find(params)
    departments.to_jsonapi
  end

  get '/api/v1/employees' do
    employees = EmployeeResource.all(params)
    employees.to_jsonapi
  end
  
  get '/api/v1/employees/:id' do
    employee = EmployeeResource.find(params)
    employee.to_jsonapi
  end

  delete '/api/v1/employees/:id' do
    employee = EmployeeResource.find(id: params[:id]).data
    if employee 
      employee.destroy
      status 204
      body nil
    else 
      status 404
      json error: "Employee not found"  
    end
  end
    
  post '/api/v1/employees' do
    payload = JSON.parse(request.body.read)
    puts "PARSED PAYLOAD: #{payload.inspect}"
    attributes = payload["data"]["attributes"]
    # Inspect the parsed attributes
    result = EmployeeResource.create(attributes)
    puts "Employee result: #{result.inspect}"


    if result[:ok]
      status 201
      result[:data].to_json
    else
      status 422
      { status: status, errors: result[:errors] }.to_json
    end
  end
end
