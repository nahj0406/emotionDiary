import connectDB from "@/lib/mongoDB/database"
import { ListContainer } from "./client";
import { PostDB } from "@/types/interfaces";

export default async function List() {

   const client = await connectDB;
   const db = client.db('community');
   const result = await db.collection<PostDB>('post').find().toArray();

   const posts = result.map(item => ({
      _id: item._id.toString(),
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl,
      recommend: item.recommend,
      createdAt: item.createdAt,
      userId: item.user?.id,
   }))

   return (
      <div className="containerV1">
         <ListContainer result={posts} />
      </div>
   )
}