import Image from 'next/image';
import Link from 'next/link'
import React from 'react'
import './Style.css'

const RoutesModules = () => {
  return (
    <main className="bg-[#001D51] min-h-screen pb-1">
      <div className='flex justify-center gap-10'>
        <Image src="/ecomas.png" alt='ecomas' width={250} height={200}className='pt-5'/>
        <Image src="/ecomas.png" alt='ecomas' width={250} height={200}className='pt-5'/>
        <Image src="/ecomas.png" alt='ecomas' width={250} height={200}className='pt-5'/>
        <Image src="/ecomas.png" alt='ecomas' width={250} height={200}className='pt-5'/>
        <Image src="/ecomas.png" alt='ecomas' width={250} height={200}className='pt-5'/>
      </div>
      <div className='flex justify-center items-center mt-5 gap-6 p-12 bg-blue-600'>
        <h1 className='text-6xl font-extrabold text-white'>Seleccione la empresa correspondiente</h1>
        <div className='text-gray-500 items-center'>
        </div>
      </div>
      <div className='flex justify-center items-center mt-40 mb-40'>
      <div className="grid grid-cols-2 gap-96">

        <div className='uppercase font-extrabold text-5xl text-gray-100'>
          <Link href="/moduleExcel/ecomasExcel" className="text-center">
            <div className="bg-gradient-to-r from-[#0060ff] to-[#007aff]  py-8 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300 btn">
              Ecomás
            </div>
          </Link>
          <Link href="/" className="text-center">
            <div className="bg-blue-500 py-8 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
              Cimade
            </div>
          </Link>
          <Link href="/" className="text-center">
            <div className="bg-blue-500 py-8 px-20 rounded-xl text-center hover:scale-125 duration-300">
                Binex
            </div>
          </Link>
        </div>

        <div className='uppercase font-extrabold text-5xl text-gray-100'>
          <Link href="/" className="">
            <div className="bg-gradient-to-r from-[#680080] to-[#b20079] py-8 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
              Promás
            </div>
          </Link>
          <Link href="/" className="">
            <div className="bg-blue-500 py-8 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
              Sayan
            </div>
          </Link>
          <Link href="/" className="">
            <div className="bg-gradient-to-r from-[#1C004C] to-[#6D0083] py-8 px-20 rounded-xl text-center hover:scale-125 duration-300">
              Rizo
            </div>
          </Link>
        </div>
      </div>
      </div>
    </main>
  )
}

export default RoutesModules;
