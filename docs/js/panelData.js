/**
 * panelData.js — Contenuto ricco per ogni pannello pianeta.
 * Struttura: 3 tab per sezione → sub-item → dettaglio testuale.
 */
export const PANEL_DATA = {

  /* ─── EARTH — Chi Sono ─── */
  chisono: { tabs: [
    { label: 'Profilo', items: [
      { title: 'Chi Sono',
        body: `Sono Manuel Cerqua, un professionista giovane e motivato con esperienza nel settore industriale e una forte passione per la tecnologia e lo sviluppo software.\n\nHo imparato che la disciplina tecnica, la precisione e la capacità di lavorare sotto pressione non sono esclusive del mondo industriale: sono qualità universali che porto con me ogni giorno, sia davanti a un tornio CNC che davanti a un editor di codice.\n\nMi impegno a migliorarmi continuamente, acquisendo nuove competenze e affrontando nuove sfide con entusiasmo e metodo.` },
      { title: 'La Mia Storia',
        body: `Ho iniziato il mio percorso professionale nel mondo industriale presso Acciai Inox Srl, dove ho sviluppato disciplina, attenzione al dettaglio e capacità di problem-solving in ambienti ad alta precisione.\n\nParallelamente, ho coltivato la passione per la tecnologia attraverso studi autonomi e certificazioni formali — culminati nella Certificazione Java Oracle Foundations Associate.\n\nOggi mi trovo in una fase di transizione consapevole verso il mondo dello sviluppo software, portando con me un bagaglio di esperienza pratica che pochi junior developer possono vantare.` },
    ]},
    { label: 'Approccio', items: [
      { title: 'Metodo di Lavoro',
        body: `La mia formazione industriale mi ha insegnato che la qualità non è negoziabile. Nel software applico lo stesso principio: preferisco fare bene piuttosto che fare in fretta.\n\nApproccio ogni progetto con rigore: analisi dei requisiti, architettura chiara, codice pulito e testabile. Non mi spaventa la complessità — la scompongo in parti gestibili e la affronto sistematicamente.\n\nSono abituato a lavorare con specifiche tecniche precise e a rispettare gli standard di qualità, competenze formate anni di lavoro su macchinari CNC dove ogni decimo di millimetro conta.` },
      { title: 'Crescita Continua',
        body: `La tecnologia evolve rapidamente e considero l'apprendimento continuo una responsabilità professionale, non un optional.\n\nSono abituato allo studio autonomo: ho approfondito Spring Boot, Angular, Docker e Linux prevalentemente attraverso documentazione ufficiale, progetti pratici e sperimentazione diretta.\n\nL'approccio pratico è il mio preferito — imparare facendo, sbagliare, capire l'errore, correggere. Questo ciclo di feedback accelera la crescita molto più della teoria pura.` },
    ]},
    { label: 'Obiettivi', items: [
      { title: 'Sviluppo Professionale',
        body: `Il mio obiettivo a breve termine è consolidarmi come sviluppatore backend con Spring Boot, approfondendo architetture REST, sicurezza delle applicazioni e integrazione con database relazionali.\n\nA medio termine, voglio acquisire competenze cloud (AWS o GCP) e padroneggiare le pratiche CI/CD per gestire pipeline di deploy automatizzate.\n\nPunto a lavorare in team agili e multidisciplinari, dove la collaborazione e il confronto continuo accelerano sia la crescita del prodotto che quella individuale.` },
      { title: 'Visione',
        body: `Credo che la combinazione tra esperienza industriale e competenze digitali sia un valore raro e concreto.\n\nCapire i processi produttivi dall'interno, conoscere le esigenze operative di chi lavora in fabbrica, e saper tradurre tutto questo in software funzionale: questa è la direzione che voglio percorrere.\n\nL'obiettivo finale è contribuire a costruire strumenti digitali che migliorino davvero il lavoro delle persone — non funzionalità per il portfolio, ma soluzioni per problemi reali.` },
    ]},
  ]},

  /* ─── MARS — Esperienze ─── */
  esperienze: { tabs: [
    { label: 'Ruolo CNC', items: [
      { title: 'Operaio Specializzato CNC',
        body: `📍 Acciai Inox Srl — Giugliano (NA)\n⏱ 2019 – presente\n\nProgrammazione e utilizzo di macchine CNC per la lavorazione dell'acciaio inox a partire da disegni tecnici. Gestione dell'intero ciclo produttivo: dalla lettura del disegno tecnico, alla programmazione ISO, al controllo qualità del pezzo finito.\n\nResponsabilità principali:\n• Programmazione G-code per centri di lavoro a 3 e 4 assi\n• Setup macchina, cambio utensili e calibrazione\n• Controllo dimensionale con strumentazione di misura di precisione\n• Gestione delle non conformità e report di produzione` },
      { title: 'Competenze Acquisite',
        body: `Cinque anni di lavoro in ambiente industriale ad alta precisione hanno formato competenze trasversali di grande valore:\n\n🔧 Tecniche\n• Lettura ed interpretazione di disegni tecnici 2D e 3D\n• Programmazione CNC manuale e CAM-assistita\n• Metrologia e controllo qualità (calibri, micrometri, comparatori)\n• Conoscenza delle proprietà dell'acciaio inox e dei materiali da lavorazione\n\n🧠 Trasversali\n• Problem solving sotto pressione produttiva\n• Attenzione maniacale al dettaglio\n• Rispetto delle specifiche tecniche e delle tolleranze\n• Lavoro in squadra in ambiente strutturato` },
    ]},
    { label: 'Dev Software', items: [
      { title: 'Progetti Personali',
        body: `Parallelamente all'attività lavorativa principale, ho sviluppato e deployato applicazioni web complete:\n\n🌐 Portfolio personale (questo sito)\nSistema solare 3D interattivo con Three.js, shader GLSL custom, texture NASA, animazioni con anime.js. Hostato su GitHub Pages.\n\n⚙️ API REST con Spring Boot\nBackend per gestione dati con autenticazione JWT, Spring Security, Spring Data JPA. Database PostgreSQL, deploy su VPS Hetzner con Docker Compose.\n\n🔵 Frontend Angular\nSingle Page Application con Angular, interfacce reattive, integrazione con REST API, gestione state e routing.` },
      { title: 'Stack Tecnologico',
        body: `Il mio stack di riferimento per lo sviluppo:\n\n📦 Backend\nJava 17+ con Spring Boot — il mio framework principale. REST API, Spring Security per autenticazione/autorizzazione, Spring Data JPA per l'accesso ai dati.\n\n🎨 Frontend\nJavaScript/TypeScript con Angular. HTML5 semantico, CSS3 avanzato, Three.js per grafica 3D WebGL.\n\n🗃 Database\nMySQL e PostgreSQL — progettazione dello schema, query ottimizzate, integrazione ORM con Hibernate.\n\n🐳 DevOps\nDocker e Docker Compose per containerizzazione. Deploy su Hetzner VPS con Linux. Git per version control.` },
    ]},
    { label: 'Risultati', items: [
      { title: 'Traguardi Raggiunti',
        body: `Certificazioni e riconoscimenti formali del percorso:\n\n📜 Java Foundations Associate (Oracle)\nCertificazione ufficiale Oracle che attesta la padronanza dei fondamentali del linguaggio Java: OOP, collections, gestione delle eccezioni, I/O, concorrenza di base.\n\n🎓 Diploma di Perito Industriale\nITS Galvani, Giugliano (NA) — 2015/2020. Indirizzo meccanico con approfondimento di informatica industriale, disegno tecnico CAD, sistemi automatici.\n\n🚀 Deploy in produzione\nApplicazioni reali attive e raggiungibili pubblicamente — non solo progetti locali o demo, ma software funzionante servito da infrastruttura reale.` },
      { title: 'Valore Differenziale',
        body: `Cosa mi distingue rispetto ad altri profili junior:\n\n🏭 Esperienza industriale reale\nNon arrivo dal solo studio accademico. Ho lavorato in ambiente produttivo per anni, con la pressione di ordini, scadenze e standard qualitativi stringenti. Questa mentalità si trasferisce direttamente nel codice.\n\n🔗 Ponte tra mondi\nCapisco sia il linguaggio tecnico del software che quello dell'industria manifatturiera. Posso comunicare efficacemente con chi lavora in produzione e con chi sviluppa i sistemi digitali.\n\n⚡ Autodidatta strutturato\nHo imparato stack complessi in modo autonomo e ho portato i progetti fino al deploy. Non mi fermo alla teoria.` },
    ]},
  ]},

  /* ─── SATURN — Istruzione ─── */
  istruzione: { tabs: [
    { label: 'Diploma', items: [
      { title: 'Perito Industriale',
        body: `🏫 ITS Galvani — Giugliano (NA)\n📅 2015 – 2020\n\nDiploma di Perito Industriale ad indirizzo Meccanico con approfondimenti in automazione e informatica industriale.\n\nMaterie principali:\n• Meccanica, macchine ed energia\n• Sistemi e automazione\n• Tecnologie meccaniche di processo e di prodotto\n• Disegno, progettazione e organizzazione industriale\n• Informatica applicata ai processi industriali\n• Matematica e fisica applicata\n\nIl percorso ha fornito una base solida di pensiero tecnico-ingegneristico, capacità di lettura di documentazione tecnica e familiarità con i sistemi automatizzati.` },
      { title: 'Competenze Chiave',
        body: `Il diploma ha sviluppato competenze sia tecniche che metodologiche:\n\n📐 Disegno Tecnico\nLettura e produzione di disegni tecnici 2D (ISO) e introduzione al CAD 3D. Tolleranze dimensionali e geometriche, quotatura e simbologia normalizzata.\n\n⚙️ Automazione\nSistemi di controllo automatico, logica PLC di base, sensori e attuatori industriali. Comprensione dei cicli di lavoro automatizzati.\n\n💻 Informatica Industriale\nProgrammazione di base, reti industriali, introduzione ai sistemi SCADA. Fondamentali che hanno poi guidato l'interesse verso il software development.` },
    ]},
    { label: 'Certificazioni', items: [
      { title: 'Java Foundations Associate',
        body: `📜 Oracle Certified — Java Foundations Associate\n\nCertificazione ufficiale Oracle che attesta la padronanza dei fondamentali del linguaggio Java.\n\nArgomenti coperti:\n• Programmazione orientata agli oggetti (classi, interfacce, ereditarietà, polimorfismo)\n• Java Collections Framework (List, Map, Set)\n• Gestione delle eccezioni e error handling\n• Stream API e lambda expressions\n• I/O e serializzazione\n• Concorrenza di base (Thread, Runnable)\n• Principi SOLID e design pattern fondamentali\n\nLa certificazione ha rappresentato il momento formale di validazione di un percorso di studio autonomo durato oltre un anno.` },
      { title: 'Formazione Continua',
        body: `Oltre alle certificazioni formali, percorso di apprendimento strutturato e documentato:\n\n☕ Java & Spring Ecosystem\nSpring Framework Core, Spring Boot 3, Spring Security 6 (JWT, OAuth2), Spring Data JPA, Hibernate. Studio da documentazione ufficiale Spring.io e Baeldung.\n\n🐳 Docker & DevOps\nDocumentazione ufficiale Docker, gestione di container multi-servizio con Docker Compose, networking Docker, volumi e persistenza dati.\n\n🐧 Linux Administration\nComandi shell essenziali, gestione dei processi, configurazione di server Ubuntu, firewall (ufw), nginx come reverse proxy.\n\n🔵 Angular & TypeScript\nDall'introduzione alla certificazione di base Google — componenti, servizi, routing, HTTP client, Reactive Forms.` },
    ]},
    { label: 'Self-Learning', items: [
      { title: 'Metodo di Studio',
        body: `Il metodo che ha reso efficace l'apprendimento autonomo:\n\n📚 Documentazione Ufficiale Prima\nSempre dalla fonte primaria — Spring.io, Oracle Docs, Angular.io, Docker Docs. Evitare il codice copiato senza capire.\n\n🛠 Progetto Parallelo\nOgni concetto studiato viene immediatamente applicato in un progetto reale. Teoria senza pratica non si consolida.\n\n🐛 Debug Come Palestra\nGli errori sono opportunità di apprendimento. Quando qualcosa non funziona, prima cerco di capire perché prima di cercare la soluzione online.\n\n📝 Note Strutturate\nDocumentazione personale di ciò che imparo — schemi, snippet funzionanti, pattern ricorrenti. Costruire una base di conoscenza personale e consultabile.` },
      { title: 'Roadmap Attuale',
        body: `Il piano di apprendimento in corso e i prossimi step:\n\n✅ Completati\n• Java + Spring Boot ecosystem completo\n• Docker e containerizzazione\n• PostgreSQL e MySQL avanzato\n• Angular + TypeScript\n• Linux server management\n• Git workflow (branching, PR, rebase)\n\n🔄 In corso\n• Three.js e WebGL / GLSL shaders\n• Testing con JUnit 5 e Mockito\n• Spring Boot Testing (MockMvc, @SpringBootTest)\n\n🎯 Prossimi\n• Kubernetes (orchestrazione container)\n• Cloud provider (AWS o GCP)\n• CI/CD con GitHub Actions\n• Architetture microservizi` },
    ]},
  ]},

  /* ─── NEPTUNE — Competenze ─── */
  competenze: { tabs: [
    { label: 'Linguaggi', items: [
      { title: 'Java',
        body: `☕ Java — Linguaggio principale\n\nJava è il mio linguaggio di riferimento per lo sviluppo backend. Ho una solida padronanza di:\n\n• OOP avanzata: classi astratte, interfacce funzionali, design pattern (Builder, Factory, Strategy, Repository)\n• Generics e type safety\n• Java Collections Framework: List, Map, Set, Queue — scelta consapevole in base al caso d'uso\n• Stream API: operazioni funzionali su collezioni (filter, map, reduce, collect)\n• Lambda expressions e method references\n• Optional per gestione null-safe\n• Exception handling strutturato (checked vs unchecked)\n• Concorrenza di base: Thread, Runnable, ExecutorService\n\nCertificazione Oracle Foundations Associate ottenuta.` },
      { title: 'JavaScript & Web',
        body: `🌐 JavaScript / TypeScript / HTML / CSS\n\n**JavaScript (ES2020+)**\nDOM manipulation, event handling, Promise e async/await, fetch API, closure, prototype chain. Uso sia lato frontend (Angular) che per scripting.\n\n**TypeScript**\nTipi statici, interfacce, generics, decoratori. Usato in tutti i progetti Angular.\n\n**HTML5**\nMarkup semantico, accessibilità di base (ARIA), Canvas API, Web Components. Template HTML in Angular.\n\n**CSS3**\nFlexbox, Grid, custom properties (variabili CSS), animazioni keyframe, media queries, pseudo-elementi. Conoscenza di BEM per organizzazione.\n\n**Three.js / GLSL**\nRenderizzazione 3D WebGL, shader custom (vertex + fragment), geometrie procedurali, post-processing.` },
      { title: 'SQL',
        body: `🗃 SQL — Interrogazione e Progettazione Database\n\nConoscenza solida di SQL standard con specializzazione su MySQL e PostgreSQL:\n\n**DDL (Definizione)**\nCREATE TABLE con vincoli (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, NOT NULL), indici, tipi di dato appropriati.\n\n**DML (Manipolazione)**\nSELECT complesse con JOIN multipli (INNER, LEFT, RIGHT, FULL), subquery correlate e non, GROUP BY con HAVING, window functions di base.\n\n**Ottimizzazione**\nAnalisi EXPLAIN, creazione di indici strategici, evitare N+1 queries, caching a livello applicativo.\n\n**Integrazione ORM**\nMapping entità JPA con Hibernate, relazioni @OneToMany / @ManyToMany, lazy vs eager loading, JPQL e Query native.` },
    ]},
    { label: 'Framework', items: [
      { title: 'Spring Boot',
        body: `🍃 Spring Boot — Framework Backend Principale\n\n**Spring MVC / REST**\n@RestController, @RequestMapping, @PathVariable, @RequestBody, @Valid per validazione. Gestione centralizzata errori con @ControllerAdvice.\n\n**Spring Security**\nAutenticazione con JWT (generazione, validazione, refresh token), BCrypt password hashing, protezione endpoint con @PreAuthorize, CORS configuration.\n\n**Spring Data JPA**\nRepository pattern, query derivate da nome metodo, @Query custom JPQL e native SQL, paginazione con Pageable, transazioni con @Transactional.\n\n**Spring Boot Features**\nApplication properties / YAML, profili (dev/prod), Actuator per monitoring, auto-configuration, dependency injection con @Autowired e constructor injection.` },
      { title: 'Angular',
        body: `🔺 Angular — Framework Frontend\n\n**Architettura**\nModuli, componenti standalone (Angular 16+), servizi con dependency injection, lazy loading dei moduli per performance.\n\n**Template & Binding**\nInterpolazione, property binding, event binding, two-way binding con ngModel, structural directives (*ngIf, *ngFor, *ngSwitch).\n\n**State Management**\nServizi con BehaviorSubject (RxJS) per stato condiviso, comunicazione componente-padre con @Input/@Output.\n\n**HTTP & Routing**\nHttpClient con interceptors (per aggiunta JWT header), gestione errori con catchError, RouterModule con guardie di navigazione (CanActivate).\n\n**Forms**\nReactive Forms con FormGroup/FormControl, validatori custom, gestione asincrona degli errori.` },
    ]},
    { label: 'Tools & DB', items: [
      { title: 'Database',
        body: `🗄 MySQL & PostgreSQL\n\n**MySQL**\nDatabase usato prevalentemente per progetti con Docker Compose. Configurazione character set UTF-8, timezone, max_connections. Backup e restore con mysqldump.\n\n**PostgreSQL**\nPreferito per progetti in produzione per la maggiore conformità SQL standard e le funzionalità avanzate: JSONB per dati semi-strutturati, array types, full-text search nativo.\n\n**In entrambi:**\n• Progettazione schema normalizzato (3NF)\n• Stored procedure e funzioni\n• Trigger di base\n• Gestione transazioni (ACID)\n• Connection pooling con HikariCP (via Spring)` },
      { title: 'Git & Build Tools',
        body: `🔧 Strumenti di Sviluppo\n\n**Git**\nFlusso di lavoro con branch strategici (main, develop, feature/*, hotfix/*). Commit atomici con messaggi descrittivi (Conventional Commits). Rebase interattivo, cherry-pick, risoluzione conflitti.\n\n**Maven**\nGestione dipendenze con POM.xml, ciclo di vita build (clean, compile, test, package, install). Plugin Maven per Docker, code coverage, generazione documentazione.\n\n**npm**\nGestione pacchetti Node.js per frontend Angular e progetti JavaScript. Script npm per automazione task, gestione dipendenze dev vs production.\n\n**IDE**\nIntelliJ IDEA per Java/Spring, VS Code per frontend e scripting. Conoscenza dei principali plugin e shortcut per produttività.` },
    ]},
  ]},

  /* ─── JUPITER — DevOps & Backend ─── */
  devops: { tabs: [
    { label: 'Docker', items: [
      { title: 'Containerizzazione',
        body: `🐳 Docker — Containerizzazione Completa\n\nHo acquisito una padronanza pratica di Docker attraverso progetti reali deployati in produzione:\n\n**Dockerfile**\nCreazione di immagini ottimizzate per Java (multi-stage build per ridurre dimensioni), configurazione variabili d'ambiente, healthcheck, utente non-root per sicurezza.\n\n**Docker Compose**\nOrchestrazione di stack multi-container: Spring Boot API + PostgreSQL + Nginx reverse proxy in un unico file compose. Gestione network interni, volumi persistenti, dipendenze tra servizi (depends_on + healthcheck).\n\n**Best Practices**\n• Immagini minimali (distroless o alpine)\n• .dockerignore per escludere file non necessari\n• Variabili d'ambiente per configurazione (12-factor app)\n• Separazione environment dev/staging/prod` },
      { title: 'Registry & CI',
        body: `📦 Gestione Immagini e Pipeline\n\n**Docker Hub / GitHub Container Registry**\nPubblicazione di immagini Docker con tag semantici (latest, v1.0.0, sha-XXXXXXX). Automazione build con GitHub Actions.\n\n**Pipeline di Build**\nWorkflow GitHub Actions per:\n1. Test automatici con Maven\n2. Build immagine Docker\n3. Push su registry\n4. Deploy su server di produzione via SSH\n\n**Networking Docker**\nCreazione di network custom per isolamento servizi, configurazione DNS interno tra container, esposizione selettiva di porte solo dove necessario.` },
    ]},
    { label: 'Backend', items: [
      { title: 'REST API',
        body: `⚙️ Sviluppo API REST con Spring Boot\n\nProgettazione e implementazione di API RESTful seguendo le best practice:\n\n**Design**\n• Naming delle risorse con sostantivi plurali (/api/users, /api/orders)\n• HTTP verbs corretti (GET, POST, PUT, PATCH, DELETE)\n• Status code appropriati (200, 201, 400, 401, 403, 404, 409, 500)\n• Versioning API con path prefix (/api/v1/)\n• Pagination con Pageable e response envelope\n\n**Sicurezza**\n• Spring Security 6 con JWT bearer token\n• Refresh token con rotation e revoca\n• Rate limiting per prevenire abuse\n• Input validation con Bean Validation (@NotNull, @Size, @Pattern)\n• CORS configurato per domini specifici\n\n**Documentazione**\nOpenAPI 3 con Springdoc, interfaccia Swagger UI per testing interattivo.` },
      { title: 'Spring Security',
        body: `🔒 Sicurezza Applicativa\n\n**Autenticazione JWT**\n1. Login → verifica credenziali → generazione access token (15min) + refresh token (7gg)\n2. Ogni request → verifica firma JWT → estrazione claims → popolamento SecurityContext\n3. Refresh → verifica refresh token → rotazione → nuova coppia di token\n\n**Autorizzazione**\nRole-based access control (RBAC) con @PreAuthorize("hasRole('ADMIN')"), method-level security, protezione endpoint per pattern URL.\n\n**Password Security**\nBCrypt con cost factor configurabile, policy di complessità, prevenzione timing attacks nella verifica.\n\n**OWASP Top 10**\nAttenzione a SQL injection (PreparedStatement / JPA), XSS (output encoding), CSRF (token o SameSite cookies), IDOR (controllo ownership risorse).` },
    ]},
    { label: 'Infrastructure', items: [
      { title: 'Hetzner VPS',
        body: `🖥 Server Management su Hetzner Cloud\n\nGestione autonoma di server VPS in produzione:\n\n**Setup Iniziale**\n• Ubuntu Server 22.04 LTS — installazione e hardening\n• Creazione utente non-root con sudo, disabilitazione root SSH\n• Autenticazione SSH con chiavi RSA (password SSH disabilitata)\n• Firewall UFW: whitelist delle sole porte necessarie (22, 80, 443)\n\n**Stack di Produzione**\n• Nginx come reverse proxy (HTTPS termination, routing a Docker)\n• Certbot + Let's Encrypt per certificati SSL automatici\n• Docker Compose per orchestrazione applicazione\n• Systemd service per avvio automatico Docker Compose al riavvio\n\n**Monitoring**\nLog aggregation con Docker logging driver, alert via webhook su eventi critici.` },
      { title: 'Linux & Deploy',
        body: `🐧 Linux Administration & Deploy Pipeline\n\n**Comandi Essenziali**\nGestione processi (ps, top, htop, kill), file system (find, grep, awk, sed), networking (netstat, ss, curl, wget), permessi (chmod, chown, umask).\n\n**Deploy Workflow**\n1. Push su main → GitHub Actions si attiva\n2. Build e test → build immagine Docker\n3. Push immagine su registry\n4. SSH sul server → docker compose pull\n5. docker compose up -d --force-recreate\n6. Health check → rollback automatico se fallisce\n\n**Backup Strategy**\nBackup notturno del database PostgreSQL con pg_dump, rotazione automatica con retention 30 giorni, upload su storage S3-compatible Hetzner Object Storage.` },
    ]},
  ]},

  /* ─── MERCURY — Contatti ─── */
  contatti: { tabs: [
    { label: 'LinkedIn', items: [
      { title: 'Profilo LinkedIn',
        body: `💼 LinkedIn — Rete Professionale\n\nmanuelpringols.info\n\nIl profilo LinkedIn è il punto di riferimento principale per opportunità professionali.\n\nTroverai:\n• Esperienza lavorativa dettagliata con Acciai Inox Srl\n• Certificazione Java Oracle verificata\n• Skills endorsate dalla rete di contatti\n• Formazione e percorso educativo\n• Articoli e aggiornamenti sul percorso di crescita\n\nSono aperto a:\n✅ Opportunità di sviluppo backend (Java / Spring Boot)\n✅ Ruoli junior-mid full-stack\n✅ Collaborazioni su progetti open source\n✅ Networking con professionisti del settore\n\n👉 linkedin.com/in/manuelpringols` },
      { title: 'Disponibilità',
        body: `📅 Disponibilità e Modalità di Lavoro\n\n**Tipo di Contratto**\nPreferenza per contratto a tempo indeterminato o determinato con prospettiva di stabilizzazione. Aperto anche a collaborazioni per progetti specifici.\n\n**Modalità**\n• Remote: ✅ Disponibile (setup professionale da casa)\n• Ibrido: ✅ Preferito per team building e collaborazione\n• On-site: ✅ Valutabile in base alla location (zona Napoli / Campania preferita)\n\n**Settori di Interesse**\n🏭 Software per industria manifatturiera\n💰 FinTech e applicazioni business-critical\n🏥 HealthTech / sistemi gestionali\n🛒 E-commerce e piattaforme digitali\n\n**Risposta Garantita**\nRispondo a tutte le proposte entro 24-48 ore lavorative.` },
    ]},
    { label: 'Portfolio', items: [
      { title: 'Sito Web',
        body: `🌐 manuelpringols.info\n\nIl portfolio è il progetto più rappresentativo delle mie competenze attuali — costruito da zero, senza template.\n\n**Stack Tecnico**\n• Three.js con shader GLSL custom per il sistema solare 3D\n• Texture NASA/SolarSystemScope (2K) per fotorealismo planetario\n• anime.js per animazioni fluide dell'interfaccia\n• CSS3 avanzato con effetti olografici\n• Hostato su GitHub Pages (CI/CD automatico)\n\n**Features Implementate**\n• 6 pianeti con texture reali + effetti procedurali sovrapposti\n• Via Lattea e nebulose stile Hubble\n• Sistema di zoom/focus con blocco orbita\n• Pannelli CV interattivi con navigazione a tab\n• Responsive mobile-first\n• Performance ottimizzate (eliminazione flickering, LOD)\n\n🔗 github.com/manuelpringols/SitoCurriculumV2` },
      { title: 'GitHub',
        body: `💻 GitHub — Codice Pubblico\n\ngithub.com/manuelpringols\n\nRepository pubblici che mostrano il mio approccio allo sviluppo:\n\n📁 SitoCurriculumV2\nQuesto portfolio — Three.js, GLSL, CSS3, animazioni. Il commit history mostra il processo iterativo di sviluppo.\n\nCosa trovi nei miei repository:\n• Codice commentato in italiano/inglese\n• README dettagliati con istruzioni di setup\n• .gitignore corretti, no secrets committati\n• Commit atomici con messaggi significativi\n• Branch strategy (main + feature branches)\n\nI progetti backend con Spring Boot sono su repository privati per ragioni di sicurezza (credenziali, configurazioni server), ma posso condividere il codice su richiesta in fase di colloquio.` },
    ]},
    { label: 'Contatti', items: [
      { title: 'Email & Telefono',
        body: `📬 Contatti Diretti\n\n📧 Email\nmanuelpringols@gmail.com\n\nPer proposte di lavoro, collaborazioni o semplicemente per entrare in contatto. Rispondo entro 24-48 ore lavorative.\n\n📱 Telefono\n+39 347 4895 348\n\nDisponibile per chiamate e WhatsApp. Orari preferiti: lunedì-venerdì 9:00-18:00.\n\n📍 Location\nGiugliano in Campania (NA), Campania — Italia\nDisponibile a trasferte e relocation per opportunità di particolare interesse.\n\n🤝 Come Preferisco Essere Contattato\n1. LinkedIn (per primo contatto professionale)\n2. Email (per proposte dettagliate)\n3. Telefono/WhatsApp (per follow-up e coordinamento)` },
      { title: 'Lavoriamo Insieme',
        body: `🚀 Parliamoci\n\nSe sei arrivato fin qui, probabilmente hai già un'idea di chi sono e cosa so fare. Ecco cosa posso offrirti:\n\n💡 Cosa Porto\n• Sviluppo backend Java/Spring Boot solido e documentato\n• Capacità di gestire autonomamente un progetto dal setup al deploy\n• Mentalità industriale: precisione, rispetto delle specifiche, problem solving\n• Disponibilità ad imparare tecnologie nuove rapidamente\n• Comunicazione chiara e feedback proattivo\n\n🎯 Cosa Cerco\n• Un team da cui imparare e a cui contribuire\n• Progetti con impatto reale, non esercizi accademici\n• Un ambiente che valorizzi la crescita e la qualità del codice\n• Feedback costruttivo e code review strutturata\n\nSe tutto questo ti suona bene — scrivimi. Sarò felice di raccontarti di più.` },
    ]},
  ]},
};