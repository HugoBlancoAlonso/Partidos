import { useNavigate } from 'react-router-dom';

export default function LegalNotice() {
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
    background: 'rgba(196, 168, 79, 0.15)',
    color: 'var(--accent-gold)',
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
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(196, 168, 79, 0.05)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      
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
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(196, 168, 79, 0.1)', color: 'var(--accent-gold)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
            ⚖️
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Aviso Legal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Última actualización: 6 de Octubre de 2026</p>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          
          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>1</div> Datos Identificativos</h2>
            <p style={textStyle}>
              En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se reflejan a continuación los datos identificativos del responsable de este sitio web:
            </p>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', marginTop: '16px', display: 'grid', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Titular:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Hugo Blanco</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contacto:</span>
                <a href="mailto:blancoalonso05@gmail.com" style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>blancoalonso05@gmail.com</a>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>2</div> Usuarios y Acceso</h2>
            <p style={textStyle}>
              El acceso y/o uso de este portal atribuye la condición de USUARIO. El usuario acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso reflejadas en el presente documento. Si el usuario no estuviera de acuerdo con cualquiera de las condiciones aquí establecidas, deberá abstenerse de utilizar el portal.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>3</div> Uso del Portal</h2>
            <p style={textStyle}>
              La plataforma proporciona acceso a información, servicios y funcionalidades ("los contenidos") en Internet pertenecientes a <strong>El Titular</strong>. El USUARIO asume plenamente la responsabilidad del uso del portal. Dicha responsabilidad se extiende al proceso de registro que fuese necesario para acceder a servicios específicos, donde el usuario será responsable de aportar información veraz y lícita.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>4</div> Propiedad Intelectual e Industrial</h2>
            <p style={textStyle}>
              <strong>El Titular</strong>, por sí mismo o como cesionario, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos primarios contenidos en la misma (a título enunciativo: código fuente, diseño de interfaces, arquitectura de navegación, bases de datos, logotipos y combinaciones de colores). Quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web sin la autorización de El Titular.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>5</div> Exclusión de Garantías y Responsabilidad</h2>
            <p style={textStyle}>
              <strong>El Titular</strong> ha adoptado todas las medidas tecnológicas razonables para evitar daños, sin embargo, no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionarse. Esto incluye, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad temporal del portal, o la transmisión de programas maliciosos, a pesar de haber implementado protocolos de seguridad de vanguardia.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={titleStyle}><div style={numberStyle}>6</div> Modificaciones y Actualizaciones</h2>
            <p style={textStyle}>
              <strong>El Titular</strong> se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en la plataforma, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios prestados a través de la misma, como la forma en la que éstos aparezcan presentados o localizados en su portal.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
