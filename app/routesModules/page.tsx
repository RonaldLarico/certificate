import Link from 'next/link'
import React from 'react'

const RoutesModules = () => {
  return (
    <main className='flex justify-center items-center h-screen'>
      <div className="grid grid-cols-2 gap-96">

        <div className='uppercase font-extrabold text-2xl text-gray-600'>
          <Link href="/modulos" className="text-center">
            <div className="border py-4 px-20 rounded-xl max-w-xs mx-auto text-center mb-20">
                Ecomás
            </div>
          </Link>
        <div className="border py-4 px-20 rounded-xl text-center mb-20">
          <Link href="/" className="text-center">
            Cimade
          </Link>
        </div>
        <div className="border py-4 px-20 rounded-xl text-center">
          <Link href="/" className="text-center">
            Binex
          </Link>
        </div>
        </div>

        <div className='uppercase font-extrabold text-2xl text-gray-600'>
        <div className="border py-4 px-20 rounded-xl text-center mb-20">
          <Link href="/" className="">
            Promás
          </Link>
        </div>
        <div className="border py-4 px-20 rounded-xl text-center mb-20">
          <Link href="/" className="">
            Sayan
          </Link>
        </div>
        <div className="border py-4 px-20 rounded-xl text-center">
          <Link href="/" className="">
            Rizo
          </Link>
        </div>
        </div>
      </div>
    </main>
  )
}

export default RoutesModules
