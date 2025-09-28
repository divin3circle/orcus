"use client";

import * as animationData from "@/public/animation1.json";
import { useLottie } from "lottie-react";

const MyLottieComponent = () => {
  const defaultOptions = {
    animationData: animationData,
    loop: true,
  };

  const { View } = useLottie(defaultOptions);

  return (
    <>
      <div className="">
        <div className="w-full">{View}</div>
      </div>
    </>
  );
};

export default MyLottieComponent;
