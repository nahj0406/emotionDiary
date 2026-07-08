import styles from './page.module.css'
import connectDB from "@/lib/mongoDB/database/database"
import { PostDB, CommentDB, UserDB, CommentDTO } from "@/types/interfaces";
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
import UserThumbnail from '@/components/ui/img/user_thumbnail/userThumbnail';


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

   const comment_result = await db.collection<CommentDB>('comments').find({postId: post?._id.toString()}).toArray();
   const comment_list: CommentDTO[] = await Promise.all(
      comment_result.map(async (comment) => {

         const userInfo = await db.collection('user').findOne({
            _id: new ObjectId(comment.user.id)
         })

         return {
            ...comment,
            _id: comment._id.toString(),
            user: {
               id: comment.user.id.toString(),
               nickName: comment.user.nickName,
               thumbnail: userInfo?.thumbnail ?? '',
            },
            postId: comment.postId.toString(),
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt?.toISOString() ?? '',
         }
      }
   ));

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
      <section className={styles.view_container}>
         <div className={styles.book_profile}>
            {
               post?.thumbnail &&
               <figure className={styles.book_thumbnail}>
                  <img src={post.thumbnail} alt="ddd" />
               </figure>
            }
   
            <ul className={styles.content}>
               <li className={styles.title}>{book?.bookTitle}</li>
               <li><label>저자:</label> {book?.bookAuthor}</li>
               <li><label>출판사:</label> {book?.bookPublisher}</li>
               <li><label>구매처:</label> <Link href={book?.bookLink} target='_blank'>{book?.bookLink}</Link></li>
               <li className={styles.evaluation}>
                  <label>게시자 평가</label>
                  <ul className={styles.content}>
                     <li>
                        <label>장르</label> 
                        <b>{findNameById(category, post.category.primary)}/{findNameById(category, post.category.secondary)}</b>
                     </li>

                     <li>
                        <label>작품 성향</label> 
                        <div className={styles.tag_list}>
                           {post.tags.map((item) => {
                              return (
                                 <span key={item}>{findNameById(tags, item)}</span>
                              )
                           })}
                        </div>
                     </li>
                  </ul>
               </li>
            </ul>
         </div>

         {
            session?.user.id === post.user.id.toString() &&
               <>
                  <Link href={`/write/${post_id}`}>수정</Link>
                  <DeleteBtn postId={post_id} />
               </>
         }

         <div className={styles.board}>
            <div className={styles.titleBox}>
               <h2 className={styles.title}>{post?.title}</h2>

               <div className={styles.info}>
                  <div className={styles.user}>
                     <UserThumbnail thumbnail={userInfo?.thumbnail} />
                     <p>{post?.user.nickName}</p>
                  </div>

                  <div className={styles.at_box}>
                     <p>작성일: {createdAt}</p>
                     {
                        post.updatedAt && 
                        <p>수정일: {updatedAt}</p>
                     }
                  </div>
               </div>
            </div>

            <article className={styles.content_box}>
               <ContentBox contentDB={{ content: post.content }} />

               <Recommend session={session} postItem={{...post, _id: post._id.toString(),}}></Recommend>
            </article>
         </div>

         <Comment post_id={post_id} comment_list={comment_list} session={session} />
      </section>
   )
}