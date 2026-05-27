import styles from "./css/page.module.css";
import MainList from "./client";
import { getPosts } from "@/utils/posts";


export default async function Home() {

   const posts = await getPosts();
   
   return (
      <main className={styles.main}>
         <MainList list={posts} />
      </main>
   );
}
