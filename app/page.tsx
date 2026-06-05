import styles from "./css/page.module.css";
import MainList from "./client";

import { getPosts } from "@/utils/posts";
import { mergePosts } from "@/lib/mongoDB/mergePosts";

export default async function Home() {

   const posts = await getPosts();
   const merged = await mergePosts(posts);
   
   return (
      <main className={styles.main}>
         <MainList initialPosts={merged} />
      </main>
   );
}
