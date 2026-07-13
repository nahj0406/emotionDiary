import { useState } from 'react';
import styles from './pagination.module.css'
import clsx from 'clsx';
import SvgIcon from '../../img/svg/icon/svgIcon';

type PaginationProps<T> = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export default function PagiNation<T> ({
   page,
   pageSize,
   totalItems,
   onPageChange,
}:PaginationProps<T>) {
   
   // const [page, setPage] = useState(1);
   const totalPage = Math.max(
      1,
      Math.ceil(totalItems / pageSize)
   );

   if (totalPage <= 1) {
      return null;
   }

   const pageGroup = Math.ceil(page / pageSize);
   const startPage = (pageGroup - 1) * pageSize + 1;
   const endPage = Math.min(startPage + (pageSize - 1), totalPage);

   const pageNumbers = Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
  );

  console.log(totalPage);

   return (
      <div className={styles.pagination}>
         <button
            type="button"
            className={clsx(styles.action_btn, styles.prev_btn, {[styles.disabled]:startPage <= 1})}
            onClick={() => onPageChange(startPage - 1)}
            disabled={startPage <= 1}
         >
            <SvgIcon name={'arrow_lr'} ></SvgIcon>
         </button>

         {pageNumbers.map(number => (
            <button
               key={number}
               type="button"
               onClick={() => onPageChange(number)}
               className={
               page === number
                  ? styles.active
                  : ''
               }
            >
               {number}
            </button>
         ))}

         <button
            type="button"
            className={clsx(styles.action_btn, styles.next_btn, {[styles.disabled]:endPage >= totalPage})}
            onClick={() => onPageChange(endPage + 1)}
            disabled={endPage >= totalPage}
         >
            <SvgIcon name={'arrow_lr'} ></SvgIcon>
         </button>
      </div>
   )
}