import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from "@/utils/database";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

   try {
      const db = (await connectDB).db('community');
      const {id} = req.query;

      if (typeof id !== 'string') {
         return res.status(400).json({
            message: 'INVALID_ID'
         });
      }

      const result = await db.collection('email_verification').findOne({
         _id: new ObjectId(id)
      });

      if(!result) {
         throw new Error('NOT_FOUND');
      }

      return res.status(200).json(result);
      
   } catch (err) {
      if (err instanceof Error) {
         return res.status(400).json({
            message: err.message
         });
      }

      return res.status(500).json({
         message: 'SERVER_ERROR'
      });
   }


   
}