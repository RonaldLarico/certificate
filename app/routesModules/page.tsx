import Link from 'next/link'
import React from 'react'

const RoutesModules = () => {
  return (
    <main className='flex justify-center items-center h-screen'>
      <div className="grid grid-cols-2 gap-96">

        <div className='uppercase font-extrabold text-2xl text-gray-100'>
          <Link href="/modulos" className="text-center">
            <div className="bg-blue-500 py-4 px-20 rounded-xl max-w-xs mx-auto text-center mb-20 hover:scale-125 duration-300">
                Ecomás
            </div>
          </Link>
          <Link href="/" className="text-center">
        <div className="bg-blue-500 py-4 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
            Cimade
        </div>
          </Link>
          <Link href="/" className="text-center">
        <div className="bg-blue-500 py-4 px-20 rounded-xl text-center hover:scale-125 duration-300">
            Binex
        </div>
          </Link>
        </div>

        <div className='uppercase font-extrabold text-2xl text-gray-100'>
          <Link href="/" className="">
        <div className="bg-blue-500 py-4 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
            Promás
        </div>
          </Link>
          <Link href="/" className="">
        <div className="bg-blue-500 py-4 px-20 rounded-xl text-center mb-20 hover:scale-125 duration-300">
            Sayan
        </div>
          </Link>
          <Link href="/" className="">
        <div className="bg-blue-500 py-4 px-20 rounded-xl text-center hover:scale-125 duration-300">
            Rizo
        </div>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default RoutesModules
