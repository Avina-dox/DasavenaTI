// src/ErrorBoundary.jsx
import React from "react";
export default class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state={err:null,info:null}; }
  static getDerivedStateFromError(error){ return { err: error }; }
  componentDidCatch(err, info){ console.error("UI ERROR:", err, info); this.setState({info}); }
  render(){
    if (this.state.err) {
      return (
        <pre style={{padding:16,whiteSpace:"pre-wrap", color:"#b00020", background:"#fff0f0"}}>
{`💥 Error de UI:
${String(this.state.err)}
Más detalle en la consola del navegador (F12).`}
        </pre>
      );
    }
    return this.props.children;
  }
}
