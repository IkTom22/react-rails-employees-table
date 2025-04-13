import React, { useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  EmployeeType,
  FetchedEmployeeDataType,
  IncludedDepartmentDataType,
  DepartmentAttributes,
} from '../type';
import Employee from '../models/Employee';
import Department from '../models/Department';

import SortButton from './SortButton';
import AddNewEmployeeModal from './AddNewEmployeeModal';
import {
  CgChevronLeftR,
  CgChevronRightR,
  CgPushChevronLeft,
  CgPushChevronRight,
} from 'react-icons/cg';
import { IoClose } from 'react-icons/io5';
import { CgSearchLoading, CgSearch, CgCloseR } from 'react-icons/cg';

const columnHelper = createColumnHelper<EmployeeType>();
const columns = [
  columnHelper.accessor('first_name', {
    header: 'First Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('last_name', {
    header: 'Last Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('age', {
    header: 'Age',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('position', {
    header: 'Position',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('department_name', {
    header: 'Department',
    cell: (info) => info.getValue(),
  }),
];
const EmployeeTable = () => {
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [allDepartments, setAllDepartments] = useState<DepartmentAttributes[]>(
    []
  );
  const [totalEmployeeNum, setTotalEmployeeNum] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchFirstNameTerm, setSearchFirstNameTerm] = useState<string>('');
  const [searchLastNameTerm, setSearchLastNameTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sort, setSort] = useState<Record<string, 'asc' | 'desc'>>({
    first_name: 'asc',
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [toggleSearch, setToggleSearch] = useState(false);
  const [showDepartments, setShowDepartments] = useState(false);

  console.log(errorMessage);
  console.log('totalEmployeeNum: ', totalEmployeeNum);
  //    const [pageSize, setPageSize] = uesState(10)
  const pageSize = 10;

  const goToPreviousPage = () => {
    if (pageIndex > 1) {
      setPageIndex(pageIndex - 1);
    }
  };
  const goToNextPage = () => {
    if (pageIndex < totalPages) {
      setPageIndex(pageIndex + 1);
    }
  };
  // const [sorting, setSorting] = React.useState([{ id: 'first_name', desc: false }]);
  const fetchAllDepartments = async () => {
    try {
      const response = await Department.all();
      const departmentsData = response['_raw_json'].data.map(
        (data: { id: string; type: string; attributes: { name: string } }) => ({
          id: data.id,
          name: data.attributes.name,
        })
      );

      setAllDepartments(departmentsData);
    } catch (error) {
      console.error(
        'Something went wrong with fetching all departments: ',
        error
      );
    }
  };
  const fetchEmployees = async () => {
    setErrorMessage(null);
    try {
      console.log('fetching data.....');
      const response = await Employee.where({
        first_name: searchFirstNameTerm,
        last_name: searchLastNameTerm,
      })
        .where({ department_name: selectedDepartment })
        .order(sort)
        .page(pageIndex)
        .per(pageSize)
        .stats({ total: ['count'] })
        .includes('department')
        .all();
      console.log('response---------', response);

      const employeeCount = response['_raw_json'].meta.stats?.total?.count;
      setTotalEmployeeNum(employeeCount);
      const maxPagesNum = Math.ceil(employeeCount / pageSize);
      setTotalPages(maxPagesNum);

      const relatedDepartments = response['_raw_json'].included?.map(
        (d: IncludedDepartmentDataType) => ({
          id: parseInt(d.id, 10),
          name: d.attributes.name,
        })
      );
      console.log(response.data);
      const updatedData = response['_raw_json'].data.map(
        (employee: FetchedEmployeeDataType) => {
          const relatedDepartment: { id: number; name: string } =
            relatedDepartments.find(
              (d: { id: number; name: string }) =>
                d.id === employee.attributes.department_id
            );
          const departmentName = relatedDepartment
            ? relatedDepartment.name
            : 'Unknown Department';
          return {
            ...employee.attributes,
            department_name: departmentName,
          };
        }
      );
      console.log('updatedData: ', updatedData);
      if (allDepartments.length === 0) {
        fetchAllDepartments();
      }
      setEmployees(updatedData);
    } catch (error) {
      console.log('Spraypaint error: ', error);
      setErrorMessage('Something went wrong...! ');
    }
  };

  //Fetchdata from backend
  useEffect(() => {
    fetchEmployees();
  }, [
    pageIndex,
    pageSize,
    sort,
    searchFirstNameTerm,
    searchLastNameTerm,
    selectedDepartment,
    totalPages,
    totalEmployeeNum,
  ]);
  useEffect(() => {
    setPageIndex(1);
  }, [searchFirstNameTerm, searchLastNameTerm, selectedDepartment]);
  //Handle searchInput
  const handleFirstNameSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFirstNameTerm(e.target.value);
  };
  const handleLastNameSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchLastNameTerm(e.target.value);
  };
  const handleSort = (newSort: { [key: string]: 'asc' | 'desc' }) => {
    setSort(newSort);
  };
  const handleSelectDepartment = (value: string) => {
    setSelectedDepartment((prev) => (value === prev ? '' : value));
  };
  const clearFirstName = () => {
    setSearchFirstNameTerm('');
  };
  const clearLastName = () => {
    setSearchLastNameTerm('');
  };
  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // onPaginationChange: setPagination,
    debugTable: true,
    manualPagination: true,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    autoResetPageIndex: true,
    pageCount: totalPages,
  });

  const handleToggleSearch = () => {
    setToggleSearch(!toggleSearch);
  };

  const handleCloseSearch = () => {
    setToggleSearch(!toggleSearch);
    setSearchFirstNameTerm('');
    setSearchLastNameTerm('');
    setSelectedDepartment('');
  };
  const handleShowByDepartment = () => {
    setShowDepartments(!showDepartments);
  };
  const handleCloseDepartment = () => {
    setShowDepartments(!showDepartments);
    setSelectedDepartment('');
  };

  return (
    <div className="w-full mx-outo mt-8">
      {/* Search bar */}
      <div className="w-full flex justify-between mb-4">
        <div className={`flex gap-3 items-end ${toggleSearch && '-mt-[20px]'}`}>
          <div>
            <AddNewEmployeeModal allDepartments={allDepartments} />
          </div>
          {!toggleSearch ? (
            <button
              onClick={handleToggleSearch}
              className="p-2 rounded-sm bg-sky-300 border-2 border-slate-800"
            >
              <CgSearchLoading />
            </button>
          ) : (
            <div className="flex gap-2 items-end">
              <button
                className="my-auto translate-y-1/2 bg-rose-200 hover:bg-rose-300 transition ease-in-out duration-200"
                onClick={handleCloseSearch}
              >
                <CgCloseR />
              </button>
              <div className="flex flex-col w-40 relative">
                <label
                  htmlFor="first-name"
                  className=" flex gap-1 items-center text-sm"
                >
                  <span className="text-sm mt-1">
                    <CgSearch />
                  </span>
                  <span>first name</span>
                </label>
                <input
                  id="first name"
                  type="text"
                  value={searchFirstNameTerm}
                  onChange={handleFirstNameSearch}
                  placeholder="Search by first name"
                  className="w-40 h-[2.21rem] p-2 border-2 border-slate-800 rounded-md"
                />
                {searchFirstNameTerm && (
                  <button
                    onClick={clearFirstName}
                    className="absolute right-3 top-1/2 mt-[2px] text-red-400 z-50"
                  >
                    <IoClose />
                  </button>
                )}
              </div>
              <div className="flex flex-col w-40 relative">
                <label
                  htmlFor="last-name"
                  className=" flex gap-1 items-center text-sm"
                >
                  <span className="text-sm mt-1">
                    <CgSearch />
                  </span>
                  <span>last name</span>
                </label>
                <input
                  type="text"
                  value={searchLastNameTerm}
                  onChange={handleLastNameSearch}
                  placeholder="Search by last  name"
                  className="w-40 h-[2.21rem] p-2 border-2 border-slate-800 rounded-md"
                />
                {searchLastNameTerm && (
                  <button
                    onClick={clearLastName}
                    className="absolute right-3 top-1/2 mt-[2px] text-red-400 z-50"
                  >
                    <IoClose />
                  </button>
                )}
              </div>
              <div className="w-[420px] relative">
                {!showDepartments ? (
                  <button
                    onClick={handleShowByDepartment}
                    className="flex gap-2 items-center h-[2.21rem] p-2 border-2 border-slate-800 rounded-md bg-cyan-200"
                  >
                    {' '}
                    <span className="text-sm mt-1">
                      <CgSearch />
                    </span>
                    <span>By departments</span>
                  </button>
                ) : (
                  <div className="absolute left-0 bottom-0 z-50 w-full flex flex-wrap gap-3 border-2 border-slate-800 px-3 py-2 rounded-md">
                    {allDepartments.length > 0 && (
                      <div className="flex gap-2 justify-center items-center">
                        <button
                          className=" bg-rose-200 hover:bg-rose-300 transition ease-in-out duration-200"
                          onClick={handleCloseDepartment}
                        >
                          <CgCloseR />
                        </button>
                        <div className="w-full flex flex-wrap gap-3">
                          {' '}
                          {allDepartments.map(
                            (department: { name: string }) => (
                              <button
                                key={department.name}
                                className={`px-1 border-2 border-slate-600 rounded-md 
                        text-sm cursor-pointer hover:bg-cyan-200 transition 
                        ease-in-out duration-200 ${selectedDepartment === department.name ? 'bg-cyan-200' : 'bg-white'}`}
                                onClick={() =>
                                  handleSelectDepartment(department.name)
                                }
                              >
                                {department.name}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* pagination */}
        <div className="flex gap-4 items-end pr-2">
          <div className="flex gap-1 items-end">
            <button onClick={() => setPageIndex(1)} className="text-xl">
              <CgPushChevronLeft />
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={pageIndex === 1}
              className="text-xl"
            >
              <CgChevronLeftR />
            </button>
          </div>
          <div className="-mb-[2px] flex gap-1 ">
            <span className="text-center">Page</span>
            <span>{pageIndex}</span>
          </div>

          <div className="flex gap-1 items-end">
            <button
              className={`rounded ${pageIndex === totalPages && 'bg-gray-400 cursor-not-allowed'} text-xl`}
              onClick={goToNextPage}
              disabled={pageIndex === totalPages}
            >
              <CgChevronRightR />
            </button>
            <button
              className={`rounded ${pageIndex === totalPages && 'bg-gray-400 cursor-not-allowed'} text-lg`}
              onClick={() => setPageIndex(totalPages)}
            >
              <CgPushChevronRight />
            </button>
          </div>
        </div>
      </div>
      {/* table */}
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border ">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 border-2 border-slate-800 relative"
                >
                  <div>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </div>
                  {header.column.columnDef.header !== 'Department' && (
                    <SortButton onSort={handleSort} column={header.column.id} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 border-2 text-cneter border-slate-800"
                >
                  <div className="flex justify-center items-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
