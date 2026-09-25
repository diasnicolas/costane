/* Mensagem amigável quando o JSON não pode ser carregado. */
import { useEffect } from 'react';
import { ThemeToggle } from './ui';

export function ErrorState({ url }: { url: string }) {
  useEffect(() => {
    document.title = 'Erro ao carregar o site';
  }, []);

  return (
    <>
      <header id="site-header" className="site-header is-minimal">
        <div className="header-bar">
          <span className="brand" />
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="app-error" role="alert">
          <div className="container">
            <div className="tile error-tile">
              <span className="icon-sq icon-sq--lg" aria-hidden="true">
                <i className="fa-solid fa-plug-circle-exclamation" />
              </span>
              <h1 className="error-tile__title">Não foi possível carregar o conteúdo do site</h1>
              <p>
                Este template lê todas as informações de um arquivo JSON e precisa ser aberto por um <strong>servidor HTTP</strong>. Abrir o{' '}
                <code>index.html</code> direto do disco (<code>file://</code>) ou informar um arquivo inexistente impede o carregamento.
              </p>
              <ol className="error-tile__steps">
                <li>
                  Em desenvolvimento, abra um terminal na pasta do template e execute <code>npm run dev</code>;
                </li>
                <li>
                  Para publicar, gere o build com <code>npm run build</code> e sirva a pasta <code>dist/</code> por HTTP (ex.:{' '}
                  <code>npm run preview</code>);
                </li>
                <li>Confira se o arquivo de dados existe no endereço indicado abaixo.</li>
              </ol>
              <p className="error-tile__detail">
                Arquivo solicitado: <code>{url}</code>
              </p>
              <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
                <i className="fa-solid fa-rotate-right" aria-hidden="true" />
                <span>Tentar novamente</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
