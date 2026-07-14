import { UserDB } from '@/types/interfaces';
import {create} from 'zustand';
import { getUserById } from "@/lib/mongoDB/getUserById";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

interface Session {
   id: string;
   nickName: string | null;
   name: string | null;
   email: string;
}

interface AuthState {
   session: Session | null
   user: UserDB | null;
}


// export const useAuthStore = create<AuthState>(()=> ({
//    session: await getServerSession(authOptions),
//    user: await getUserById(session?.user.id),
// }));