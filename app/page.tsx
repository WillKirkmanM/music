import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import ClientAuth from "./clientauth";

export default async function Home() {
  const session = await getServerSession()
  console.log(session)
  return (
    <>
      <ClientAuth />
      <p>Welcome {session?.user?.name} !!! </p>
    </>
  );
}
