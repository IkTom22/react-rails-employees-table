import {useState} from "react";
import { LuChevronsUpDown } from "react-icons/lu";

type SortButtonProps = {
    column: string;
    onSort: (sort: {[key:string]: 'asc' | 'desc'}) =>void;
}
const SortButton = (props:SortButtonProps) => {
    const { column, onSort } =props
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const handleSort = ()=>{
        const newSortDirection = sortDirection === 'asc' ? 'desc': 'asc';
        setSortDirection(newSortDirection)

        //Update the order object
        onSort({[column]: sortDirection})
    }

  return (
    <button onClick={(handleSort)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-[2px] text-sm rounded-md cursor-pointer hover:bg-green-300 transition ease-in-out duration-200">
        <LuChevronsUpDown />
    </button>);
};

export default SortButton;
