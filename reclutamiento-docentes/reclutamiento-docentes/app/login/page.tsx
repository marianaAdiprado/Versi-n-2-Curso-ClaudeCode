export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main>
      <h1>Panel de reclutamiento</h1>
      <p className="lead">Acceso para la Coordinación Académica y las direcciones de maestría.</p>
      {error === "sin-acceso" && <div className="msg err">Tu cuenta de Google no tiene acceso al panel.</div>}
      {error === "sesion" && <div className="msg err">No pudimos iniciar sesión. Inténtalo de nuevo.</div>}
      <p><a className="btn sec" href="/api/auth/login">Entrar con Google</a></p>
    </main>
  );
}
