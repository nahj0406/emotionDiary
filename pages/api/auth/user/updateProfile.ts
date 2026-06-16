import connectDB from "@/lib/mongoDB/database/database";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]";
import bcrypt from "bcrypt";
import cloudinary from "@/lib/external_storage/cloudinary";
import formidable from "formidable";

export const config = {
   api: {
      bodyParser: false,
   },
};

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   if (req.method !== "PUT") {
      return res.status(405).json({
         message: "요청 메서드가 올바르지 않습니다.",
      });
   }

   const session = await getServerSession(
      req,
      res,
      authOptions
   );

   if (!session?.user?.id) {
      return res.status(401).json({
         message: "로그인이 필요합니다.",
      });
   }

   const form = formidable({
      multiples: false,
   });

   const [fields, files] = await form.parse(req);
   const nickName = fields.nickName?.[0] ?? '';
   const crtPw = fields.crtPw?.[0] ?? '';
   const password = fields.password?.[0] ?? '';
   const hasCrtPw = crtPw.trim() !== '';
   const hasNewPw = password.trim() !== '';

   const tags = fields.tags ?? [];
   const thumbnail = files.thumbnail?.[0];
   const removeThumbnail = fields.removeThumbnail?.[0] === 'true';

   const client = await connectDB;
   const db = client.db("community");

   const userInfo = await db.collection("user").findOne({
      _id: new ObjectId(session.user.id),
   });

   if (!userInfo) {
      return res.status(404).json({
         message: "사용자를 찾을 수 없습니다.",
      });
   }

   if(hasCrtPw && hasNewPw) {

      const isValid = await bcrypt.compare(
         crtPw as string,
         userInfo.password
      );

      if (!isValid) {
         return res.status(401).json({
            message: "현재 비밀번호가 일치하지 않습니다.",
         });
      }
   }

   if (crtPw && password) {
      const isSame = await bcrypt.compare(
         password,
         userInfo.password
      );

      if (isSame) {
         return res.status(400).json({
            message: '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
         });
      }
   }

   if (hasCrtPw !== hasNewPw) {
      return res.status(400).json({
         message: '비밀번호 변경 시 현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.',
      });
   }

   const now = new Date();

   if (userInfo.nickNameUpdatedAt && nickName !== userInfo.nickName) {
      const diff =
         now.getTime() -
         userInfo.nickNameUpdatedAt.getTime();

      const days = diff / (1000 * 60 * 60 * 24);

      if (days < 30) {
         return res.status(400).json({
            message: '닉네임은 30일에 한 번만 변경할 수 있습니다.',
         });
      }
   }

   try {
      const updateData: Record<string, unknown> = {};

      if(nickName) {
         updateData.nickName = nickName;
      }

      if(tags.length > 0) {
         updateData.tags = tags;
      }

      if (hasNewPw) {
         updateData.password = await bcrypt.hash(password, 10);
      }

      if(removeThumbnail) {
         if(userInfo.publicId) {
            await cloudinary.uploader.destroy(userInfo.publicId);
         }

         updateData.thumbnail = '';
         updateData.publicId = '';
      }

      if (thumbnail) {

         if (userInfo.publicId) {
           await cloudinary.uploader.destroy(userInfo.publicId);
         }

         const uploaded =
            await cloudinary.uploader.upload(
               thumbnail.filepath,
               {
                  folder: "user_thumbnail",
               }
            );

         updateData.thumbnail = uploaded.secure_url;
         updateData.publicId = uploaded.public_id;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          message: '변경할 정보가 없습니다.',
        });
      }

      await db.collection("user").updateOne(
         {
            _id: new ObjectId(session.user.id),
         },
         {
            $set: {
               ...updateData,
               nickNameUpdatedAt: new Date(),
            }
         }
      );

      return res.status(200).json({
         ok: true,
         message: "회원 정보 수정이 완료되었습니다.",
      });

   } catch (err) {
      console.error(err);

      return res.status(500).json({
         message: "회원정보 수정에 실패했습니다.",
      });
   }
}