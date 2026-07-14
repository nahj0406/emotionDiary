'use client'

import { useState } from 'react';
import type { SubmitEventHandler } from 'react';
import styles from './searchBar.module.css'
import { usePathname, useRouter, useSearchParams, } from 'next/navigation';
import SvgIcon from '../../img/svg/icon/svgIcon';

export default function SearchBar() {
   const [keyword, setKeyword] = useState('');

   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const searchSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
      e.preventDefault();

      const trimmedKeyword = keyword.trim();
      const currentPath = pathname ?? '/';

      const params = new URLSearchParams(
         searchParams?.toString() ?? ''
      );

      if (trimmedKeyword) {
         params.set('keyword', trimmedKeyword);
      } else {
         params.delete('keyword');
      }

      params.delete('page');

      const queryString = params.toString();

      // router.push(
      //    queryString
      //       ? `${currentPath}?${queryString}`
      //       : currentPath
      // );

      router.push(queryString ? `/?${queryString}` : '/');
      
   };

   return (
      <form onSubmit={searchSubmit} className={styles.searchBar}>
         <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어를 입력해 주세요."
         />

         <button type="submit"><SvgIcon name={'search'} width={'22px'}></SvgIcon></button>
      </form>
   );
}