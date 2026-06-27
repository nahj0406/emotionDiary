import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {

   const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
   });
   
   // if(!token) {
   //    return NextResponse.redirect(new URL('/?auth=required', req.url))
   // }

   if(!token) {
      const loginUrl = new URL('/?auth=required', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      // 로그인하기 전 직전 url로 저장해서 로그인 이후 리다이렉트용

      return NextResponse.redirect(loginUrl);
   }

   return NextResponse.next();
}

export const config = {
   matcher: [
      // '/list/:path*', 
      '/write/:path*',
      '/mypage/:path*',
   ],
}