"use client";

import { useState, FormEvent, useContext } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@music/ui/components/input";
import { Search } from "lucide-react";
import { ScrollContext } from "../Providers/ScrollProvider";

type SearchBarProps = {
  isSearchActive: boolean,
  setIsSearchActive: Function
}

export default function SearchBar({ isSearchActive, setIsSearchActive }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const { onTopOfPage } = useContext(ScrollContext)
  const router = useRouter();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    router.push(`/search?q=${query}`);
    setIsSearchActive(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={`${isSearchActive ? "w-full flex" : "hidden"} md:flex md:w-96`}
      >
      <Input
        className={`flex-1 text-white border border-[#6e777d] ${onTopOfPage ? "opacity-35 bg-gradient-to-r from-[#2f353a80] to-[#34373580]" : "bg-white"}`}
        placeholder="In Da Club..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      </form>
      <Search
        className="md:hidden cursor-pointer"
        onClick={() => setIsSearchActive(!isSearchActive)}
      />
    </>
  );
}
