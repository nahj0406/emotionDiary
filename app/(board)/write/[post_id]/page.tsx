import clsx from "clsx"
import styles from '../page.module.css'
import getCollectionItems from "@/lib/mongoDB/getCollectionItems";
import getCategories from '@/lib/mongoDB/getCategories';
import WriteFrame from '../client';
import connectDB from "@/lib/mongoDB/database/database";
import { PostDB } from "@/types/interfaces";
import { ObjectId } from "mongodb";
import { serializePost } from "@/utils/serializePost";


export default async function Edit ({params}: {params: Promise<{post_id : string}>}) {
   const tags = await getCollectionItems('tags');
   const db = (await connectDB).db('community');
   const categories = await getCategories();
   const { post_id } = await params;
   const post = await db.collection<PostDB>('post').findOne({
      _id: new ObjectId(post_id)
   });

   let editPost = null;

   if(post) {
      editPost = serializePost(post); 
   }

   return (
      <section className={clsx(styles.layer_box, 'containerV1')}>
         <WriteFrame initialTags={tags} initialCat={categories} edit={editPost} />
      </section>
   )
}