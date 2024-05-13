import HomeSelection from "@/components/Music/HomeSelection";

export default async function Home() {
  return (
    <div className="flex justify-center items-center h-screen flex-col pt-5">
      <HomeSelection />
      <HomeSelection />
    </div>
  );
}
