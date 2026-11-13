import { cfg, convocatoriaStatus } from "@/lib/config";
import { REGIMENES } from "@/lib/types";
import { AVISO_PRIVACIDAD } from "@/content/aviso-privacidad";
import RegistroForm from "@/components/RegistroForm";

export const dynamic = "force-dynamic";

export default function Registro() {
  const st = convocatoriaStatus();
  if (!st.abierta)
    return (
      <main>
        <h1>Registro cerrado</h1>
        <div className="msg info">La convocatoria no está abierta en este momento.</div>
        <a href="/">Volver al inicio</a>
      </main>
    );
  return (
    <main>
      <h1>Registro de docentes</h1>
      <p className="lead">Completa tus datos y confirma los requisitos. Te toma menos de 3 minutos.</p>
      <RegistroForm maestrias={cfg().maestrias} regimenes={[...REGIMENES]} aviso={AVISO_PRIVACIDAD} />
    </main>
  );
}
