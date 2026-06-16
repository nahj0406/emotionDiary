import styles from './page.module.css'
import connectDB from "@/lib/mongoDB/database/database"
import { PostDB, CommentDB, UserDB } from "@/types/interfaces";
import { ObjectId } from 'mongodb';
import { ContentBox, DeleteBtn, Recommend } from './client';
import clsx from 'clsx';
import Comment from './comment/comment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import getCategories from '@/lib/mongoDB/getCategories';
import getTags from '@/lib/mongoDB/getTags';
import Link from 'next/link';
import { dateStringChanger } from '@/utils/dateStringChanger';


export default async function View ({ params }: { params : Promise<{post_id : string}> }) {

   const client = await connectDB;
   const db = client.db('community');
   const { post_id } = await params;
   const post = await db.collection<PostDB>('post').findOne({
      _id: new ObjectId(post_id)
   })

   // 조회수 업데이트
   const views = await db.collection<PostDB>('post').findOneAndUpdate(
      {_id: new ObjectId(post_id)},
      {$inc: {views: 1}},
      {returnDocument: 'after'}
   );

   const comment_list = await db.collection<CommentDB>('comments').find({postId: post?._id}).toArray();
   const session = await getServerSession(authOptions);
   const userInfo = await db.collection<UserDB>('user').findOne({_id: new ObjectId(post?.user.id)});

   const category = await getCategories();
   const tags = await getTags();

   const findNameById = (
      items: { _id: string; name: string }[],
      id: string
      ) => items.find(item => item._id === id)?.name ?? '';

   if (post === null) {
      return <div>데이터를 불러오지 못했습니다.</div>;
   }

   if (!post) {
      return <div>게시글이 없습니다.</div>;
   }

   const book = post.books;
   const createdAt = dateStringChanger(post.createdAt);
   const updatedAt = dateStringChanger(post.updatedAt);

   return (
      <section className={clsx(styles.view_container, 'containerV1')}>
         {
            session?.user.id === post.user.id.toString() &&
               <>
                  <Link href={`/write/${post_id}`}>수정</Link>
                  <DeleteBtn postId={post_id} />
               </>
         }
         <h2 className={styles.title}>{post?.title}</h2>
         {
            userInfo?.thumbnail
               ? <img src={userInfo?.thumbnail} alt="유저 썸네일" />
               : <img src={'/img/unknown.png'} width={20} alt="기본 이미지" />
         }
         <p>작성자: {post?.user.nickName}</p>
         <p>작성일: {createdAt}</p>
         {
            post.updatedAt && 
            <p>수정일: {updatedAt}</p>
         }
         <p>장르: {findNameById(category, post.category.primary)}/{findNameById(category, post.category.secondary)}</p>
         <p>
            성향: {
               post.tags
                  .map(item => findNameById(tags, item))
                  .join('/ ')
            }
         </p>

         {
            post?.thumbnail &&
            <img src={post.thumbnail} alt="ddd" width={200} />
         }

         <p>책 제목: {book?.bookTitle}</p>
         <p>출판사: {book?.bookPublisher}</p>
         <p>저자: {book?.bookAuthor}</p>
         <p>구매처: {book?.bookLink}</p>

         <Recommend session={session} postItem={{...post, _id: post._id.toString(),}}></Recommend>

         <article className={styles.content_box}>
            <ContentBox contentDB={{ content: post.content }} />
         </article>

         <Comment post_id={post_id} comment_list={comment_list} />
      </section>
   )
}