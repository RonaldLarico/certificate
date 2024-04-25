import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className=''>
      <div className="flex justify-center mt-80">
        <Link href="/modulos" className="border p-4 rounded-xl">Módulos
        </Link>
      </div>
    </main>
  );
}
