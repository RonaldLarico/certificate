import * as fs from "fs";
import * as path from "path";
import { NextResponse } from "next/server";

interface RequestBody {
  groupName: string;
  index: number;
  pdfBase64: string;
  routeExcel: string;
}

export async function POST(req: { json: () => Promise<RequestBody> }) {
  try {
    const { groupName, index, pdfBase64, routeExcel } = await req.json();

    if (!routeExcel) {
      throw new Error('La ruta del archivo Excel no está definida.');
    }

    // Decodificar el archivo PDF base64
    const decodedFile = Buffer.from(pdfBase64.split(";base64,").pop()!, "base64");

    // Definir la ruta donde se guardará el archivo PDF
    const folderPath = routeExcel; // Utiliza la ruta del archivo Excel proporcionada por el cliente

    // Crear directorios si no existen
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const newFolderName = `Modulos/${groupName}`;
    const newFolderPath = path.join(folderPath, newFolderName);

    if (!fs.existsSync(newFolderPath)) {
      fs.mkdirSync(newFolderPath, { recursive: true });
    }

    // Definir la ruta completa del archivo PDF
    const fileName = `${groupName}_${index + 1}.pdf`;
    const filePath = path.join(newFolderPath, fileName);

    // Guardar el archivo PDF en el sistema de archivos
    fs.writeFileSync(filePath, decodedFile);

    // Devolver una respuesta exitosa con el nombre del archivo guardado
    return NextResponse.json(
      { message: "Archivo guardado con éxito", fileName: filePath },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en el procesamiento del archivo PDF:', error);
    // Devolver un error en caso de fallo en el proceso
    return NextResponse.json(
      { message: "Falló el guardado de archivos" },
      { status: 500 }
    );
  }
}
