"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "../ui/input"

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/search?q=${query}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        className="w-96" 
        placeholder="In Da Club..." 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  )
}