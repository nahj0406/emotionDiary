import { Dispatch, SetStateAction, useState } from 'react';
import styles from './searchBar.module.css'
import { PostCardDTO } from "@/types/interfaces"


export default function SearchBar (
   {
      sort,
      setList
   }:{
      sort: string;
      setList: Dispatch<SetStateAction<PostCardDTO[]>>
   }) {

   const [keyword, setKeyword] = useState<string>('');

   const search = async () => {
      const res = await fetch(
         `/api/post/search/route?q=${encodeURIComponent(keyword)}&sort=${sort}`
      );

      const data = await res.json();

      setList(data);
   }

   return (
      <div className={styles.searchBar}>
         <input 
            type="search" 
            value={keyword}
            onChange={(e)=> setKeyword(e.target.value)}
            placeholder='검색어를 입력해 주세요.'
         />

         <button onClick={search}>검색하기</button>
      </div>
   )
}