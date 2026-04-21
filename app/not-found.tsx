
import clsx from 'clsx'
import { BackBtn } from './client'
import styles from './page.module.css'

export default function NotFound () {

   return (
      <div className={clsx(styles.Not_found, 'containerV1')}>
         <h1>404 에러</h1>
         <p>존재하지 않는 페이지입니다.</p>
         <BackBtn></BackBtn>
      </div>
   )
}