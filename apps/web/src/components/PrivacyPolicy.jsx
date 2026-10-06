import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const sectionStyle = {
    marginBottom: '2.5rem',
  };

  const titleStyle = {
    color: 'var(--text-primary)',
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const textStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.7',
    fontSize: '0.95rem',
  };

  const numberStyle = {
    background: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-green)',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '700',
    flexShrink: 0
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative', overflowX: 'hidden' }}>
      {/* Elementos decorativos de fondo */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'rgba(196, 168, 79, 0.03)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

      {/* Header Sticky */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(13, 17, 23, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateX(0)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>Documentación Legal</span>
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
            🛡️
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Política de Privacidad</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Última actualización: 6 de Octubre de 2026</p>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          
          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>1</div> Información sobre la recopilación de datos</h2>
            <p style={textStyle}>
              En esta web respetamos y protegemos los datos personales de los usuarios. Como usuario, debes saber que tus derechos están garantizados. Hemos adaptado esta web a las exigencias del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016 (RGPD) relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>2</div> ¿Qué datos personales recopilamos?</h2>
            <p style={textStyle}>
              Para el correcto funcionamiento de nuestra plataforma, recopilamos y procesamos los siguientes datos:
            </p>
            <ul style={{ ...textStyle, marginTop: '12px', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Datos de cuenta:</strong> Dirección de correo electrónico y contraseña (esta última se almacena de forma encriptada e irreversible).</li>
              <li><strong>Datos de uso:</strong> Tu actividad dentro de la aplicación, como los partidos que marcas como vistos y las competiciones a las que decides hacer seguimiento.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>3</div> Proveedores de servicios de terceros</h2>
            <p style={textStyle}>
              Para garantizar la máxima seguridad y rendimiento, nuestra base de datos y sistema de autenticación están delegados y gestionados por <strong>Supabase</strong>, un servicio de infraestructura Backend-as-a-Service (BaaS) de primer nivel que cumple con los estándares internacionales más estrictos de privacidad y protección de datos.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>4</div> ¿Con qué finalidad tratamos tus datos?</h2>
            <p style={textStyle}>
              Tus datos se utilizan única y exclusivamente para propósitos operativos de la aplicación:
            </p>
            <ul style={{ ...textStyle, marginTop: '12px', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Mantener tu sesión iniciada de forma segura en distintos dispositivos.</li>
              <li>Sincronizar y persistir tu progreso (partidos visualizados y ligas seguidas) en la nube.</li>
              <li>Garantizar la integridad y seguridad de tu cuenta frente a accesos no autorizados.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>5</div> Ejercicio de tus derechos</h2>
            <p style={textStyle}>
              Cualquier persona tiene pleno derecho a obtener confirmación sobre si estamos tratando datos personales que le conciernen. Como interesado, tienes derecho a:
            </p>
            <ul style={{ ...textStyle, marginTop: '12px', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <li>Solicitar el acceso a los datos personales relativos al interesado.</li>
              <li>Solicitar su rectificación o supresión definitiva.</li>
              <li>Solicitar la limitación de su tratamiento.</li>
            </ul>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Para ejercer cualquiera de estos derechos, puedes ponerte en contacto directamente con nuestro equipo de soporte enviando un correo electrónico a: <br/>
                <a href="mailto:blancoalonso05@gmail.com" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginTop: '8px' }}>blancoalonso05@gmail.com</a>
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
