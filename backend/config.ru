require './app'
require 'rack/cors'
require 'logger'

use Rack::Cors do
  allow do
    origins 'http://localhost:5173'
    resource '*', headers: :any, methods: %i[get post delete put options]
  end
end

run EmployeeDirectoryApp
