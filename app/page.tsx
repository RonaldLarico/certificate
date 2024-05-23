"use client";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {

  return (
    <main className={styles.main}>
        <div className="flex justify-center mt-60 gap-40 font-extrabold text-xl text-blue-500">
          <Link href="/" className="border-2 border-blue-500 py-4 px-10 rounded-xl hover:scale-125 duration-300">
            Diplomados
          </Link>
          <Link href="/" className="border-2 border-blue-500 py-4 px-10 rounded-xl hover:scale-125 duration-300">
            Cursos
          </Link>
          <Link href="/routesModules" className="border-2 border-blue-500 py-4 px-10 rounded-xl hover:scale-125 duration-300">
            Módulos
          </Link>
        </div>
    </main>
  );
}
