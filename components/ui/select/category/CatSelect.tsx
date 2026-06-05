import { CategoryDTO } from "@/types/interfaces"


type Props = {
   array: CategoryDTO[];
   value: string;
   onChange: (value: string) => void;
   defaultOption: string;
   disabled?: boolean;
}

export default function CatSelect({
   array,
   value,
   onChange,
   defaultOption,
   disabled
}: Props) {
   return (
      <select 
         value={value}
         onChange={(e)=> onChange(e.target.value)}
         disabled={disabled}
      >
         <option value=''>{defaultOption}</option>
         {
            array.map((cat: CategoryDTO, i: number)=> {
               return (
                  <option value={cat._id} key={`${cat.slug}_${i}`}>
                     {cat.name}
                  </option>
               )
            })
         }
      </select>
   )
}