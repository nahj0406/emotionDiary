
import SignUpClient from "./client"
import getTags from "@/lib/mongoDB/getTags";

export default async function SignUp() {

   const tags = await getTags();

   return (
      <SignUpClient initialTags={tags} />
   )
}