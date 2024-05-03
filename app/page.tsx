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
        <div className="grid grid-cols-2 mt-80">
          <div className="flex justify-center ">
            <div>
            <Link href="/routes" onClick={() => handleGroupClick("Ecomas")}>
              Ecomas
            </Link>
            </div>
            <div>
            <Link href="/routes" onClick={() => handleGroupClick("Binex")}>
              Binex
            </Link>
            </div>
            <Link href="/routes" onClick={() => handleGroupClick("Cimade")}>
              Cimade
            </Link>
          </div>

          <div className="flex justify-center">
            <Link href="/" onClick={() => handleGroupClick("Promas")}>
              Promas
            </Link>
            <Link href="/" onClick={() => handleGroupClick("Sayan")}>
              Sayan
            </Link>
            <Link href="/" onClick={() => handleGroupClick("Rizo")}>
              Rizo
            </Link>
          </div>
        </div>
    </main>
  );
}
