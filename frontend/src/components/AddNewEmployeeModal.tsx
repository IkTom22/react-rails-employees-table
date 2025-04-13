import { useEffect, useState } from 'react';
// import Employee from '../models/Employee';
import {
  Dialog,
  DialogContent,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

import { DepartmentAttributes } from '@/type';

import { RiUserAddLine } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
const NewEmployeeModal = (props: {
  allDepartments: DepartmentAttributes[];
}) => {
  const { allDepartments } = props;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCreation, setErrorCreation] = useState('');

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(value);
    const parsed = parseInt(value, 10);
    if (value === '') {
      setAge('');
      setErrorMessage('Age is required');
    } else if (isNaN(parsed)) {
      setErrorMessage('Please add numbers');
    } else {
      setAge(value);
      setErrorMessage('');
    }

    console.log('age?:', value);
  };
  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (errorCreation) {
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  }, [errorCreation]);

  const handleSubmit = async () => {
    console.log('submit clicked!');
    const relatedDepartment = allDepartments.find(
      (d) => d.name === selectedDepartment
    );
    const departmentId = relatedDepartment
      ? parseInt(relatedDepartment.id, 10)
      : null;

    const payload = {
      date: {
        type: 'employees',
        attributes: {
          first_name: firstName,
          last_name: lastName,
          age: parseInt(age, 10),
          position: position,
          department_id: departmentId,
        },
      },
    };

    try {
      console.log('employeeData: ', payload);
      const response = await fetch(`${BASE_API_URL}/api/v1/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Employee created:', result);
      } else {
        console.error('Error creating employee:', result.errors || result);
      }
      // const newEmployee = new Employee(payload);
      // await newEmployee.save();
      // console.log('created employee: ', newEmployee);
      // console.log(newEmployee.first_name);
      // console.log(newEmployee.department_id);
      // document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    } catch (error) {
      setErrorCreation(
        `Something went wrong with createing new employee: ${error}`
      );
      console.error(
        'something went wrong with createing new employee --- ',
        error
      );
    }
  };
  useEffect(() => {
    console.log(selectedDepartment);
  }, [selectedDepartment]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 rounded-sm bg-orange-200 border-2 border-slate-800">
          <RiUserAddLine />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        {errorCreation ? (
          <div>{errorCreation}</div>
        ) : (
          <form className="grid gap-4 py-2" onSubmit={handleSubmit}>
            <div className="flex flex-col relative">
              <label htmlFor="first-name" className="text-sm">
                First name
              </label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="py-2 px-3 border border-slate-800 rounded-sm "
                placeholder="first name"
                required
              />
              {firstName && (
                <button
                  onClick={() => setFirstName('')}
                  className="absolute right-4 top-[55%] text-red-400 z-50"
                >
                  <IoClose />
                </button>
              )}
            </div>
            <div className="flex flex-col relative">
              <label htmlFor="last-name" className="text-sm">
                Last name
              </label>
              <input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="py-2 px-3 border border-slate-800 rounded-sm"
                placeholder="last name"
                required
              />
              {lastName && (
                <button
                  onClick={() => setLastName('')}
                  className="absolute right-4 top-[55%] text-red-400 z-50"
                >
                  <IoClose />
                </button>
              )}
            </div>
            <div className="flex flex-col relative">
              <label htmlFor="age" className="text-sm">
                Age
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={handleAgeChange}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== 'Backspace' &&
                    e.key !== 'Delete'
                  ) {
                    e.preventDefault();
                  }
                }}
                className="py-2 px-3 border border-slate-800 rounded-sm "
                placeholder="age"
                min="18"
              />
              {age && (
                <button
                  onClick={() => setAge('')}
                  className="absolute right-9 top-[55%] text-red-400 z-50"
                >
                  <IoClose />
                </button>
              )}
              {errorMessage && (
                <div className="text-sm text-red-500">{errorMessage}</div>
              )}
            </div>
            <div className="flex flex-col relative">
              <label htmlFor="position" className="text-sm">
                Position
              </label>
              <input
                id="position"
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="py-2 px-3 border border-slate-800 rounded-sm"
                placeholder="position"
                required
              />
              {position && (
                <button
                  onClick={() => setPosition('')}
                  className="absolute right-4 top-[55%] text-red-400 z-50"
                >
                  <IoClose />
                </button>
              )}
            </div>
            <div className="w-full">
              <label className="text-sm">Department</label>
              <Select
                value={selectedDepartment}
                onValueChange={(value) => setSelectedDepartment(value)}
              >
                <SelectTrigger className="w-full h-[2.6rem] border border-slate-800 py-2 px-3 rounded-sm">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {allDepartments.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-md border-2 border-slate-800 bg-green-200 cursor-pointer hover:bg-green-300 transition ease-in-out duration-200"
            >
              Submit
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewEmployeeModal;
