import React from 'react'

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontFamily: 'sans-serif',
      textAlign: 'center',
      backgroundColor: '#f0f2f5',
      color: '#1c1e21',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', color: '#007bff', marginBottom: '10px' }}>
        ¡Agenda Perpétua Online! 🚀
      </h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '500px' }}>
        Se você está lendo esta mensagem, o nosso servidor e as rotas estão 100% corretos. A tela branca sumiu!
      </p>
    </div>
  )
}

export default App
