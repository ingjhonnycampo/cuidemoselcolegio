import React from 'react';

function Footer() {
  return (
    <footer style={styles.footer}>
      @Todos los derechos reservados <strong>SYNERGY</strong>, Diseñado por Ing. Jhonny A. Campo Herrera
    </footer>
  );
}

const styles = {
  footer: {
    width: '100%',
    padding: '16px 0 12px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#555',
    background: 'transparent',
    position: 'fixed',
    left: 0,
    bottom: 0,
    zIndex: 10,
    letterSpacing: '0.5px',
    backdropFilter: 'blur(2px)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  }
};

export default Footer;
