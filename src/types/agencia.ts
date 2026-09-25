/* Tipos do JSON da agência. Todo campo é opcional: o template precisa funcionar com dados parciais. */

export type Maybe<T> = T | null | undefined;
export type Text = Maybe<string>;
export type NumLike = Maybe<number | string>;

export interface Botao {
  texto?: Text;
  link?: Text;
  icone?: Text;
}

export interface Logotipo {
  principal?: Text;
  branco?: Text;
  icone?: Text;
  favicon?: Text;
  alt?: Text;
}

export interface IdentidadeVisual {
  cor_primaria?: Text;
  cor_secundaria?: Text;
  cor_destaque?: Text;
  cor_escura?: Text;
  cor_clara?: Text;
  fonte_titulos?: Text;
  fonte_textos?: Text;
}

export interface Agencia {
  nome?: Text;
  nome_curto?: Text;
  slogan?: Text;
  descricao_curta?: Text;
  ano_fundacao?: NumLike;
  cnpj?: Text;
  cadastur?: Text;
  logotipo?: Maybe<Logotipo>;
  identidade_visual?: Maybe<IdentidadeVisual>;
}

export interface Seo {
  titulo?: Text;
  descricao?: Text;
  palavras_chave?: Maybe<string[]>;
  imagem_compartilhamento?: Text;
}

export interface MenuItem {
  rotulo?: Text;
  ancora?: Text;
}

export type TipoCampo = 'text' | 'email' | 'tel' | 'date' | 'number' | 'url' | 'select' | 'textarea' | string;

export interface CampoFormulario {
  nome?: Text;
  rotulo?: Text;
  placeholder?: Text;
  tipo?: Maybe<TipoCampo>;
  obrigatorio?: Maybe<boolean>;
  opcoes?: Maybe<string[]>;
}

export interface HeroSlide {
  titulo?: Text;
  subtitulo?: Text;
  imagem?: Text;
}

export interface Busca {
  ativo?: Maybe<boolean>;
  campos?: Maybe<CampoFormulario[]>;
  botao?: Text;
}

export interface Estatistica {
  valor?: NumLike;
  rotulo?: Text;
}

export interface Hero {
  etiqueta?: Text;
  titulo?: Text;
  titulo_destaque?: Text;
  subtitulo?: Text;
  imagem_fundo?: Text;
  video_fundo?: Text;
  overlay_opacidade?: NumLike;
  cta_primario?: Maybe<Botao>;
  cta_secundario?: Maybe<Botao>;
  slides?: Maybe<HeroSlide[]>;
  busca?: Maybe<Busca>;
  estatisticas?: Maybe<Estatistica[]>;
}

export interface Numero {
  valor?: NumLike;
  sufixo?: Text;
  rotulo?: Text;
}

export interface MembroEquipe {
  nome?: Text;
  cargo?: Text;
  especialidade?: Text;
  foto?: Text;
}

export interface Sobre {
  etiqueta?: Text;
  titulo?: Text;
  subtitulo?: Text;
  paragrafos?: Maybe<string[]>;
  imagem_principal?: Text;
  imagem_secundaria?: Text;
  selo_experiencia?: Maybe<{ valor?: NumLike; rotulo?: Text }>;
  missao?: Text;
  visao?: Text;
  valores?: Maybe<string[]>;
  numeros?: Maybe<Numero[]>;
  equipe?: Maybe<MembroEquipe[]>;
  cta?: Maybe<Botao>;
}

export interface ItemIcone {
  icone?: Text;
  titulo?: Text;
  descricao?: Text;
}

export interface Diferenciais {
  etiqueta?: Text;
  titulo?: Text;
  subtitulo?: Text;
  imagem?: Text;
  itens?: Maybe<ItemIcone[]>;
}

export interface Servico {
  id?: Text;
  icone?: Text;
  titulo?: Text;
  descricao?: Text;
  imagem?: Text;
  beneficios?: Maybe<string[]>;
  cta?: Maybe<Botao>;
}

export interface Servicos {
  etiqueta?: Text;
  titulo?: Text;
  subtitulo?: Text;
  itens?: Maybe<Servico[]>;
  servicos_complementares?: Maybe<ItemIcone[]>;
}

export interface Destino {
  destino?: Text;
  titulo?: Text;
  imagem?: Text;
  duracao?: Text;
  inclusos?: Maybe<string[]>;
  preco_de?: Text;
  preco_por?: Text;
  parcelamento?: Text;
  etiqueta?: Text;
  avaliacao?: NumLike;
}

