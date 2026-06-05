import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import connectDB from "./database/database";
import { UserDB } from "@/types/interfaces";
import { ObjectId } from "mongodb";

// 불러오려는 유저 id를 넣어서 해당 id를 가진 유저정보를 return

export async function getUserById(userId: string) {
   const client = await connectDB;
   const db = client.db('community');

   const userInfo = await db.collection<UserDB>('user').findOne({
      _id: new ObjectId(userId)
   });

   return userInfo
}