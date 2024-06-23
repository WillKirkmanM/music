"use client"

import { useEffect } from "react";
import { useGradientHover } from "../Providers/GradientHoverProvider";
import { FastAverageColor } from "fast-average-color";
import imageToBase64 from "@/actions/ImageToBase64";

export default function PageGradient({ imageSrc }: { imageSrc: string }) {
  const { setGradient } = useGradientHover()

  useEffect(() => {
    const fac = new FastAverageColor();
    const getColor = async () => {
      let src = imageSrc;
      if (imageSrc.endsWith('snf.png')) {
        src = await imageToBase64(imageSrc);
      }
      const color = await fac.getColorAsync(src)
      setGradient(color.hex)
    }

    getColor()
  })

  return <></>
}