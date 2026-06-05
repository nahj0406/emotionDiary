import { getServerSession } from 'next-auth'
import styles from './page.module.css'
import connectDB from '@/lib/mongoDB/database/database';
import { UserDB } from '@/types/interfaces';
import { ObjectId } from 'mongodb';
import { Infomation } from './client';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function Mypage() {

   const session = await getServerSession(authOptions);
   let userInfo = null;

   if(session?.user.id) {
      const client = await connectDB;
      const db = client.db('community');
      userInfo = await db.collection<UserDB>('user').findOne({_id: new ObjectId(session?.user?.id)});
   }

   console.log(session)

   const safeUser = userInfo
      ? JSON.parse(JSON.stringify(userInfo))
      : null;


   return (
      <section className="containerV1">
         <h2>마이페이지</h2>

         <Infomation user={safeUser} />
      </section>
   )
}