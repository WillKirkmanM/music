"use client"

import FromYourLibrary from "@/components/Home/FromYourLibrary";
import LandingCarousel from "@/components/Home/LandingCarousel";
import ListenAgain from "@/components/Home/ListenAgain";
import RandomSongs from "@/components/Home/RandomSongs";
import RecommendedAlbums from "@/components/Home/RecommendedAlbums";

export default function Home() {
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
