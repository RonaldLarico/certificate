import Image from 'next/image';
import Link from 'next/link'
import React from 'react'
import './Style.css'

const RoutesModules = () => {
  return (
    <main className="bg-[#001D51] min-h-screen pb-1">
      <div className='flex justify-center gap-10 pt-10 mb-10'>
        <Image src="/ecomas.png" alt='ecomas' width={150} height={100}className='pt-5'/>
        <Image src="/cimade.png" alt='ecomas' width={150} height={100}className='pt-5'/>
        <Image src="/binex.png" alt='ecomas' width={150} height={100}className='pt-5'/>
        <Image src="/promas.png" alt='ecomas' width={150} height={100}className='pt-5'/>
        <Image src="/sayan.png" alt='ecomas' width={150} height={100}className='pt-5'/>
        <Image src="/rizo.png" alt='ecomas' width={150} height={100}className='pt-5'/>
      </div>
      <div className='flex justify-center items-center mt-5 gap-6 p-12 bg-[#0060ff]/50'>
        <h1 className='text-5xl font-extrabold text-white'>Seleccione la empresa correspondiente</h1>
      </div>
      <div className='flex justify-center items-center mt-28 mb-20'>
      <div className="grid grid-cols-2 gap-96">

        <div className='uppercase font-extrabold text-3xl text-gray-100'>
          <Link href="/moduleExcel/ecomasExcel" className="text-center">
            <div className="bg-[#0060ff]   py-5 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
              Ecomás
            </div>
          </Link>
          <Link href="/moduleExcel/cimadeExcel" className="text-center">
            <div className="bg-[#0060ff] py-5 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
              Cimade
            </div>
          </Link>
          <Link href="/moduleExcel/binexExcel" className="text-center">
            <div className="bg-[#0060ff] py-5 px-20 rounded-xl text-center hover:scale-125 duration-300">
                Binex
            </div>
          </Link>
        </div>

        <div className='uppercase font-extrabold text-3xl text-gray-100'>
          <Link href="/moduleExcel/promasExcel" className="">
            <div className="bg-[#0060ff] py-5 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
              Promás
            </div>
          </Link>
          <Link href="/moduleExcel/sayanExcel" className="">
            <div className="bg-[#0060ff] py-5 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
              Sayan
            </div>
          </Link>
          <Link href="/moduleExcel/rizoExcel" className="">
            <div className="bg-[#0060ff] py-5 px-20 rounded-xl text-center hover:scale-125 duration-300">
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
