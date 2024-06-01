import Link from 'next/link'
import React from 'react'

const RoutesModules = () => {
  return (
    <main>
      <div className='flex justify-center items-center mt-10 gap-6 p-12 bg-blue-600'>
        <h1 className='text-6xl font-extrabold text-white'>Seleccione la empresa correspondiente</h1>
        <div className='text-gray-500 items-center'>
        </div>
      </div>
      <div className='flex justify-center items-center mt-40 mb-40'>
      <div className="grid grid-cols-2 gap-96">

        <div className='uppercase font-extrabold text-5xl text-gray-100'>
          <Link href="/moduleExcel/ecomasExcel" className="text-center">
            <div className="bg-blue-500 py-8 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
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
            <div className="bg-blue-500 py-8 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
              Promás
            </div>
          </Link>
          <Link href="/" className="">
            <div className="bg-blue-500 py-8 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
              Sayan
            </div>
          </Link>
          <Link href="/" className="">
            <div className="bg-blue-500 py-8 px-20 rounded-xl text-center hover:scale-125 duration-300">
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
