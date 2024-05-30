import { Body, Container, Column, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";

interface CimadeEmailTemplateProps {
  groupName?: string;
  dataString?: string[];
}

export const CimadeTemplate = ({
  groupName,
  dataString,
}: CimadeEmailTemplateProps) => {
  return (
    <Html>
    <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Row>
              <Column>
                <Img
                  style={sectionLogo}
                  src='https://i.postimg.cc/pT8CYQTN/logo-cimade.png'
                  width="155"
                  alt="Cimade Logo"/>
              </Column>
            </Row>
          </Section>
            <Heading style={h1}>Estimado(a): {groupName}</Heading>
            <Text style={heroText}>
              Nos complace otorgarle estos certificados de finalización de los módulos de:
              <br/>
              <strong>
                {dataString && dataString.map((item, index) => (
                  <React.Fragment key={index}>
                    {item}
                    {index !== dataString.length - 1 && <br />} {/* Agrega un salto de línea si no es el último elemento */}
                  </React.Fragment>
                ))}
              </strong>
              <br/>
              correspondientes a su diplomado llevado a cado en Ecomás Consultoria y Capacitación.
              <br/>
              ¡Felicidades de parte de todo el equipo de Ecomás!
            </Text>
            <Section style={paragraphContent}>
                <Text style={{ ...paragraph, marginTop: "0px" }}>Muchas gracias,</Text>
                <Text style={{ ...paragraph, fontSize: "20px" }}>
                    Equipo de CIMADE
                </Text>
            </Section>

            <Section style={containerContact}>
                <Row>
                    <Column>
                        <Row>
                            <Column style={{ width: "16px" }}>
                                <Img
                                    src='https://i.postimg.cc/4NyFBnd3/envelope-solid.png'
                                    width="16px"
                                    style={{ paddingRight: "14px" }}
                                />
                            </Column>
                            <Column>
                                <Text style={{ ...menutext, marginBottom: "0" }}>
                                    cimade.educacion@gmail.com
                                </Text>
                            </Column>
                        </Row>

                        <Row>
                            <Column style={{ width: "16px" }}>
                                <Img
                                    src='https://i.postimg.cc/Dwbp3D1k/phone-solid.png'
                                    width="16px"
                                    style={{ paddingRight: "14px" }}
                                />
                            </Column>
                            <Column>
                                <Text style={{ ...menutext, marginBottom: "0" }}>
                                    +51 900102090
                                </Text>
                            </Column>
                        </Row>
                        <Row>
                            <Column style={{ width: "16px" }}>
                                <Img
                                    src='https://i.postimg.cc/R05sSRT3/location-dot-solid.png'
                                    width="16px"
                                    style={{ paddingRight: "14px" }}
                                />
                            </Column>
                            <Column>
                                <Text style={{ ...menutext, marginBottom: "0" }}>
                                    Jr, Lambayeque N° 1014, Juliaca 21001
                                </Text>
                            </Column>
                        </Row>
                        <Row>
                            <Column style={{ width: "16px" }}>
                                <Img
                                    src='https://i.postimg.cc/15d7TPnr/globe-solid.png'
                                    width="16px"
                                    style={{ paddingRight: "14px" }}
                                />
                            </Column>
                            <Column>
                                <Text style={{ ...menutext, marginBottom: "0" }}>
                                    cimade.edu.pe
                                </Text>
                            </Column>
                        </Row>
                    </Column>

                </Row>
                <Row>
                    <Text style={paragraph}>Búscanos en nuestras redes:</Text>
                </Row>
                <Row
                    align="left"
                    style={{
                        width: "84px",
                        float: "left",
                    }}
                >
                    <Column style={{ paddingRight: "8px" }}>
                        <Link href="https://web.facebook.com/CimadeEC?_rdc=1&_rdr">
                            <Img
                                width="20"
                                height="25"
                                src='https://i.postimg.cc/vTbBvWhc/facebook-f.png'
                            />
                        </Link>
                    </Column>
                    <Column style={{ paddingRight: "8px" }}>
                        <Link href="https://www.instagram.com/cimade_ec/">
                            <Img
                                width="28"
                                height="28"
                                src="https://i.postimg.cc/59Sj2R9v/instagram.png"
                            />
                        </Link>
                    </Column>
                    <Column style={{ paddingRight: "8px" }}>
                        <Link href="https://www.tiktok.com/@consorciocimade?lang=es">
                            <Img
                                width="24"
                                height="25"
                                src="https://i.postimg.cc/8c4CXjXw/tiktok.png"
                            />
                        </Link>
                    </Column>
                </Row>
            </Section>
            <Row>
                <Img
                    style={footer}
                    width="540"
                    height="48"
                    src='https://i.postimg.cc/dtJJ124x/title-label-header-label-3d-illustration.jpg'
                />
            </Row>
            <Section style={{ ...paragraphContent, paddingBottom: 30 }}>
                <Text
                    style={{
                        ...paragraph,
                        fontSize: "12px",
                        textAlign: "center",
                        margin: 0,
                    }}
                >
                    El contenido de este correo electrónico es confidencial y
                    está destinado exclusivamente a los participantes de los
                    diplomados y/o cursos ofrecidos por CIMADE educación continua.
                    Queda estrictamente prohibido compartir cualquier parte de
                    este mensaje con terceros sin el consentimiento por escrito
                    CIMADE En caso de haber recibido este mensaje por error,
                    le solicitamos que responda a este correo y proceda a su
                    eliminación. Agradecemos su cooperación y comprensión en este asunto.
                </Text>
            </Section>
        </Container>
      </Body>
    </Html>
  );
};
export default CimadeTemplate;

CimadeTemplate.PreviewProps = {
    name: "Juan",
    message: [
        "MATERIALES:",
        "SESION I  : https://n9.cl/s97lk",
        "SESION II : https://n9.cl/a9v7k",
        "https://n9.cl/2zs6v",
        "SESION III: https://n9.cl/67vd0",
        "VIDEOS:",
        "SESION I  : https://n9.cl/a106h",
        "SESION II : https://n9.cl/u7cos2",
        "SESION III: https://n9.cl/6q57q"
    ].join("\n"),
    curso: "Mecánica de suelos",
} as CimadeEmailTemplateProps;


const main = {
    backgroundColor: "#dbddde",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const sectionLogo = {
    padding: "20px 0px 0px 40px",
};

const menutext = {
    fontSize: "13.5px",
    marginTop: 0,
    fontWeight: 500,
    color: "#000",
};

const container = {
    margin: "30px auto",
    backgroundColor: "#fff",
    borderRadius: 5,
    overflow: "hidden",
};

const containerContact = {
    backgroundColor: "#f0fcff",
    width: "90%",
    borderRadius: "5px",
    overflow: "hidden",
    padding: "20px",
};

const heading = {
    fontSize: "20px",
    lineHeight: "26px",
    fontWeight: "700",
    color: "#006fae",
};

const paragraphContent = {
    padding: "0 40px",
};

const paragraph = {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#3c4043",
};

const hr = {
    borderColor: "#e8eaed",
    margin: "20px 0",
};

const footer = {
    maxWidth: "100%",
    margin: "0",
};

const h1 = {
    color: "#1d1c1d",
    fontSize: "18px",
    fontWeight: "700",
    margin: "20px 0",
    padding: "0",
    lineHeight: "15px",
  };

  const heroText = {
    fontSize: "15px",
    lineHeight: "28px",
    marginBottom: "10px",
    textAlign: "justify" as const,
    verticalAlign: "middle",
  
  };
