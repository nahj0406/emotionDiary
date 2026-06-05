import connectDB from "@/lib/mongoDB/database/database"
import { ListContainer } from "./client";
import { PostDB } from "@/types/interfaces";

export default async function List() {

   const client = await connectDB;
   const db = client.db('community');
   const result = await db.collection<PostDB>('post').find().toArray();

   const posts = result.map(item => ({
      _id: item._id,
      title: item.title,
      content: item.content,
      thumbnail: item.thumbnail,
      recommend: item.recommend,
      createdAt: item.createdAt,
      userId: item.user?.id,
      category: {
         primary: item.category.primary,
         secondary: item.category.secondary,
      },
      tags: item.tags,
   }))

   return (
      <div className="containerV1">
         <ListContainer result={posts} />
      </div>
   )
}