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
      <div>
        <div>
          <div>
            <Link href="/routes" onClick={() => handleGroupClick("Ecomas")}>
              Ecomas
            </Link>
            <Link href="/routes" onClick={() => handleGroupClick("Binex")}>
              Binex
            </Link>
            <Link href="/routes" onClick={() => handleGroupClick("Cimade")}>
              Cimade
            </Link>
          </div>
        </div>
        <div>
          <div>
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
      </div>
    </main>
  );
}
