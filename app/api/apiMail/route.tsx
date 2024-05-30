import { NextResponse } from "next/server";
import nodemailer, { Transporter } from "nodemailer";
import { ReactElement } from "react";
import { render } from "@react-email/render";
import EcomasTemplate from "@/components/modulos/templates/TemplateEcomas";
import CimadeTemplate from "@/components/modulos/templates/TemplateCimade";
import PromasTemplate from "@/components/modulos/templates/TemplatePromas";
import SayanTemplate from "@/components/modulos/templates/TemplateSayan";
import BinexTemplate from "@/components/modulos/templates/TemplateBinex";
import RizoTemplate from "@/components/modulos/templates/TemplateRizo";

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
  user: string;
  pass: string;
}

interface RequestBody {
  groupName: string;
  pdfBase64Array: string[];
  email: string;
  dataString: string[];
  templateName: string;
  user: string;
  pass: string;
}

export async function POST(req: { json: () => Promise<RequestBody> }): Promise<NextResponse> {
  try {
    const { groupName, pdfBase64Array, email, dataString, templateName, user, pass } = await req.json();
    console.log('Data received:', { groupName, pdfBase64Array, email, dataString });

    const transporter: Transporter = nodemailer.createTransport({
      service: "gmail",
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
    // Define a function to get the correct email component based on the type
    let emailComponent: ReactElement;

    // Selecciona el template correspondiente según el grupo
    switch (templateName) {
      case 'Ecomas':
        emailComponent = <EcomasTemplate groupName={groupName} dataString={dataString} />;
        break;
      case 'Cimade':
        emailComponent = <CimadeTemplate groupName={groupName} dataString={dataString} />;
        break;
      case 'Promas':
        emailComponent = <PromasTemplate groupName={groupName} dataString={dataString} />;
        break;
      /* case 'Sayan':
        emailComponent = <SayanTemplate groupName={groupName} dataString={dataString} />;
        break;
      case 'Binex':
        emailComponent = <BinexTemplate groupName={groupName} dataString={dataString} />;
        break;
      case 'Rizo':
        emailComponent = <RizoTemplate groupName={groupName} dataString={dataString} />;
        break; */
      default:
        throw new Error('Invalid group name');
    }

    // Render the email HTML based on the type
    const emailHtml: string = render(emailComponent);

    const mailOption: MailOptions = {
      from: user,
      to: email,
      subject: "CERTIFICADOS MODULARES",
      html: emailHtml,
      user: user,
      pass: pass,
    };
    console.log('Mail options:', mailOption);

    // Attach PDF file
    const attachment = pdfBase64Array.map((pdfBase64, index) => ({
      filename: `${groupName}_${index}.pdf`,
      content: Buffer.from(pdfBase64, "base64"),
    }));
    mailOption.attachments = attachment;

    await transporter.sendMail(mailOption);

    return NextResponse.json(
      { message: "Email Sent Successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to Send Email"},
      { status: 500 }
    );
  }
}
