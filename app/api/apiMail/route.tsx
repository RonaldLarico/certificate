import { NextResponse } from "next/server";
import nodemailer, { Transporter } from "nodemailer";
import { ReactElement } from "react";
import EcomasTemplate from "@/components/modulos/templates/TemplateEcomas";
import PromasTemplate from "@/components/modulos/templates/TemplatePromas";
import BinexTemplate from "@/components/modulos/templates/TemplateBinex";
import SayanTemplate from "@/components/modulos/templates/TemplateSayan";
import CimadeTemplate from "@/components/modulos/templates/TemplateCimade";
import RizoTemplate from "@/components/modulos/templates/TemplateRizo";
import { render } from "@react-email/render";

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

interface RequestBody {
  subject: string;
  message: string; // Asegúrate de que req.body contenga una propiedad 'message'
  email: string;
  emailService: string;
  file?: string; // Podría ser opcional dependiendo de tu aplicación
  name: string;
  nameFile: string;
  curso: string;
  companyUser: string;
  companyPass: string;
  emailType: string;
}

export async function POST(req: { json: () => Promise<RequestBody> }): Promise<NextResponse> {
  try {
    const {
      subject,
      message,
      email,
      emailService,
      file,
      name,
      nameFile,
      curso,
      companyUser,
      companyPass,
      emailType,
    } = await req.json();

    // Send with gmail & Nodemailer
    if (emailService === "gmail") {
      const transporter: Transporter = nodemailer.createTransport({
        service: "gmail",
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: true,
        auth: {
          user: companyUser,
          pass: companyPass,
        },
      });

      // Define a function to get the correct email component based on the type
      const getEmailComponent = (type: string): ReactElement => {
        switch (type) {
          case "YelpRecentLoginEmail":
            return <EcomasTemplate name={name} message={message} curso={curso} />;
          case "promasTemplate":
            return <PromasTemplate name={name} message={message} curso={curso} />;
          case "rizoTemplate":
            return <RizoTemplate name={name} message={message} curso={curso} />;
          case "cimadeTemplate":
            return <CimadeTemplate name={name} message={message} curso={curso} />;
          case "binexTemplate":
            return <BinexTemplate name={name} message={message} curso={curso} />;
          case "sayanTemplate":
            return <SayanTemplate name={name} message={message} curso={curso} />;
          default:
            return <div>No email type selected</div>;
        }
      };

      // Render the email HTML based on the type
      const emailHtml: string = render(getEmailComponent(emailType));

      const mailOption: MailOptions = {
        from: companyUser,
        to: email,
        subject: subject,
        html: emailHtml,
      };

      // Attach file if exists
      if (file) {
        const attachment = {
          filename: nameFile + ".pdf",
          content: Buffer.from(file, "base64"), // Decode base64 data
        };
        mailOption.attachments = [attachment];
      }

      await transporter.sendMail(mailOption);

      return NextResponse.json(
        { message: "Email Sent Successfully" },
        { status: 200 }
      );
    } else {
      throw new Error("Unsupported email sevice")
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to Send Email"},
      { status: 500 }
    );
  }
}
