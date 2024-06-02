"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@music/ui/components/input";
import { Search } from "lucide-react";

type SearchBarProps = {
  isSearchActive: boolean,
  setIsSearchActive: Function
}

export default function SearchBar({ isSearchActive, setIsSearchActive }: SearchBarProps) {
  const [query, setQuery] = useState("");
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
          className="flex-1 text-black"
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
