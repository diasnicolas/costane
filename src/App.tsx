import { useMemo } from 'react';
import type { AgencyData } from './types/agencia';
import { DATA_URL, useAgencyData } from './data/useAgencyData';
import { visibleSections } from './lib/sections';
import { waMainLink } from './lib/whatsapp';
import { AnnouncerProvider } from './hooks/useAnnouncer';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { useSmoothAnchors } from './hooks/useSmoothAnchors';
import { ThemeProvider } from './hooks/useTheme';
import { About } from './components/About';
import { BackToTop, Mesh, Preloader, WhatsAppFloat } from './components/Chrome';
import { Contact } from './components/Contact';
import { CtaFinal } from './components/CtaFinal';
import { Differentials } from './components/Differentials';
import { ErrorState } from './components/ErrorState';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Testimonials } from './components/Testimonials';

/** Página completa renderizada a partir dos dados. */
function Site({ data }: { data: AgencyData }) {
  useDocumentMeta(data);
  useSmoothAnchors();
  const visibleIds = useMemo(() => visibleSections(data), [data]);
  const waLink = waMainLink(data.contato);
  const hasWa = /^https?:/i.test(waLink);

  return (
    <>
      <Header data={data} visibleIds={visibleIds} />
      <main id="main" tabIndex={-1}>
        <Hero data={data} />
        <About data={data} />
        <Differentials data={data} />
        <Services data={data} />
        <Gallery data={data} />
        <Testimonials data={data} />
        <Faq data={data} />
        <CtaFinal data={data} />
        <Contact data={data} />
      </main>
      <Footer data={data} />
      {hasWa && <WhatsAppFloat href={waLink} />}
      <BackToTop solo={!hasWa} />
    </>
  );
}

export default function App() {
  const state = useAgencyData();
  return (
    <ThemeProvider>
      <AnnouncerProvider>
        <a className="skip-link" href="#main">
          Pular para o conteúdo
        </a>
        <Mesh />
        <Preloader done={state.status !== 'loading'} />
        {state.status === 'ready' && <Site data={state.data} />}
        {state.status === 'error' && <ErrorState url={DATA_URL} />}
      </AnnouncerProvider>
    </ThemeProvider>
  );
}
