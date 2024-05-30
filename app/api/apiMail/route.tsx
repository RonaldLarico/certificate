import { NextResponse } from "next/server";
import nodemailer, { Transporter } from "nodemailer";
import { ReactElement } from "react";
import { render } from "@react-email/render";
import EcomasTemplate from "@/components/modulos/templates/TemplateEcomas";

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

interface RequestBody {
  groupName: string;
  pdfBase64: string;
  email: string;
  actividadAcademica: string;
}

export async function POST(req: { json: () => Promise<RequestBody> }): Promise<NextResponse> {
  try {
    const { groupName, pdfBase64, email, actividadAcademica } = await req.json();

    // Send with gmail & Nodemailer
    const transporter: Transporter = nodemailer.createTransport({
      service: "gmail",
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER_ECOMAS,
        pass: process.env.PASSWORD_USER_ECOMAS,
      },
    });

    // Define a function to get the correct email component based on the type
    const getEmailComponent = (type: string): ReactElement => {
      // Your implementation here
      return <div><EcomasTemplate groupName={groupName} actividadAcademica={actividadAcademica}/></div>;
    };

    // Render the email HTML based on the type
    const emailHtml: string = render(getEmailComponent("yourEmailType"));

    const mailOption: MailOptions = {
      from: process.env.EMAIL_USER_ECOMAS ?? 'default@example.com',
      to: email,
      subject: "CERTIFICADO DEL CURSO",
      html: emailHtml,
    };

    // Attach PDF file
    const attachment = {
      filename: `${groupName}.pdf`,
      content: Buffer.from(pdfBase64, "base64"),
    };
    mailOption.attachments = [attachment];

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
