"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState(""); // Estado para almacenar el grupo seleccionado

  // Función para manejar el clic en los enlaces de los grupos
  const handleGroupClick = (groupName: string) => {
    setSelectedGroup(groupName); // Actualiza el estado con el nombre del grupo seleccionado
  };

  return (
    <main>
        <div className="flex justify-center mt-60 gap-40">
          <Link href="/" className="border p-4 rounded-xl">
            Diplomados
          </Link>
          <Link href="/" className="border p-4 rounded-xl">
            Cursos
          </Link>
          <Link href="/routesModules" className="border p-4 rounded-xl">
            Módulos
          </Link>
        </div>
    </main>
  );
}
