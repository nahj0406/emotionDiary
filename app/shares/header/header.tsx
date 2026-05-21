import styles from './header.module.css'
import { MenuLink, SignWrapper } from './client'
import connectDB from '@/utils/database'
import { UserDB } from '@/utils/types/interfaces';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

export default async function Header() {

  const session = await getServerSession();
  let userInfo = null;
  // console.log(session);

  if(session?.user?.id) {
    const client = await connectDB;
    const db = client.db('community');
    userInfo = await db.collection<UserDB>('user_cred').findOne({_id: new ObjectId(session?.user?.id)});
  }

  const safeUser = userInfo
    ? JSON.parse(JSON.stringify(userInfo))
    : null;

   return (
      <header className={styles.header}>
        <nav className={styles.outer}>
          <MenuLink href={'/'}>홈</MenuLink>
          <MenuLink href={'/list'}>리스트</MenuLink>
          <MenuLink href={'/write'}>작성하기</MenuLink>
        </nav>

        <SignWrapper user={safeUser}></SignWrapper>
      </header>
   )
}