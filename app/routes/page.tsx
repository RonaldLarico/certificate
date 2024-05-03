import Link from 'next/link'
import React from 'react'

const Routes = () => {
  return (
    <main className=''>
      <div className="flex justify-center mt-60 gap-40">
        <Link href="/" className="border p-4 rounded-xl">
          Diplomados
        </Link>
        <Link href="/" className="border p-4 rounded-xl">
          cursos
        </Link>
        <Link href="/modulos" className="border p-4 rounded-xl">
          Módulos
        </Link>
      </div>
      </main>
  )
}

export default Routes