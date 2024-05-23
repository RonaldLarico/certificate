import * as fs from "fs"; // Importa el módulo fs para manejar archivos
import * as path from "path"; // Importa el módulo path para manejar rutas de archivos
import { NextResponse } from "next/server";

interface RequestBody {
  emailService: string;
  file: string;
  fileName: string;
  rutaArchivoExcel: string;
}

export async function POST(req: { json: () => Promise<RequestBody> }) {
  try {
    const { emailService, file, fileName } = await req.json();

    // Obtiene la ruta de archivo Excel del localStorage
    const routeExcel = localStorage.getItem('excelFilePath');

    if (!routeExcel) {
      throw new Error("No se encontró la ruta del archivo Excel en el localStorage.");
    }

    // Send with gmail & Nodemailer
    if (emailService === "gmail") {

      // Decodifica el archivo base64
      const decodedFile = Buffer.from(file, "base64");

      // Define la ruta de la carpeta donde se guardarán los PDFs
      const folderPath = routeExcel; // Ruta de la carpeta principal
      const newFolderName = 'Modulos'; // Nombre de la nueva carpeta

      // Crea la carpeta principal si no existe
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Ruta completa de la nueva carpeta
      const newFolderPath = path.join(folderPath, newFolderName);

      // Crea la nueva carpeta si no existe
      if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
      }

      // Genera la ruta de archivo utilizando la carpeta y el nombre proporcionado
      const filePath = path.join(newFolderPath, fileName);

      // Guarda el archivo decodificado localmente con el nombre proporcionado
      fs.writeFileSync(filePath, decodedFile);

      return NextResponse.json(
        { message: "Archivo guardado con éxito", fileName: filePath }, // Devuelve la ruta del archivo generado
        { status: 200 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { message: "Falló el guardado de archivos" },
      { status: 500 }
    );
  }
}
