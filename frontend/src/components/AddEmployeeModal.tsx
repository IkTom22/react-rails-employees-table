import { useEffect, useState } from 'react';
import Employee from '../models/Employee';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

import { DepartmentAttributes } from '@/type';

import { IoClose } from 'react-icons/io5';
import { CgClose } from 'react-icons/cg';

interface PropsType {
  toggleModal: () => void;
  allDepartments: DepartmentAttributes[];
}
const AddEmployeeModal = (props: PropsType) => {
  const { allDepartments, toggleModal } = props;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCreation, setErrorCreation] = useState('');
  const [successCreation, setSuccessCreation] = useState('');

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
        setErrorCreation('');
      }, 5000);
    }
  }, [errorCreation]);

  useEffect(() => {
    if (successCreation) {
      setTimeout(() => {
        setSuccessCreation('');
      }, 5000);
    }
  });

  const handleSubmit = async () => {
    console.log('submit clicked!');
    const relatedDepartment = allDepartments.find(
      (d) => d.name === selectedDepartment
    );
    const departmentId = relatedDepartment
      ? parseInt(relatedDepartment.id, 10)
      : null;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      age: parseInt(age, 10),
      position: position,
      department_id: departmentId,
    };

    try {
      console.log('employeeData: ', payload);
      const newEmployee = new Employee(payload);
      console.log('newEmployee: ', newEmployee);

      console.log('newEmployee: ', newEmployee);
      setSuccessCreation(
        `New employee ${newEmployee.firstName} ${newEmployee.lastName} is created!`
      );
      console.log(
        `New employee ${newEmployee.firstName} ${newEmployee.lastName} is created!`
      );
      setFirstName('');
      setLastName('');
      setAge('');
      setPosition('');
      setSelectedDepartment('');
      toggleModal();
      await newEmployee.save();
    } catch (error) {
      setErrorCreation(`Something went wrong... Please try again.`);
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
    <div className="w-screen h-screen flex items-center justify-center absolute left-0 top-0">
      <div className="w-screen h-screen bg-slate-900 bg-opacity-75 absolute left-0 top-0"></div>
      <div className="w-[425px] flex flex-col gap-4 rounded-md bg-white p-8 z-50">
        <div className="w-full flex justify-between items-center">
          <h1>Add New Employee</h1>
          <button
            onClick={toggleModal}
            className="hover:text-red-500 transition-all ease-in-out duration-200"
          >
            <CgClose />
          </button>
        </div>

        <form className="grid gap-4">
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
        </form>
        <button
          // type="submit"
          onClick={handleSubmit}
          className="mt-4 px-3 py-2 rounded-md border-2 border-slate-800 bg-green-200 cursor-pointer hover:bg-green-300 transition ease-in-out duration-200"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
