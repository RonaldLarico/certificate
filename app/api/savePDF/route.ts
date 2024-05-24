import * as fs from "fs";
import * as path from "path";
import { NextResponse } from "next/server";

interface RequestBody {
  emailService: string;
  file: string;
  fileName: string;
  rutaArchivoExcel: string; // Nueva propiedad para recibir la ruta del archivo Excel
}

export async function POST(req: { json: () => Promise<RequestBody> }) {
  try {
    const { emailService, file, fileName, rutaArchivoExcel } = await req.json();

    // Send with gmail & Nodemailer
    if (emailService === "gmail") {
      const decodedFile = Buffer.from(file, "base64");
      const folderPath = rutaArchivoExcel; // Utiliza la ruta del archivo Excel proporcionada por el cliente

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const newFolderName = 'Modulos';
      const newFolderPath = path.join(folderPath, newFolderName);

      if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
      }

      const filePath = path.join(newFolderPath, fileName);
      fs.writeFileSync(filePath, decodedFile);

      return NextResponse.json(
        { message: "Archivo guardado con éxito", fileName: filePath },
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
