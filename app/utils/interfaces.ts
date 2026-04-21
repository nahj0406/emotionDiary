import { ObjectId } from "mongodb";

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