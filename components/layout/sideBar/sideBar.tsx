import styles from './sideBar.module.css'
import { MenuLink, SignWrapper, MenuOuter } from './client'
import connectDB from '@/lib/mongoDB/database/database'
import { UserDB } from '@/types/interfaces';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import MainLogoIcon from "@/components/ui/img/svg/mainLogo/mainLogo";

export default async function SideBar() {

   const session = await getServerSession();
   let userInfo = null;

   if(session?.user?.id) {
      const client = await connectDB;
      const db = client.db('community');
      userInfo = await db.collection<UserDB>('user').findOne({_id: new ObjectId(session?.user?.id)});
   }

   const safeUser = userInfo
      ? JSON.parse(JSON.stringify(userInfo))
      : null;

      return (
         <header className={styles.header}>
            <MenuLink href={'/'}>
               <MainLogoIcon />
            </MenuLink>

            <MenuOuter />

            {/* <SignWrapper user={safeUser}></SignWrapper> */}
         </header>
      )
}