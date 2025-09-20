'use client'
import React from 'react'
import bg from "@/public/bg.jpeg"
import Image from 'next/image'
 

function Hero() {
  return (
    <div 
      className='w-full h-[calc(100vh-300px)] rounded-3xl px-2 mt-4 relative bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${bg.src})` }}
    >
        <div className='absolute inset-0 bg-black/50 rounded-3xl'></div>
        <div className='relative z-10 w-full h-full px-4 flex items-center justify-center'>
            <h1 className='text-white text-4xl font-bold'>Hero</h1>
        </div>
    </div>
  )
}

export default Hero




