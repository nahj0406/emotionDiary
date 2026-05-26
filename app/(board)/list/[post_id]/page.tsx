import styles from './page.module.css'
import connectDB from "@/utils/database"
import { PostDB } from "@/utils/types/interfaces";
import { ObjectId } from 'mongodb';
import { ContentBox, Recommend } from './client';
import clsx from 'clsx';
import Comment from './comment/comment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';


export default async function View ({ params }: { params : Promise<{post_id : string}> }) {

   const client = await connectDB;
   const db = client.db('community');
   const { post_id } = await params;
   const result = await db.collection<PostDB>('post').findOne({
      _id: new ObjectId(post_id)
   })
   const session = await getServerSession(authOptions);

   if (result === null) {
      return <div>데이터를 불러오지 못했습니다.</div>;
   }

   if (!result) {
      return <div>게시글이 없습니다.</div>;
   }

   const book = result.books;
   const createdAt = result.createdAt && 
      new Date(result?.createdAt).toLocaleString('ko-KR');

   return (
      <section className={clsx(styles.view_container, 'containerV1')}>
         <h2 className={styles.title}>{result?.title}</h2>
         <p>작성일: {createdAt}</p>

         {
            result?.imageUrl &&
            <img src={result.imageUrl} alt="ddd" width={200} />
         }

         <p>책 제목: {book?.bookTitle}</p>
         <p>출판사: {book?.bookPublisher}</p>
         <p>저자: {book?.bookAuthor}</p>
         <p>구매처: {book?.bookLink}</p>

         <Recommend session={session} postItem={{...result, _id: result._id.toString(),}}></Recommend>

         <article className={styles.content_box}>
            <ContentBox contentDB={{ content: result.content }} />
         </article>

         <Comment post_id={post_id} />
      </section>
   )
}