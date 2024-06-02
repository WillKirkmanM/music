import HomeSelection from "@/components/Music/HomeSelection";

export default async function Home() {
  return (
    <div className="flex justify-center items-center h-screen flex-col px-20 pt-28 pb-20">
      <HomeSelection />
      <HomeSelection />
    </div>
  );
}
