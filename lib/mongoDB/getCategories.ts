import connectDB from "@/lib/mongoDB/database/database";
import { CategoryDB } from "@/types/interfaces";

export default async function getCategories() {

   const client = await connectDB;
   const db = client.db('community');
   const categories = await db.collection<CategoryDB>('categories').find().toArray();
   
   const serializedCat  = categories.map(cat => ({
      ...cat,
      _id: cat._id.toString(),
   }));

   return serializedCat
}