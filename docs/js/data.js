/**
 * data.js — Unica fonte di verità per i contenuti del portfolio.
 */

export const ME = {
  nome:     'Manuel Cerqua',
  titolo:   'Junior Software Developer',
  email:    'manuelpringols@gmail.com',
  linkedin: 'https://www.linkedin.com/in/manuelpringols',
  website:  'https://manuelpringols.info',
};

export const SECTIONS = {

  chisono: {
    title:    'Chi Sono',
    planet:   'Earth',
    icon:     '🌍',
    content: `Sono Manuel Cerqua, sviluppatore con cinque anni di studio autonomo
su documentazione ufficiale e libri tecnici. La passione per questo
mondo è nata in adolescenza — ma le risorse e la motivazione giusta
sono arrivate più tardi. Oggi lavoro come Junior Software Developer
in consulenza, con un occhio sempre puntato verso la cybersecurity.`,
  },

  esperienze: {
    title:  'Esperienze',
    planet: 'Mars',
    icon:   '🔴',
    items: [
      {
        ruolo:   'Junior Software Developer',
        azienda: 'Convergr (in consulenza per Accenture)',
        luogo:   'Italia',
        periodo: '2024 – presente',
        punti: [
          'Sviluppo e implementazione di workflow, workspace e logiche complesse su piattaforma ServiceNow.',
          'Porting di applicazioni esistenti su ServiceNow con aumento della robustezza e manutenibilità.',
          'Call e confronti diretti con il cliente e team funzionali fin dal primo giorno.',
        ],
      },
      {
        ruolo:   'Operaio Specializzato CNC',
        azienda: 'Acciai Inox Srl',
        luogo:   'Giugliano (NA)',
        periodo: '2019 – 2024',
        punti: [
          'Programmazione e utilizzo di macchine CNC per la lavorazione dell\'acciaio inox.',
          'Lettura di disegni tecnici, controllo qualità e gestione del ciclo produttivo completo.',
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
        titolo:   'Diploma di Perito Industriale',
        istituto: 'ITS Galvani',
        luogo:    'Giugliano (NA)',
        periodo:  '2015 – 2020',
      },
      {
        titolo:   'Java Foundations Associate',
        istituto: 'Oracle Certified',
        luogo:    '',
        periodo:  '',
      },
      {
        titolo:   'Corsi completati: Spring Boot, Angular',
        istituto: 'Udemy',
        luogo:    '',
        periodo:  '',
      },
      {
        titolo:   'eJPT — in preparazione',
        istituto: 'eLearnSecurity / INE',
        luogo:    '',
        periodo:  'obiettivo prossimo',
      },
    ],
  },

  competenze: {
    title:  'Competenze',
    planet: 'Neptune',
    icon:   '🔵',
    gruppi: [
      { label: 'Linguaggi',       items: ['Java', 'JavaScript', 'SQL', 'HTML', 'CSS'] },
      { label: 'Framework',       items: ['Spring Boot', 'Spring Security', 'ServiceNow'] },
      { label: 'Database',        items: ['MySQL', 'PostgreSQL'] },
      { label: 'DevOps & Tools',  items: ['Docker', 'Nginx', 'Git', 'Linux', 'WireGuard'] },
      { label: 'Build',           items: ['Maven', 'npm'] },
    ],
  },

  devops: {
    title:  'Infra & Progetti',
    planet: 'Jupiter',
    icon:   '🟠',
    items: [
      {
        titolo: 'VPS — Hetzner & Netcup',
        desc:   'Contratti VPS scelti in base al rapporto risorse/prezzo. Hosting di applicazioni e servizi tramite Docker Compose, routing con Nginx.',
      },
      {
        titolo: 'WireGuard VPN',
        desc:   'VPN configurata su server personale per mettere tutti i dispositivi di casa sulla stessa rete virtuale, raggiungibili da remoto senza aprire porte sul router.',
      },
      {
        titolo: 'Marmitta',
        desc:   'Tool personale che sfrutta curl con il flag per l\'esecuzione remota di codice bash. Progetto sperimentale su automazione e controllo remoto.',
      },
      {
        titolo: 'Jellyfin & altri servizi',
        desc:   'Server multimediale self-hosted su VPS. Uno dei tanti progetti che hanno fatto da palestra per Linux, Docker e configurazione di rete.',
      },
    ],
  },

  contatti: {
    title:  'Contatti',
    planet: 'Mercury',
    icon:   '☿',
    links: [
      { label: 'Email',    url: 'mailto:manuelpringols@gmail.com',          icon: '📧' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/manuelpringols', icon: '💼' },
    ],
  },

};