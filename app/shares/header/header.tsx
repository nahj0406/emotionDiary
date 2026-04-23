import styles from './header.module.css'
import { MenuLink, SignWrapper } from './client'

export default function Header() {

   return (
      <header className={styles.header}>
        <nav className={styles.outer}>
          <MenuLink href={'/'}>홈</MenuLink>
          <MenuLink href={'/list'}>리스트</MenuLink>
          <MenuLink href={'/list/write'}>작성하기</MenuLink>
        </nav>

        <SignWrapper></SignWrapper>
      </header>
   )
}