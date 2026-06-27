import styles from "./css/page.module.css";
import MainList from "./client";

import { getPosts } from "@/utils/posts";
import { mergePosts } from "@/lib/mongoDB/mergePosts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getUserById } from "@/lib/mongoDB/getUserById";

export default async function Home() {

   const posts = await getPosts();
   const merged = await mergePosts(posts);
   const session = await getServerSession(authOptions);
   let userInfo = null;
   
   if(session?.user.id) {
      userInfo = await getUserById(session?.user.id);
   }
   const safeUser = userInfo
      ? JSON.parse(JSON.stringify(userInfo))
      : null;
   
   return (
      <main className={styles.main}>
         <MainList initialPosts={merged} user={safeUser} />
      </main>
   );
}