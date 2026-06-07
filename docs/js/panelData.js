/**
 * panelData.js — Contenuto dettagliato per ogni pannello pianeta.
 */
export const PANEL_DATA = {

  /* ─── EARTH — Chi Sono ─── */
  chisono: { tabs: [
    { label: 'Profilo', items: [
      { title: 'Chi Sono',
        body: `Sono Manuel Cerqua, sviluppatore con cinque anni di studio autonomo su documentazione ufficiale e libri tecnici.\n\nLa passione per la programmazione è nata in età adolescenziale, ma per lungo tempo non ho avuto né le risorse né la motivazione giusta per approfondirla seriamente. Quando ho deciso di farlo, l'ho fatto sul serio: documentazione prima di tutto, progetti reali, niente scorciatoie.\n\nOggi mi sento a mio agio quando lavoro con Java e Spring Boot, con cui riesco a gestire backend anche su architetture a microservizi, inclusa la gestione della sicurezza con Spring Security e token JWT.` },
      ]},
      
      
    { label: 'Approccio', items: [
      { title: 'Problem Solving',
        body: `Il problem solving è probabilmente la competenza su cui mi sento più solido.\n\nViene da anni di studio autonomo — quando non hai nessuno a cui chiedere, impari a scomporre il problema, leggere i log, capire cosa sta succedendo davvero sotto il cofano.\n\nQuesto approccio si è dimostrato utile anche in contesto lavorativo, dove fin dal primo giorno mi sono trovato a gestire casi reali senza troppo supporto. Non mi spaventa non sapere qualcosa: so dove cercare e come ragionare per arrivarci.` },
    
      { title: 'Come Studio',
        body: `Il mio metodo è sempre partito dalla documentazione ufficiale — Spring.io, Oracle Docs, MDN, ServiceNow Docs.\nHo completato corsi su Udemy dedicati a Spring Boot e Angular, che mi hanno dato struttura a cose che avevo già esplorato da solo. Non li considero il punto di partenza, ma un modo per consolidare e ordinare.\n\nLa pratica è sempre stata la vera palestra: ogni concetto studiato è stato applicato su qualcosa di reale, anche piccolo, anche rotto. Soprattutto quando era rotto.` },
      { title: 'Direzione: Cybersecurity',
        body: `Il prossimo step che voglio fare è virare verso la cybersecurity.\n\nNon è un interesse nato ieri — è qualcosa che mi ha sempre attirato, e che inizia ad avere senso come direzione professionale concreta. Il primo traguardo che mi sono dato è ottenere la certificazione eJPT (eLearnSecurity Junior Penetration Tester), che rappresenta un punto di ingresso solido e riconosciuto in questo ambito.\n\nLe basi ci sono: Linux, networking, gestione dei server, automazione. Costruirci sopra qualcosa di orientato alla sicurezza è il piano.` },
    ]},
    { label: 'Interessi', items: [
      { title: 'Astronomia & Spazio',
        body: `Come si evince abbastanza chiaramente da questo sito, sono appassionato di astronomia e di tutto ciò che riguarda lo spazio.\n\nNon è solo estetica — è un interesse genuino che mi porta a leggere, guardare e approfondire ogni volta che posso. I pianeti, le nebulose, la struttura dell'universo: trovo tutto questo affascinante sia dal punto di vista scientifico che visivo.\n\nIl portfolio in forma di sistema solare non era un'idea casuale.` },
      { title: 'Progetti Personali',
        body: `Fuori dal lavoro ho sempre avuto piccoli progetti personali in giro su vari ambiti.\n\nAlcuni sono strumenti pratici (Marmitta, la VPN WireGuard), altri più orientati all'apprendimento (il server Jellyfin, le configurazioni VPS). Non tutti sono finiti, non tutti hanno uno scopo preciso — ma tutti mi hanno insegnato qualcosa.\n\nQuesto sito è forse il progetto più visibile, ma è solo la punta di un iceberg fatto di cose che vivono su un VPS o in un repo GitHub.` },
    ]},
  ]},

  /* ─── MARS — Esperienze ─── */
  esperienze: { tabs: [
    { label: 'Accenture', items: [
      { title: 'Junior Software Developer',
        body: `📍 Convergr — in consulenza per Accenture\n📅 2024 – presente\n\nContratto di apprendistato come Junior Software Developer. Lavoro sulla piattaforma ServiceNow all'interno di un contesto di consulenza enterprise.\n\nFin dal primo giorno sono stato messo in campo su casi reali, con responsabilità concrete:\n\n• Sviluppo e implementazione di workflow, workspace e item con logiche complesse\n• Porting di applicazioni esistenti su ServiceNow, con focus sull'aumentare robustezza e manutenibilità del codice\n• Gestione di Scripted REST Resources e logiche server-side in JavaScript\n• Call e confronti diretti con il cliente e con i team funzionali` },
      { title: 'ServiceNow in pratica',
        body: `ServiceNow non è solo configurazione — richiede una comprensione reale di come funzionano le piattaforme enterprise.\n\nLavorarci ha richiesto di mettere insieme cose diverse:\n\n💻 Frontend\nConoscenza di HTML, CSS, JavaScript per interfacce custom e widget sulla piattaforma.\n\n⚙️ Backend\nLogica server-side tramite Script Include, Business Rules e Scripted REST Resources in JavaScript.\n\n🔗 Integrations\nGestione di flussi dati tra sistemi diversi, con attenzione alla robustezza degli script in produzione.\n\nIl contesto di consulenza ha aggiunto anche la dimensione del cliente: capire cosa serve davvero, non solo cosa è stato chiesto.` },
    ]},
    { label: 'CNC', items: [
      { title: 'Operaio Specializzato CNC',
        body: `📍 Acciai Inox Srl — Giugliano (NA)\n📅 2019 – 2024\n\nCinque anni come operaio specializzato CNC nel settore della lavorazione dell'acciaio inox.\n\nResponsabilità principali:\n• Programmazione e utilizzo di centri di lavoro CNC a partire da disegni tecnici\n• Gestione del ciclo completo: lettura del disegno, setup macchina, controllo qualità del pezzo\n• Controllo dimensionale con strumenti di misura di precisione\n\nQuesto periodo ha formato un modo di lavorare preciso, metodico e orientato al risultato — qualità che si trasferiscono direttamente nel codice.` },
      { title: 'Cosa mi ha lasciato',
        body: `Cinque anni in ambiente industriale ad alta precisione lasciano il segno.\n\nNon tanto le competenze tecniche CNC in sé, ma il metodo:\n\n• Rispetto delle specifiche: quando qualcosa deve funzionare in un certo modo, funziona così. Non "più o meno".\n• Lavoro sotto pressione senza perdere qualità\n• Problem solving pratico: i macchinari non aspettano, i problemi si risolvono\n\nÈ un bagaglio che molti developer junior non hanno, e che si sente quando si lavora su qualcosa che deve andare in produzione.` },
    ]},
    { label: 'Progetti', items: [
      { title: 'Marmitta — genesi',
        body: `😈 Marmitta nasce da un problema reale.\n\nGli script Bash sono utilissimi — la loro pecca più grande è che devi tenerli sempre con te o ricordare dove li hai messi per poterli runnare.\n\nL'idea: e se fossero sempre raggiungibili da qualsiasi terminale, senza clonare nulla, con un'interfaccia navigabile?\n\nDa questa domanda nasce Marmitta: un launcher CLI che si aggancia a repository GitHub e ti permette di sfogliare, visualizzare in anteprima ed eseguire script Bash direttamente dal terminale.\n\nLa potenzialità del tool sta tutta nello script finale — che può essere di qualsiasi tipo. Un installer, uno script di sistema, un tool di sicurezza, un automatore. Marmitta è il launcher, non il limite.` },
      { title: 'VPN WireGuard',
        body: `🔒 Ho configurato una VPN WireGuard sul server per mettere tutti i dispositivi di casa sulla stessa rete virtuale.\n\nL'obiettivo: accesso remoto sicuro senza aprire porte sul router e senza passare da servizi di terze parti.\n\nCome funziona:\n• Il VPS fa da relay\n• Tutti i dispositivi di casa si connettono via WireGuard\n• Da fuori mi connetto alla VPN e accedo a tutto come in LAN\n• Nessuna porta esposta, traffico cifrato end-to-end\n\nUn progetto piccolo ma concreto che tocca networking, Linux e sicurezza insieme.` },
    ]},
  ]},

  /* ─── SATURN — Istruzione ─── */
  istruzione: { tabs: [
    { label: 'Formazione', items: [
      { title: 'Diploma di Perito Industriale',
        body: `🏫 ITS Galvani — Giugliano (NA)\n📅 2015 – 2020\n\nDiploma di Perito Industriale ad indirizzo Meccanico con approfondimenti in automazione e informatica industriale.\n\nMaterie principali:\n• Meccanica, macchine ed energia\n• Sistemi e automazione\n• Disegno tecnico e progettazione industriale\n• Informatica applicata ai processi industriali\n• Matematica e fisica applicata\n\nIl percorso ha costruito una base di pensiero tecnico e abitudine alla lettura di documentazione — competenze utili anche nel software.` },
      { title: '5 anni di Studio Autonomo',
        body: `La parte più significativa della mia formazione non è in nessun certificato.\n\nCinque anni di studio su documentazione ufficiale, libri tecnici, progetti pratici. La passione per questo mondo esisteva già in adolescenza, ma le risorse e la disciplina necessarie sono arrivate più tardi.\n\nIl metodo: documentazione ufficiale come punto di partenza, applicazione immediata su qualcosa di reale, debug come strumento di comprensione.\n\nCorsi Udemy completati su Spring Boot e Angular — non il punto di partenza, ma utili per strutturare e consolidare cose già esplorate in autonomia.` },
    ]},
    { label: 'Certificazioni', items: [
      { title: 'Java Foundations Associate',
        body: `📜 Oracle Certified — Java Foundations Associate\n\nCertificazione minima, ne sono consapevole. Ma conferma la conoscenza dei fondamentali di Java e, più in generale, della programmazione orientata agli oggetti.\n\nArgomenti coperti:\n• OOP: classi, interfacce, ereditarietà, polimorfismo\n• Java Collections Framework\n• Gestione delle eccezioni\n• Stream API e lambda expressions\n• Concorrenza di base\n\nNon è il traguardo più ambizioso, ma è onesta: dice esattamente quello che attesta, niente di più.` },
      { title: 'eJPT — prossimo obiettivo',
        body: `🎯 eJPT — eLearnSecurity Junior Penetration Tester\n\nÈ la prossima certificazione che voglio ottenere. Rappresenta un punto di ingresso concreto e riconosciuto nel mondo della cybersecurity offensiva.\n\nPerché eJPT:\n• Orientata alla pratica, non solo alla teoria\n• Copre fondamentali di networking, enumerazione, exploitation di base\n• Riconosciuta come primo step serio nel percorso pentest\n\nLe basi per affrontarla ci sono: Linux, networking, un po' di automazione e la curiosità che ha prodotto progetti come Marmitta e la VPN WireGuard.` },
    ]},
    { label: 'Roadmap', items: [
      { title: 'Completato',
        body: `✅ Completato ad oggi:\n\n• Java + Spring Boot ecosystem (microservizi, Spring Security, JWT, Spring Data JPA)\n• ServiceNow platform (workflow, scripted resources, integrazioni)\n• Docker e Docker Compose\n• Nginx come reverse proxy\n• Linux server management\n• Git (workflow base, branching, commit history pulito)\n• MySQL e PostgreSQL\n• WireGuard VPN\n• HTML, CSS, JavaScript\n• Angular (conoscende di base)\n• Three.js e GLSL shaders (progetto portfolio)\n• Certificazione Java Foundations Associate` },
      { title: 'Prossimi step',
        body: `🎯 In programma:\n\n• eJPT — certificazione cybersecurity entry-level, primo obiettivo concreto\n• Approfondimento networking e protocolli (TCP/IP, DNS, HTTP in dettaglio)\n• Basi di ethical hacking e penetration testing metodologico\n• Linux avanzato in ottica security\n• Espansione del repo di script Marmitta in direzione security/automazione\n\nL'obiettivo non è diventare un pentester dall'oggi al domani. È costruire una base solida, certificata e reale — partendo da quello che so già e aggiungendo il layer di sicurezza sopra.` },
    ]},
  ]},

  /* ─── NEPTUNE — Competenze ─── */
  competenze: { tabs: [
    { label: 'Linguaggi', items: [
      { title: 'Java',
        body: `☕ Java — Linguaggio principale\n\nJava è il linguaggio su cui mi sento più solido. Cinque anni di pratica su progetti reali, non solo esercizi.\n\nAree di padronanza:\n• OOP avanzata: design pattern, composizione vs ereditarietà, principi SOLID\n• Collections Framework: scelta consapevole della struttura giusta per il caso\n• Stream API e lambda: operazioni funzionali su collezioni\n• Gestione delle eccezioni strutturata\n• Concorrenza di base\n\nDove mi sento più a mio agio: backend con Spring Boot, microservizi, gestione della sicurezza con Spring Security e JWT.` },
      { title: 'JavaScript & Web',
        body: `🌐 JavaScript / HTML / CSS\n\n**JavaScript**\nUsato sia in contesto frontend (Angular, Three.js) che in ambiente ServiceNow per Scripted REST Resources e logiche server-side. Buona comprensione di async/await, Promise, DOM manipulation.\n\n**HTML / CSS**\nMarkup semantico, CSS3 con custom properties, Flexbox, Grid, animazioni keyframe. Il portfolio è un buon esempio di cosa so fare con CSS quando serve.\n\n**Three.js / GLSL**\nUsato per questo portfolio — geometrie 3D, shader custom vertex + fragment, post-processing con bloom. Non è il mio stack principale, ma funziona.\n\n**TypeScript**\nBase, usato in contesto Angular.` },
      { title: 'SQL',
        body: `📊 SQL — MySQL & PostgreSQL\n\nConoscenza solida di SQL su entrambi i database principali.\n\n• DDL: progettazione schema con vincoli, indici, tipi appropriati\n• DML: SELECT con JOIN multipli, subquery, GROUP BY, aggregazioni\n• Integrazione ORM con Spring Data JPA e Hibernate\n• Mappatura relazioni @OneToMany / @ManyToMany\n• Lazy vs eager loading, gestione delle N+1 queries\n\nPostgreSQL è la mia preferenza per progetti in produzione — migliore conformità SQL standard e funzionalità più complete.` },
    ]},
    { label: 'Framework', items: [
      { title: 'Spring Boot',
        body: `🍃 Spring Boot — Framework Backend Principale\n\nÈ lo stack su cui ho investito di più e dove mi sento davvero a mio agio.\n\n**REST API**\n@RestController, gestione centralizzata degli errori con @ControllerAdvice, validazione input con Bean Validation, paginazione con Pageable.\n\n**Spring Security**\nAutenticazione JWT: generazione, validazione, refresh token. BCrypt per le password. Protezione endpoint con @PreAuthorize. CORS configuration.\n\n**Spring Data JPA**\nRepository pattern, query derivate, @Query custom, @Transactional.\n\n**Microservizi**\nEsperienza nella gestione di backend a microservizi, con attenzione alla separazione delle responsabilità e alla comunicazione tra servizi.` },
      { title: 'ServiceNow',
        body: `⚙️ ServiceNow — Piattaforma enterprise\n\nEsperienza acquisita direttamente in contesto lavorativo.\n\n**Sviluppo**\n• Workflow e Flow Designer per processi aziendali complessi\n• Scripted REST Resources per API custom\n• Script Include e Business Rules in JavaScript server-side\n• Workspace e UI Builder per interfacce custom\n\n**Approccio**\nIl lavoro su ServiceNow richiede di tenere insieme frontend, logica backend e integrazione con sistemi esterni. Non è solo configurazione — richiede pensiero architetturale su piattaforma proprietaria.\n\nHo lavorato principalmente su porting di applicazioni esistenti, aumentandone la robustezza e la manutenibilità.` },
    ]},
    { label: 'Tools', items: [
      { title: 'Docker & Infra',
        body: `🐳 Docker, Nginx, Linux\n\n**Docker**\nCreazione di immagini, Docker Compose per stack multi-container, volumi, network interni. Usato sia per sviluppo locale che per deploy in produzione su VPS.\n\n**Nginx**\nConfigurazione come reverse proxy per instradare il traffico verso container Docker. Gestione di più servizi sullo stesso host.\n\n**Linux**\nAmministrazione base di server Ubuntu: gestione processi, permessi, firewall (ufw), SSH, shell scripting. Il server è il posto dove tutto finisce — saperlo gestire è fondamentale.\n\n**WireGuard**\nConfigurazione VPN su server personale per rete virtuale domestica sicura.` },
      { title: 'Git & Build',
        body: `🔧 Git, Maven, npm\n\n**Git**\nWorkflow base con branch separati per feature, commit atomici con messaggi chiari, risoluzione conflitti.\n\n**Maven**\nGestione dipendenze e ciclo di build per progetti Spring Boot. POM.xml, profili, plugin.\n\n**npm**\nGestione pacchetti per progetti frontend Angular e JavaScript. Script per automazione task.` },
    ]},
  ]},

  /* ─── JUPITER — Infra & Progetti ─── */
  devops: { tabs: [
    { label: 'Marmitta', items: [
      { title: 'Cos\'è Marmitta',
        body: `😈 Marmitta — CLI launcher per script remoti\n\ngithub.com/manuelpringols/marmitta\n\nMarmitta nasce da un problema reale: gli script Bash sono utilissimi, ma la loro pecca più grande è che devi tenerli sempre con te o ricordare dove li hai messi per poterli runnare.\n\nMarmitta ti permette di sfogliare, visualizzare in anteprima ed eseguire script Bash salvati su repository GitHub — direttamente dal terminale, senza dover clonare nulla.\n\nSi aggancia a qualsiasi repo GitHub. Puoi avere un repo di script di sistema, uno per la cybersecurity, uno per i tool di sviluppo — Marmitta li gestisce tutti con la stessa interfaccia.\n\nLa potenzialità del tool sta tutta nello script finale: può essere di qualsiasi tipo o natura. Marmitta è il launcher, non il limite.\n\nSviluppato con il supporto di Claude (Sonnet 4.6).` },
      { title: 'Come funziona',
        body: `⚙️ Funzionalità principali\n\n📂 Navigazione interattiva a 3 livelli\ncategoria → sottocartella → script, tutto con fzf. Ricerca fuzzy, anteprima del codice prima di eseguire, navigazione con ESC per tornare indietro livello per livello.\n\n📦 Sorgenti multiple\nAggiungi qualsiasi repository GitHub come sorgente. Si passa da un repo all'altro senza riconfigurare nulla.\n\n📜 Cronologia esecuzioni\nRiesegui rapidamente gli ultimi script con ricerca fzf integrata.\n\n🔒 Autenticazione sicura\nIntegrazione con Bitwarden CLI — il GitHub token viene recuperato dal password manager, nessun token in chiaro in nessun file di configurazione.\n\n🔄 Self-update\nmarmitta -u scarica e installa l'ultima versione automaticamente.\n\nInstallazione con una riga:\nsudo curl -fsSL https://raw.githubusercontent.com/manuelpringols/marmitta/master/marmitta.sh -o /usr/local/bin/marmitta && sudo chmod +x /usr/local/bin/marmitta` },
    ]},
    { label: 'Infrastruttura', items: [
      { title: 'VPS — Hetzner & Netcup',
        body: `💻 Server VPS gestiti in autonomia\n\nContratti VPS sottoscritti con Hetzner e Netcup, scelti in base al rapporto risorse/prezzo necessario in quel momento.\n\nSetup tipico:\n• Ubuntu Server come sistema operativo\n• Docker e Docker Compose per i servizi\n• Nginx come reverse proxy\n• UFW per la gestione del firewall\n• SSH con autenticazione a chiave, password SSH disabilitata\n\nHa ospitato la versione precedente di questo sito, un server Jellyfin per streaming multimediale, e vari altri servizi nel tempo.\n\nNon è un'infrastruttura aziendale. È un laboratorio personale che ha insegnato più di qualsiasi corso.` },
      { title: 'WireGuard VPN',
        body: `🔒 Rete virtuale domestica con WireGuard\n\nVPN configurata su server per risolvere un problema pratico: accesso remoto ai dispositivi di casa senza aprire porte sul router.\n\nCome funziona:\n• Il VPS fa da relay/hub\n• Tutti i dispositivi di casa si connettono tramite WireGuard\n• Da fuori mi connetto alla VPN e accedo a tutto come in LAN\n• Nessuna porta esposta, traffico cifrato end-to-end\n\nUn progetto concreto che tocca networking, Linux e sicurezza praticamente insieme.` },
    ]},
    { label: 'Backend', items: [
      { title: 'Spring Boot in produzione',
        body: `⚙️ Backend REST con Spring Boot su infrastruttura reale\n\nStack tipico deployato:\nSpring Boot API + PostgreSQL/MySQL + Nginx reverse proxy, orchestrato con Docker Compose su VPS.\n\n**Sicurezza:**\nJWT con Spring Security 6: login → access + refresh token, validazione su ogni richiesta, protezione endpoint per ruolo, BCrypt per le password.\n\n**Microservizi:**\nEsperienza nella separazione delle responsabilità, comunicazione via REST, gestione delle dipendenze tra container Docker.\n\nL'approccio è sempre stato: funzionante, sicuro, deployabile. Non solo demo locali.` },
      { title: 'Questo Sito',
        body: `🌌 Portfolio — Sistema solare interattivo\n\nStack tecnico:\n• Three.js con shader GLSL custom per il sistema solare 3D\n• Texture NASA/SolarSystemScope 2K per i pianeti\n• anime.js per le animazioni dell'interfaccia\n• CSS3 con effetti olografici e cursore custom contestuale\n• Hostato su GitHub Pages\n\nCaratteristiche:\n• 6 pianeti con texture reali + shader procedurali sovrapposti\n• Via Lattea con 80.000 stelle a bracci spirali e nebulose\n• Sistema zoom/focus su pianeta con blocco orbita\n• Pannelli CV con navigazione a tab e text scramble effect\n• Responsive mobile con bottom sheet\n\nSviluppato in collaborazione con Claude (Sonnet 4.6). C'è una sezione dedicata che spiega il metodo — esplora il sistema solare per trovarla.` },
    ]},
  ]},

  /* ─── MERCURY — Contatti ─── */
  contatti: { tabs: [
    { label: 'Contatti', items: [
      { title: 'Email',
        body: `📧 manuelpringols@gmail.com\n\nIl modo più diretto per contattarmi.\n\nRispondo a tutte le proposte serie entro 24–48 ore lavorative.\n\nPer cosa puoi scrivermi:\n• Opportunità lavorative in ambito sviluppo o cybersecurity\n• Collaborazioni su progetti tecnici\n• Confronto su tecnologie o percorsi formativi\n\nSe hai una proposta concreta, descrivi il contesto — rispondo meglio quando so cosa c'è dall'altra parte.` },
      { title: 'LinkedIn',
        body: `💼 linkedin.com/in/manuelpringols\n\nIl profilo LinkedIn è il riferimento principale per il percorso professionale.\n\nTroverai:\n• Esperienza lavorativa aggiornata (Convergr/Accenture, Acciai Inox)\n• Certificazione Java Oracle verificata\n• Formazione e percorso\n\nSono aperto a:\n✅ Ruoli junior/mid in sviluppo backend (Java, Spring Boot)\n✅ Opportunità in ambito cybersecurity (anche entry-level)\n✅ Contesti di consulenza o progetti su ServiceNow\n✅ Networking con professionisti del settore` },
    ]},
    { label: 'Disponibilità', items: [
      { title: 'Cosa cerco',
        body: `🎯 Direzione professionale\n\nNel breve termine sono impegnato nell'esperienza in corso con Convergr/Accenture su ServiceNow, che sto portando avanti con impegno.\n\nNel medio termine, la direzione che voglio prendere è la cybersecurity — in particolare il penetration testing. Il primo passo concreto è la certificazione eJPT.\n\nSono interessato a:\n• Ruoli che toccano sicurezza applicativa o di rete\n• Contesti dove si lavora con Linux, networking e automazione\n• Ambienti dove la curiosità tecnica è considerata un valore, non solo le certificazioni` },
      { title: 'Modalità di lavoro',
        body: `📋 Come preferisco lavorare\n\n**Modalità:**\n• remote: ok\n• On-site: valutabile in base alla location\n\n**Cosa porto:**\n• Capacità di lavorare in autonomia su problemi che non ho mai visto prima\n• Approccio pratico e orientato al risultato\n• Nessun problema con ambienti ad alto ritmo — vengo da cinque anni in fabbrica\n\n**Cosa mi aspetto:**\n• Problemi reali, non esercizi\n• Feedback tecnico utile\n• Spazio per crescere in direzione security` },
    ]},
    { label: 'Note', items: [
      { title: 'Sul Portfolio',
        body: `ℹ️ Una nota su questo sito\n\nQuesto portfolio non è stato costruito con un template. È stato sviluppato con Three.js, GLSL, CSS3 e anime.js — tutto da zero.\n\nC'è una sezione dedicata che spiega come è stato costruito, le tecnologie usate e il ruolo dell'AI generativa nel processo. Esplora il sistema solare — non puoi perderti.` },
      
    ]},
  ]},

};