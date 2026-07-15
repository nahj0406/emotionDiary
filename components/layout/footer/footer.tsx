'use client'

import Link from 'next/link'
import styles from './footer.module.css'
import clsx from 'clsx'

export default function Footer() {
   return (
      <footer className={styles.footer}>
         <div className={styles.link_box}>
            <Link className='paperLogy' href={'/privacy'}>개인정보 처리방침</Link>
            <Link className='paperLogy' href={'/trim'}>이용약관</Link>
         </div>

         <p className={clsx(styles.copyright, 'paperLogy')}>Copyright © www.nanubook.com All rights reserved.</p>
      </footer>
   )
}