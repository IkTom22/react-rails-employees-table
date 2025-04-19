import EmployeeTable from './components/EmployeeTable';
import { Toaster } from './components/ui/toaster';

const App = () => {
  return (
    <div className="w-full px-6 pt-8">
      <h1 className="text-2xl font-bold underline">Keyhook Test Project</h1>
      <EmployeeTable />
      <Toaster />
    </div>
  );
};

export default App;
