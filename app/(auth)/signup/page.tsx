
import SignUp from "./client"
import getCollectionItems from "@/lib/mongoDB/getCollectionItems";

export default async function signUp() {

   const tags = await getCollectionItems('tags');

   return (
      <SignUp initialTags={tags} />
   )
}