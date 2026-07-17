import connectDB from "@/lib/mongoDB/database/database";
import { TagDB } from "@/types/interfaces";

export default async function getCollectionItems(dbName:string) {

   const client = await connectDB;
   const db = client.db('community');
   const tags = await db.collection<TagDB>(dbName).find().toArray();
   
   const serializedTags  = tags.map(item => ({
      ...item,
      _id: item._id.toString(),
   }));

   return serializedTags
}