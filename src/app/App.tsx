import { useState } from 'react';
import { submitOffer } from '../offers/api';

export function App(){const [url,setUrl]=useState('');const [message,setMessage]=useState('');return <main><h1>Price Intelligence</h1><p>Monitorize ofertas autorizadas e compare preços verificados.</p><form onSubmit={async e=>{e.preventDefault();try{const result=await submitOffer(url);setMessage(`Solicitação recebida: ${result.request_id}`)}catch{setMessage('Não foi possível enviar a oferta.')}}}><input aria-label="URL da oferta" type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://loja.example/produto"/><button>Monitorar oferta</button></form><p role="status">{message}</p></main>}
