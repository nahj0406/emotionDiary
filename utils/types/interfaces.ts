import { ObjectId } from "mongodb";

export interface UserDB {
  _id: ObjectId
  name: string
  nickname: string
  thumbnail: string
  email: string
  password: string
  emailVerified: boolean
  createAt: Date
}

export interface PostDB {
  _id: ObjectId
  title: string
  content: string
}

export interface postType {
   _id: string;
   title: string;
   content: string;
}

export interface SignupRequest {
  name: string;
  nickname: string;
  email: string;
  password: string;
};