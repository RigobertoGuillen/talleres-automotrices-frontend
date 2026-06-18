import { useEffect } from 'react';
import { usuarioService } from './services/usuarioService';

function App() {
  useEffect(() => {
    usuarioService.listar()
      .then(res => console.log('Éxito:', res.data))
      .catch(err => console.error('Error de API:', err.response?.data || err.message));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Taller Mecánico</h1>
      <p>Revisa la consola del navegador (F12) para ver la respuesta del Backend.</p>
    </div>
  );
}

export default App;