export interface DestinosDestaque {
  etiqueta?: Text;
  titulo?: Text;
  subtitulo?: Text;
  itens?: Maybe<Destino[]>;
}

export interface Depoimento {
  nome?: Text;
  cidade?: Text;
  foto?: Text;
  avaliacao?: NumLike;
  viagem?: Text;
  data?: Text;
  texto?: Text;
}

export interface Depoimentos {
  etiqueta?: Text;
  titulo?: Text;
  subtitulo?: Text;
  media_avaliacao?: NumLike;
  total_avaliacoes?: NumLike;
  fonte?: Text;
  itens?: Maybe<Depoimento[]>;
}

export interface Foto {
  url?: Text;
  miniatura?: Text;
  titulo?: Text;
  local?: Text;
  categoria?: Text;
  alt?: Text;
}

export interface Galeria {
  etiqueta?: Text;
  titulo?: Text;
  subtitulo?: Text;
  categorias?: Maybe<string[]>;
  fotos?: Maybe<Foto[]>;
}

export interface Faq {
  etiqueta?: Text;
  titulo?: Text;
  subtitulo?: Text;
  itens?: Maybe<{ pergunta?: Text; resposta?: Text }[]>;
}

export interface CtaFinal {
  titulo?: Text;
  subtitulo?: Text;
  imagem_fundo?: Text;
  botao?: Maybe<Botao>;
}

export interface Newsletter {
  titulo?: Text;
  subtitulo?: Text;
  placeholder?: Text;
  botao?: Text;
}

export interface LinkExibicao {
  exibicao?: Text;
  link?: Text;
}

export interface WhatsApp extends LinkExibicao {
  numero?: Text;
  mensagem_padrao?: Text;
}

export interface Formulario {
  titulo?: Text;
  campos?: Maybe<CampoFormulario[]>;
  botao?: Text;
  mensagem_sucesso?: Text;
  aviso_privacidade?: Text;
}

export interface Mapa {
  latitude?: NumLike;
  longitude?: NumLike;
  embed_url?: Text;
  link?: Text;
}

export interface Contato {
  etiqueta?: Text;
  titulo?: Text;
  subtitulo?: Text;
  telefone?: Maybe<LinkExibicao>;
  whatsapp?: Maybe<WhatsApp>;
  email?: Maybe<LinkExibicao>;
  emails_departamentos?: Maybe<{ setor?: Text; email?: Text }[]>;
  horario_atendimento?: Maybe<{ dias?: Text; horario?: Text }[]>;
  formulario?: Maybe<Formulario>;
  mapa?: Maybe<Mapa>;
}

export interface RedeSocial {
  nome?: Text;
  usuario?: Text;
  url?: Text;
  icone?: Text;
  seguidores?: Text;
}

export interface Endereco {
  logradouro?: Text;
  numero?: Text;
  complemento?: Text;
  bairro?: Text;
  cidade?: Text;
  estado?: Text;
  uf?: Text;
  cep?: Text;
  pais?: Text;
  referencia?: Text;
  completo?: Text;
}

export interface Rodape {
  sobre?: Text;
  links_rapidos?: Maybe<{ rotulo?: Text; link?: Text }[]>;
  links_legais?: Maybe<{ rotulo?: Text; link?: Text }[]>;
  formas_pagamento?: Maybe<string[]>;
  selos?: Maybe<{ nome?: Text; descricao?: Text }[]>;
  copyright?: Text;
  aviso_demo?: Text;
}

export interface AgencyData {
  agencia?: Maybe<Agencia>;
  seo?: Maybe<Seo>;
  menu?: Maybe<MenuItem[]>;
  hero?: Maybe<Hero>;
  sobre?: Maybe<Sobre>;
  diferenciais?: Maybe<Diferenciais>;
  servicos?: Maybe<Servicos>;
  destinos_destaque?: Maybe<DestinosDestaque>;
  depoimentos?: Maybe<Depoimentos>;
  galeria?: Maybe<Galeria>;
  faq?: Maybe<Faq>;
  cta_final?: Maybe<CtaFinal>;
  newsletter?: Maybe<Newsletter>;
  contato?: Maybe<Contato>;
  redes_sociais?: Maybe<RedeSocial[]>;
  endereco?: Maybe<Endereco>;
  rodape?: Maybe<Rodape>;
}
