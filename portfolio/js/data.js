/**
 * data.js — Unica fonte di verità per i contenuti del portfolio.
 * Aggiorna solo questo file per modificare i tuoi dati.
 */

export const ME = {
  nome:     'Manuel Cerqua',
  titolo:   'Sviluppatore Software Junior',
  linkedin: 'https://www.linkedin.com/in/manuelpringols', // aggiorna con il tuo URL esatto
  website:  'https://manuelpringols.info',
};

/* ─────────────────────────────────────────────────
   SEZIONI — corrispondono ai pianeti
───────────────────────────────────────────────── */

export const SECTIONS = {

  chisono: {
    title:    'Chi Sono',
    planet:   'Earth',
    icon:     '🌍',
    content: `Sono un professionista giovane e motivato con esperienza nel settore
industriale e una forte passione per la tecnologia e lo sviluppo software.
Dedico grande attenzione al lavoro, mantenendo un approccio positivo anche
sotto pressione. Mi impegno a migliorarmi continuamente, acquisendo nuove
competenze e affrontando nuove sfide.`,
  },

  esperienze: {
    title:  'Esperienze',
    planet: 'Mars',
    icon:   '🔴',
    items: [
      {
        ruolo:   'Operaio Specializzato CNC',
        azienda: 'Acciai Inox Srl',
        luogo:   'Giugliano (NA)',
        periodo: '2019 – presente',
        punti: [
          'Programmazione e utilizzo di macchine CNC per la lavorazione dell\'acciaio inox.',
          'Ottimizzazione dei processi produttivi attraverso il lavoro di squadra.',
        ],
      },
    ],
  },

  istruzione: {
    title:  'Istruzione',
    planet: 'Saturn',
    icon:   '🪐',
    items: [
      {
        titolo:    'Diploma di Perito Industriale',
        istituto:  'ITS Galvani',
        luogo:     'Giugliano (NA)',
        periodo:   '2015 – 2020',
      },
      {
        titolo:    'Certificazione Java Oracle',
        istituto:  'Java Foundations Associate',
        luogo:     '',
        periodo:   '',
      },
    ],
  },

  competenze: {
    title:  'Competenze',
    planet: 'Neptune',
    icon:   '🔵',
    gruppi: [
      { label: 'Linguaggi',       items: ['Java', 'JavaScript', 'SQL', 'HTML', 'CSS'] },
      { label: 'Framework',       items: ['Spring Boot', 'Angular'] },
      { label: 'Database',        items: ['MySQL', 'PostgreSQL'] },
      { label: 'Versionamento',   items: ['Git'] },
      { label: 'Build & Package', items: ['Maven', 'Npm'] },
    ],
  },

  devops: {
    title:  'DevOps & Backend',
    planet: 'Jupiter',
    icon:   '🟠',
    items: [
      {
        titolo: 'Containerizzazione Docker',
        desc:   'Creazione, configurazione e gestione di container Docker per sviluppo e produzione.',
      },
      {
        titolo: 'Deploy su Hetzner VPS',
        desc:   'Gestione infrastruttura e deployment via Docker Compose su server dedicati.',
      },
      {
        titolo: 'API REST con Spring Boot',
        desc:   'Sviluppo e gestione di REST API, Spring Security (autenticazione/autorizzazione), Spring Data JPA.',
      },
      {
        titolo: 'Sistemi Operativi',
        desc:   'Linux — gestione server, deploy applicazioni, configurazioni di base.',
      },
    ],
  },

  contatti: {
    title:  'Contatti',
    planet: 'Mercury',
    icon:   '☿',
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/manuelpringols', icon: '💼' },
      { label: 'Portfolio', url: 'https://manuelpringols.info', icon: '🌐' },
    ],
  },

};
