import styles from './page.module.css'
import connectDB from "@/app/utils/database"
import { PostDB } from "@/app/utils/interfaces";
import { ObjectId } from 'mongodb';
import { ContentBox } from './client';
import clsx from 'clsx';
import Comment from './comment/comment';

export default async function View ({ params }: { params : Promise<{post_id : string}> }) {

   const client = await connectDB;
   const db = client.db('community');
   const { post_id } = await params;
   const result = await db.collection<PostDB>('post').findOne({
      _id: new ObjectId(post_id)
   })

   if(result === null) 
      return console.error('데이터를 찾아오지 못했습니다.');

   return (
      <section className={clsx(styles.view_container, 'containerV1')}>
         <h2 className={styles.title}>{result?.title}</h2>

         <article className={styles.content_box}>
            <ContentBox contentDB={{ content: result.content }} />
         </article>

         <Comment post_id={post_id} />
      </section>
   )
}