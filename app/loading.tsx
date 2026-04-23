// page.js 옆에 Loading.js 만들어 두면 리액트의 suspense랑 별 차이 없게 동작함.
// 자동으로 next.js가 로딩 컴포넌트 안에 내용들로 suspense를 만들어서 감싸준다고 함.
// 꼭 page.js 폴더 안에 안두고 app 루트에 바로 넣어버리면 모든 파일들이 이 loading을 공용으로 사용 가능.
export default function Loading () {
   return (
      <h4>로딩중</h4>
   )
}