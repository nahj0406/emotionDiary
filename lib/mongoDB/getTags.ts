import connectDB from "@/lib/mongoDB/database/database";
import { TagDB } from "@/types/interfaces";

export default async function getTags() {

   const client = await connectDB;
   const db = client.db('community');
   const tags = await db.collection<TagDB>('tags').find().toArray();
   
   const serializedTags  = tags.map(tag => ({
      ...tag,
      _id: tag._id.toString(),
   }));

   return serializedTags
}