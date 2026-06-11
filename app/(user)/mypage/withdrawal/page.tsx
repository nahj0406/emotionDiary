import { getUserById } from "@/lib/mongoDB/getUserById";
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import {WithDrawalClient } from "./client";


export default async function withDrawal () {

   const session = await getServerSession(authOptions);
   let userInfo = null;

   if(session?.user.id) {
      userInfo = await getUserById(session?.user.id);
   }

   // console.log('dd', session?.user.id);

   const serializedUser = JSON.parse(
      JSON.stringify(userInfo)
   )

   return (
      <section className="containerV1">
         <WithDrawalClient userInfo={serializedUser} />
      </section>
   )
}