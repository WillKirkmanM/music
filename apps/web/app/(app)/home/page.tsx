"use client"

import FromYourLibrary from "@/components/Home/FromYourLibrary";
import LandingCarousel, { LandingCarouselSkeleton } from "@/components/Home/LandingCarousel";
import ListenAgain from "@/components/Home/ListenAgain";
import RandomSongs from "@/components/Home/RandomSongs";
import RecommendedAlbums from "@/components/Home/RecommendedAlbums";
import getSession from "@/lib/Authentication/JWT/getSession";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const user = getSession();
    if (!user) {
      redirect("/login")
    }
  }, []);

  return (
      <div className="min-h-screen pt-28 pb-20">
        <div className="pb-5">
          <LandingCarousel />
        </div>
        
        <ListenAgain />
        <RecommendedAlbums />
        <RandomSongs />
        <FromYourLibrary />
      </div>
  );
}
