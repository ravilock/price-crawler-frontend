import { SourceAlerts } from '../sourcealerts/SourceAlerts';
import { Offers } from '../offers/Offers';

export function App() {
  return <main>
    <header><h1>Price Intelligence</h1><p>Monitore ofertas autorizadas e compare preços verificados.</p></header>
    <Offers />
    <SourceAlerts />
  </main>;
}
