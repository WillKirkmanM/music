import Image from "next/image"
import { Slider } from "../ui/slider"

export default function Player() {
  return (
<footer className="fixed bottom-0 bg-gray-600 border-t border-gray-700 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
  <section className="flex items-center gap-3">
    <div className="w-20 h-20 bg-gray-500 rounded-md">
      <Image alt="Return of the Mack Cover" src="https://m.media-amazon.com/images/I/71U4T6RxDBS._UF1000,1000_QL80_.jpg" width={334} height={332}/>
    </div>
      <div>
        <p className="whitespace-nowrap">Return of the Mack</p>
        <p className="text-xs text-gray-400">Mark Morrison</p>
      </div>
    <button className="text-gray-400 hover:text-white transition-colors duration-300">
      ♥
    </button>
  </section>
  <section className="flex flex-col items-center gap-2 w-full">
    <div className="flex items-center gap-4">
      <button>Shuffle</button>
      <button>Previous</button>
      <button>Play/Pause</button>
      <button>Next</button>
      <button>Loop</button>
    </div>
    <div className="flex items-center gap-2 w-full justify-center">
      <span className="text-xs text-gray-400">0:31</span>
      <progress className="h-1 w-1/2" max={100} value={20}></progress>
      <span className="text-xs text-gray-400">2:14</span>
    </div>
  </section>
  <section className="flex items-center gap-2">
    <button>List</button>
    <button>Devices</button>
    <div className="flex items-center gap-1">
      <button>Volume</button>
      <progress className="h-1 w-16" max={100} value={20}></progress>
    </div>
    <button>Fullscreen</button>
  </section>
</footer>


  )
}