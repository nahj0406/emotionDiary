
import WriteFrame from './client';
import styles from './page.module.css';
import clsx from "clsx";
import getTags from "@/lib/mongoDB/getTags";
import getCategories from '@/lib/mongoDB/getCategories';

export default async function Write() {

   const tags = await getTags();
   const categories = await getCategories();

   return (
      <section className={clsx(styles.layer_box, 'containerV1')}>
         <WriteFrame initialTags={tags} initialCat={categories} />
      </section>
   )
}