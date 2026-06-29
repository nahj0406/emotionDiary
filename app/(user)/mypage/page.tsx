import { getServerSession } from 'next-auth'
// import styles from './page.module.css'
import connectDB from '@/lib/mongoDB/database/database';
import { PostCardDTO, UserDB } from '@/types/interfaces';
import { ObjectId } from 'mongodb';
import { Infomation } from './client';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getPosts } from '@/utils/posts';
import { mergePosts } from '@/lib/mongoDB/mergePosts';

export default async function Mypage() {

   const session = await getServerSession(authOptions);
   const posts = await getPosts();
   const merged = await mergePosts(posts);

   let userInfo: UserDB | null  = null;
   let recommendPosts: PostCardDTO[] = [];
   let bookmarkPosts: PostCardDTO[] = [];
   let myPosts: PostCardDTO[] = [];
   let recentlyPost: PostCardDTO[] = [];

   if(session?.user.id) {
      const client = await connectDB;
      const db = client.db('community');
      userInfo = await db.collection<UserDB>('user').findOne({_id: new ObjectId(session?.user?.id)});

      if(userInfo) {
         const recommendIds = userInfo.post.recommend;
         const recentlyIds = userInfo.post.recently;

         const bookmarkdDocks = await db.collection('post_bookmark').find({userId: session?.user?.id}).toArray();
         const bookmarkIds = new Set(bookmarkdDocks.map(bookmark => bookmark.postId));

         recommendPosts = merged.filter((post => 
            recommendIds.includes(post._id.toString())
         ))

         bookmarkPosts = merged.filter((post => 
            bookmarkIds.has(post._id.toString())
         ))

         myPosts = merged.filter((post => 
            post.user?.id === session?.user.id
         ))

         recentlyPost = merged.filter((item => 
            recentlyIds.includes(item._id)
         ))
      }
   }

   const safeUser = userInfo
      ? JSON.parse(JSON.stringify(userInfo))
      : null;

   return (
      <section className="containerV1">
         <h2>마이페이지</h2>

         <Infomation 
            user={safeUser} 
            recommendPosts={recommendPosts}
            bookmarkPosts={bookmarkPosts}
            myPosts={myPosts}
            recentlyPost={recentlyPost}
         />
      </section>
   )
}