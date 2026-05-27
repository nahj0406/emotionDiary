
import clsx from 'clsx'
import styles from './page.module.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import connectDB from '@/lib/mongoDB/database';
import { UserDB } from '@/types/interfaces';
import { ObjectId } from 'mongodb';
import { EditFrame } from './client'

export default async function InfoEdit() {

   const session = await getServerSession(authOptions);
   let userInfo = null;

   if(session?.user.id) {
      const client = await connectDB;
      const db = client.db('community');
      userInfo = await db.collection<UserDB>('user_cred').findOne({_id: new ObjectId(session?.user?.id)});
   }

   const safeUser = userInfo 
      ? JSON.parse(JSON.stringify(userInfo))
      : null;

   return (
      <section className={clsx(styles.infoEdit, 'containerV1')}>
         <EditFrame user={safeUser} />
      </section>
   )
}