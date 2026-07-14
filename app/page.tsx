import styles from "./css/page.module.css";
import MainList from "./client";

import { getPosts } from "@/utils/posts";
import { mergePosts } from "@/lib/mongoDB/mergePosts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getUserById } from "@/lib/mongoDB/getUserById";
import getTags from "@/lib/mongoDB/getTags";
import { getSearchPosts } from "@/utils/getSearchPosts";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string }>;
}) {
   const { keyword } = await searchParams;
   const posts = keyword ? await getSearchPosts(keyword) : await getPosts();
   const merged = await mergePosts(posts);
   const getTag = await getTags();
   const getSession = await getServerSession(authOptions);
   
   const [tags, session] = await Promise.all([getTag, getSession]);


   const userInfo = 
   session?.user.id 
   ? await getUserById(session.user.id)
   : null;
   
   return (
      <main className={styles.main}>
         <MainList key={keyword ?? ''} initialPosts={merged} user={userInfo} initialTags={tags} />
      </main>
   );
}