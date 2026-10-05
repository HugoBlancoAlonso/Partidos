import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const BottomNav = () => {
  const location = useLocation();

  const getActiveIndex = () => {
    if (location.pathname === '/explore') return 0;
    if (location.pathname === '/') return 1;
    if (location.pathname === '/profile') return 2;
    return 1;
  };

  const activeIndex = getActiveIndex();

  return (
    <StyledWrapper>
      <div className="di-radio-wrap">
        <div className="di-radio-island">
          
          {/* El indicador deslizante basado en el diseño nuevo */}
          <div 
            className="di-radio-indicator"
            style={{ transform: `translateX(${activeIndex * 68}px)` }}
          />

          <NavLink to="/explore" className="di-radio-btn" title="Explorar">
            {/* Lupa */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height={24} width={24} className="icon search">
              <path fill="inherit" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </NavLink>

          <NavLink to="/" className="di-radio-btn" title="Mis Compes" end>
            {/* Estrella */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height={24} width={24} className="icon star">
              <path fill="inherit" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </NavLink>

          <NavLink to="/profile" className="di-radio-btn" title="Perfil">
            {/* Persona */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height={24} width={24} className="icon user">
              <path fill="inherit" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </NavLink>
          
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  pointer-events: none;

  .di-radio-wrap {
    pointer-events: auto;
    width: fit-content;
    display: flex;
    justify-content: center;
    position: relative;
  }

  .di-radio-island {
    background: #000;
    border-radius: 999px;
    padding: 6px;
    display: flex;
    position: relative;
    gap: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1); /* Le añadimos un borde muy sutil para que se vea premium */
  }

  .di-radio-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    width: 64px; /* Ancho fijo para que la pastilla deslizante cuadre perfecto */
    height: 44px;
    border-radius: 999px;
    cursor: pointer;
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  .di-radio-btn svg {
    fill: currentColor;
    transition: all 0.3s ease;
  }

  .di-radio-indicator {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 64px;
    height: calc(100% - 12px);
    background: #222; /* Color de la pastilla activa */
    border-radius: 999px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* El .active lo pone React Router automáticamente cuando estás en la ruta */
  .di-radio-btn.active {
    color: #fff;
    transform: translateY(-1px);
  }

  .di-radio-btn:active {
    transform: scale(0.92);
  }
`;

export default BottomNav;
