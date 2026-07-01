
import SignUp from "./client"
import getTags from "@/lib/mongoDB/getTags";

export default async function signUp() {

   const tags = await getTags();

   return (
      <SignUp initialTags={tags} />
   )
}