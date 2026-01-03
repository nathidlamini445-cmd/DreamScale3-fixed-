// Translation system for DreamScale
// Supports: English (en), French (fr), German (de), Spanish (es)

export type Language = 'en' | 'fr' | 'de' | 'es'

export interface Translations {
  // Common UI
  common: {
    welcome: string
    welcomeBack: string
    welcomeTo: string
    whatAreWeCreatingToday: string
    next: string
    back: string
    done: string
    save: string
    cancel: string
    close: string
    edit: string
    delete: string
    search: string
    filter: string
    loading: string
    error: string
    success: string
    yes: string
    no: string
  }
  
  // Navigation
  nav: {
    home: string
    discover: string
    bizoraAI: string
    systems: string
    revenue: string
    leadership: string
    teams: string
    competitorIntelligence: string
    calendar: string
    projects: string
    hypeos: string
  }
  
  // Home Page
  home: {
    sessionActive: string
    howAreYouFeelingToday: string
    helpUsUnderstand: string
    quickCheckIn: string
    answerQuestions: string
    jumpBackIn: string
  }
  
  // Moods
  moods: {
    motivated: string
    excited: string
    energized: string
    demotivated: string
    tired: string
    overwhelmed: string
    stressed: string
    anxious: string
    uncertain: string
    confident: string
    focused: string
    determined: string
    neutral: string
    balanced: string
    calm: string
  }
  
  // Onboarding
  onboarding: {
    welcomeToDreamScale: string
    excitedToHelp: string
    letsGetStarted: string
    whatIsYourBusinessName: string
    whatIndustry: string
    whatStage: string
    whatIsYourRevenueGoal: string
    whoIsYourTargetMarket: string
    whatIsYourTeamSize: string
    whatAreYourChallenges: string
    whatIsYourPrimaryRevenue: string
    howDoYouAcquireCustomers: string
    whatIsYourMRR: string
    whatMetricsDoYouTrack: string
    whatIsYourGrowthStrategy: string
    whatIsYourBiggestGoal: string
    whatAreYourHobbies: string
    whatIsYourFavoriteSong: string
    whatShouldWeCallYou: string
    reviewYourAnswers: string
    pleaseReview: string
    question: string
    of: string
    step: string
    selectAnOption: string
    typeYourAnswer: string
    pleaseSpecify: string
    imagesNotOurProperty: string
  }
  
  // Discover Page
  discover: {
    discoverCreativity: string
    exploreVideos: string
    recommendedForYou: string
    moreInspiringTalks: string
    businessLegends: string
    successStories: string
    watch: string
    views: string
    playNow: string
    yourProgress: string
    videosAvailable: string
    savedVideos: string
    storiesExplored: string
    completionRate: string
    refreshRecommendations: string
    contentTailored: string
    basedOnCheckIn: string
  }
  
  // Settings
  settings: {
    account: string
    preferences: string
    notifications: string
    connections: string
    general: string
    people: string
    teamspaces: string
    upgradePlan: string
    language: string
    changeLanguage: string
    appearance: string
    languageAndTime: string
    startWeekOnMonday: string
    setTimezoneAutomatically: string
    timezone: string
    desktopApp: string
    openLinksInDesktop: string
    openOnStart: string
    manageAccount: string
    usersName: string
    usersEmail: string
    customizeAppearance: string
    light: string
    dark: string
    useSystemSetting: string
    topPageInSidebar: string
    lastVisitedPage: string
    home: string
  }
  
  // Quick Actions
  quickActions: {
    quickActions: string
    createProject: string
    scheduleMeeting: string
    addTask: string
    viewCalendar: string
  }
  
  // Personalized Guidance
  guidance: {
    yourJourney: string
    whatToDoNext: string
    personalizedRoadmap: string
    successTips: string
    tailoredForYou: string
    ideaStageFocus: string
    foundationStageFocus: string
    readyToScale: string
    simplifyAndPrioritize: string
    smallStepsForward: string
    focusOnFirst: string
    moreStepsAvailable: string
  }
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      welcome: 'Welcome',
      welcomeBack: 'Welcome back',
      welcomeTo: 'Welcome to',
      whatAreWeCreatingToday: "What are we creating today?",
      next: 'Next',
      back: 'Back',
      done: 'Done',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      yes: 'Yes',
      no: 'No'
    },
    nav: {
      home: 'Home',
      discover: 'Discover',
      bizoraAI: 'Bizora AI',
      systems: 'Systems',
      revenue: 'Revenue',
      leadership: 'Leadership',
      teams: 'Teams',
      competitorIntelligence: 'Competitor Intelligence',
      calendar: 'Calendar',
      projects: 'Projects',
      hypeos: 'HypeOS'
    },
    home: {
      sessionActive: 'Session Active',
      howAreYouFeelingToday: "How are you feeling today?",
      helpUsUnderstand: "Help us understand your current state so we can provide personalized guidance",
      quickCheckIn: 'Quick Check-In',
      answerQuestions: 'Answer Questions',
      jumpBackIn: 'Jump back in'
    },
    moods: {
      motivated: 'Motivated',
      excited: 'Excited',
      energized: 'Energized',
      demotivated: 'Demotivated',
      tired: 'Tired',
      overwhelmed: 'Overwhelmed',
      stressed: 'Stressed',
      anxious: 'Anxious',
      uncertain: 'Uncertain',
      confident: 'Confident',
      focused: 'Focused',
      determined: 'Determined',
      neutral: 'Neutral',
      balanced: 'Balanced',
      calm: 'Calm'
    },
    onboarding: {
      welcomeToDreamScale: 'Welcome to DreamScale',
      excitedToHelp: "We're excited to help you build, scale, and grow your business. Let's get started by learning more about your entrepreneurial journey.",
      letsGetStarted: "Let's get started",
      whatIsYourBusinessName: 'What is your business name?',
      whatIndustry: 'What industry are you in?',
      whatStage: 'What stage is your business at?',
      whatIsYourRevenueGoal: 'What is your revenue goal for this year?',
      whoIsYourTargetMarket: 'Who is your target market?',
      whatIsYourTeamSize: 'What is your current team size?',
      whatAreYourChallenges: 'What are your biggest challenges right now?',
      whatIsYourPrimaryRevenue: 'What is your primary revenue model?',
      howDoYouAcquireCustomers: 'How do you primarily acquire customers?',
      whatIsYourMRR: 'What is your current monthly recurring revenue (MRR)?',
      whatMetricsDoYouTrack: 'What key metrics do you track for your business?',
      whatIsYourGrowthStrategy: 'What is your primary growth strategy?',
      whatIsYourBiggestGoal: 'What is your biggest goal for the next 6 months?',
      whatAreYourHobbies: 'What are your hobbies? What do you like to do?',
      whatIsYourFavoriteSong: "What's your favorite song?",
      whatShouldWeCallYou: 'What should we call you?',
      reviewYourAnswers: 'Review Your Answers',
      pleaseReview: 'Please review your answers below. You can edit any answer by clicking the edit button.',
      question: 'Question',
      of: 'of',
      step: 'Step',
      selectAnOption: 'Select an option',
      typeYourAnswer: 'Type your answer...',
      pleaseSpecify: 'Please specify...',
      imagesNotOurProperty: 'Images: Not our property'
    },
    discover: {
      discoverCreativity: 'Discover Creativity',
      exploreVideos: 'Explore videos, artworks, and inspiration from the creative world',
      recommendedForYou: 'Recommended for You',
      moreInspiringTalks: 'More Inspiring TED Talks',
      businessLegends: 'Business Legends & Their Stories',
      successStories: 'Success Stories',
      watch: 'Watch',
      views: 'views',
      playNow: 'Play Now',
      yourProgress: 'Your Progress',
      videosAvailable: 'Videos Available',
      savedVideos: 'Saved Videos',
      storiesExplored: 'Stories Explored',
      completionRate: 'Completion Rate',
      refreshRecommendations: 'Refresh Recommendations',
      contentTailored: 'Content tailored based on your check-in answers',
      basedOnCheckIn: "Based on your check-in answers, we've personalized these videos and stories to match your current focus and challenges."
    },
    settings: {
      account: 'Account',
      preferences: 'Preferences',
      notifications: 'Notifications',
      connections: 'Connections',
      general: 'General',
      people: 'People',
      teamspaces: 'Teamspaces',
      upgradePlan: 'Upgrade plan',
      language: 'Language',
      changeLanguage: 'Change the language used in the user interface.',
      appearance: 'Appearance',
      languageAndTime: 'Language & Time',
      startWeekOnMonday: 'Start week on Monday',
      setTimezoneAutomatically: 'Set timezone automatically using your location',
      timezone: 'Timezone',
      desktopApp: 'Desktop app',
      openLinksInDesktop: 'Open links in desktop app',
      openOnStart: 'Open on start',
      manageAccount: 'Manage your account settings',
      usersName: "User's name",
      usersEmail: "User's Email",
      customizeAppearance: 'Customize how Notion looks on your device.',
      light: 'Light',
      dark: 'Dark',
      useSystemSetting: 'Use system setting',
      topPageInSidebar: 'Top page in sidebar',
      lastVisitedPage: 'Last visited page',
      home: 'Home'
    },
    quickActions: {
      quickActions: 'Quick Actions',
      createProject: 'Create Project',
      scheduleMeeting: 'Schedule Meeting',
      addTask: 'Add Task',
      viewCalendar: 'View Calendar'
    },
    guidance: {
      yourJourney: 'Your {industry} Journey',
      whatToDoNext: 'What to Do Next',
      personalizedRoadmap: "Here's your personalized roadmap to get started in {industry}",
      successTips: '{industry} Success Tips',
      tailoredForYou: 'Tailored for you',
      ideaStageFocus: 'Idea Stage Focus',
      foundationStageFocus: 'Foundation Stage Focus',
      readyToScale: "You're Ready to Scale!",
      simplifyAndPrioritize: 'Simplify and Prioritize',
      smallStepsForward: 'Small Steps Forward',
      focusOnFirst: 'Focus on these first. We\'ll tackle the rest when you\'re ready.',
      moreStepsAvailable: '+ {count} more steps available'
    }
  },
  fr: {
    common: {
      welcome: 'Bienvenue',
      welcomeBack: 'Bon retour',
      welcomeTo: 'Bienvenue sur',
      whatAreWeCreatingToday: 'Que créons-nous aujourd\'hui ?',
      next: 'Suivant',
      back: 'Retour',
      done: 'Terminé',
      save: 'Enregistrer',
      cancel: 'Annuler',
      close: 'Fermer',
      edit: 'Modifier',
      delete: 'Supprimer',
      search: 'Rechercher',
      filter: 'Filtrer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      yes: 'Oui',
      no: 'Non'
    },
    nav: {
      home: 'Accueil',
      discover: 'Découvrir',
      bizoraAI: 'Bizora IA',
      systems: 'Systèmes',
      revenue: 'Revenus',
      leadership: 'Leadership',
      teams: 'Équipes',
      competitorIntelligence: 'Intelligence Concurrentielle',
      calendar: 'Calendrier',
      projects: 'Projets',
      hypeos: 'HypeOS'
    },
    home: {
      sessionActive: 'Session Active',
      howAreYouFeelingToday: 'Comment vous sentez-vous aujourd\'hui ?',
      helpUsUnderstand: 'Aidez-nous à comprendre votre état actuel afin que nous puissions fournir des conseils personnalisés',
      quickCheckIn: 'Vérification Rapide',
      answerQuestions: 'Répondre aux Questions',
      jumpBackIn: 'Revenir'
    },
    moods: {
      motivated: 'Motivé',
      excited: 'Enthousiaste',
      energized: 'Énergisé',
      demotivated: 'Démotivé',
      tired: 'Fatigué',
      overwhelmed: 'Débordé',
      stressed: 'Stressé',
      anxious: 'Anxieux',
      uncertain: 'Incertain',
      confident: 'Confiant',
      focused: 'Concentré',
      determined: 'Déterminé',
      neutral: 'Neutre',
      balanced: 'Équilibré',
      calm: 'Calme'
    },
    onboarding: {
      welcomeToDreamScale: 'Bienvenue sur DreamScale',
      excitedToHelp: 'Nous sommes ravis de vous aider à construire, développer et faire croître votre entreprise. Commençons par en apprendre davantage sur votre parcours entrepreneurial.',
      letsGetStarted: 'Commençons',
      whatIsYourBusinessName: 'Quel est le nom de votre entreprise ?',
      whatIndustry: 'Dans quelle industrie êtes-vous ?',
      whatStage: 'À quel stade se trouve votre entreprise ?',
      whatIsYourRevenueGoal: 'Quel est votre objectif de revenus pour cette année ?',
      whoIsYourTargetMarket: 'Qui est votre marché cible ?',
      whatIsYourTeamSize: 'Quelle est la taille actuelle de votre équipe ?',
      whatAreYourChallenges: 'Quels sont vos plus grands défis en ce moment ?',
      whatIsYourPrimaryRevenue: 'Quel est votre modèle de revenus principal ?',
      howDoYouAcquireCustomers: 'Comment acquérez-vous principalement des clients ?',
      whatIsYourMRR: 'Quel est votre revenu récurrent mensuel (MRR) actuel ?',
      whatMetricsDoYouTrack: 'Quelles métriques clés suivez-vous pour votre entreprise ?',
      whatIsYourGrowthStrategy: 'Quelle est votre stratégie de croissance principale ?',
      whatIsYourBiggestGoal: 'Quel est votre plus grand objectif pour les 6 prochains mois ?',
      whatAreYourHobbies: 'Quels sont vos passe-temps ? Qu\'aimez-vous faire ?',
      whatIsYourFavoriteSong: 'Quelle est votre chanson préférée ?',
      whatShouldWeCallYou: 'Comment devrions-nous vous appeler ?',
      reviewYourAnswers: 'Examinez Vos Réponses',
      pleaseReview: 'Veuillez examiner vos réponses ci-dessous. Vous pouvez modifier toute réponse en cliquant sur le bouton modifier.',
      question: 'Question',
      of: 'sur',
      step: 'Étape',
      selectAnOption: 'Sélectionner une option',
      typeYourAnswer: 'Tapez votre réponse...',
      pleaseSpecify: 'Veuillez préciser...',
      imagesNotOurProperty: 'Images : Ne nous appartiennent pas'
    },
    discover: {
      discoverCreativity: 'Découvrir la Créativité',
      exploreVideos: 'Explorez des vidéos, des œuvres d\'art et de l\'inspiration du monde créatif',
      recommendedForYou: 'Recommandé pour Vous',
      moreInspiringTalks: 'Plus de Conférences TED Inspirantes',
      businessLegends: 'Légendes des Affaires et Leurs Histoires',
      successStories: 'Histoires de Succès',
      watch: 'Regarder',
      views: 'vues',
      playNow: 'Lire Maintenant',
      yourProgress: 'Votre Progression',
      videosAvailable: 'Vidéos Disponibles',
      savedVideos: 'Vidéos Enregistrées',
      storiesExplored: 'Histoires Explorées',
      completionRate: 'Taux de Réalisation',
      refreshRecommendations: 'Actualiser les Recommandations',
      contentTailored: 'Contenu adapté en fonction de vos réponses de vérification',
      basedOnCheckIn: 'Sur la base de vos réponses de vérification, nous avons personnalisé ces vidéos et histoires pour correspondre à votre focus et défis actuels.'
    },
    settings: {
      account: 'Compte',
      preferences: 'Préférences',
      notifications: 'Notifications',
      connections: 'Connexions',
      general: 'Général',
      people: 'Personnes',
      teamspaces: 'Espaces d\'Équipe',
      upgradePlan: 'Mettre à niveau le plan',
      language: 'Langue',
      changeLanguage: 'Modifier la langue utilisée dans l\'interface utilisateur.',
      appearance: 'Apparence',
      languageAndTime: 'Langue et Heure',
      startWeekOnMonday: 'Commencer la semaine le lundi',
      setTimezoneAutomatically: 'Définir le fuseau horaire automatiquement en utilisant votre localisation',
      timezone: 'Fuseau Horaire',
      desktopApp: 'Application de Bureau',
      openLinksInDesktop: 'Ouvrir les liens dans l\'application de bureau',
      openOnStart: 'Ouvrir au démarrage',
      manageAccount: 'Gérer les paramètres de votre compte',
      usersName: 'Nom de l\'utilisateur',
      usersEmail: 'Email de l\'utilisateur',
      customizeAppearance: 'Personnalisez l\'apparence de Notion sur votre appareil.',
      light: 'Clair',
      dark: 'Sombre',
      useSystemSetting: 'Utiliser le paramètre système',
      topPageInSidebar: 'Page principale dans la barre latérale',
      lastVisitedPage: 'Dernière page visitée',
      home: 'Accueil'
    },
    quickActions: {
      quickActions: 'Actions Rapides',
      createProject: 'Créer un Projet',
      scheduleMeeting: 'Planifier une Réunion',
      addTask: 'Ajouter une Tâche',
      viewCalendar: 'Voir le Calendrier'
    },
    guidance: {
      yourJourney: 'Votre Parcours {industry}',
      whatToDoNext: 'Que Faire Ensuite',
      personalizedRoadmap: 'Voici votre feuille de route personnalisée pour commencer dans {industry}',
      successTips: 'Conseils de Succès {industry}',
      tailoredForYou: 'Adapté pour vous',
      ideaStageFocus: 'Focus sur le Stade d\'Idée',
      foundationStageFocus: 'Focus sur le Stade de Fondation',
      readyToScale: 'Vous Êtes Prêt à Passer à l\'Échelle !',
      simplifyAndPrioritize: 'Simplifier et Prioriser',
      smallStepsForward: 'Petits Pas en Avant',
      focusOnFirst: 'Concentrez-vous sur ceux-ci d\'abord. Nous aborderons le reste quand vous serez prêt.',
      moreStepsAvailable: '+ {count} autres étapes disponibles'
    }
  },
  de: {
    common: {
      welcome: 'Willkommen',
      welcomeBack: 'Willkommen zurück',
      welcomeTo: 'Willkommen bei',
      whatAreWeCreatingToday: 'Was erstellen wir heute?',
      next: 'Weiter',
      back: 'Zurück',
      done: 'Fertig',
      save: 'Speichern',
      cancel: 'Abbrechen',
      close: 'Schließen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      search: 'Suchen',
      filter: 'Filtern',
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      yes: 'Ja',
      no: 'Nein'
    },
    nav: {
      home: 'Startseite',
      discover: 'Entdecken',
      bizoraAI: 'Bizora KI',
      systems: 'Systeme',
      revenue: 'Umsatz',
      leadership: 'Führung',
      teams: 'Teams',
      competitorIntelligence: 'Wettbewerbsanalyse',
      calendar: 'Kalender',
      projects: 'Projekte',
      hypeos: 'HypeOS'
    },
    home: {
      sessionActive: 'Sitzung Aktiv',
      howAreYouFeelingToday: 'Wie fühlen Sie sich heute?',
      helpUsUnderstand: 'Helfen Sie uns, Ihren aktuellen Zustand zu verstehen, damit wir personalisierte Anleitung bieten können',
      quickCheckIn: 'Schneller Check-In',
      answerQuestions: 'Fragen Beantworten',
      jumpBackIn: 'Zurückkehren'
    },
    moods: {
      motivated: 'Motiviert',
      excited: 'Aufgeregt',
      energized: 'Energisch',
      demotivated: 'Demotiviert',
      tired: 'Müde',
      overwhelmed: 'Überwältigt',
      stressed: 'Gestresst',
      anxious: 'Ängstlich',
      uncertain: 'Unsicher',
      confident: 'Selbstbewusst',
      focused: 'Fokussiert',
      determined: 'Entschlossen',
      neutral: 'Neutral',
      balanced: 'Ausgewogen',
      calm: 'Ruhig'
    },
    onboarding: {
      welcomeToDreamScale: 'Willkommen bei DreamScale',
      excitedToHelp: 'Wir freuen uns, Ihnen beim Aufbau, der Skalierung und dem Wachstum Ihres Unternehmens zu helfen. Lassen Sie uns beginnen, indem wir mehr über Ihre unternehmerische Reise erfahren.',
      letsGetStarted: 'Lass uns anfangen',
      whatIsYourBusinessName: 'Wie lautet der Name Ihres Unternehmens?',
      whatIndustry: 'In welcher Branche sind Sie tätig?',
      whatStage: 'In welchem Stadium befindet sich Ihr Unternehmen?',
      whatIsYourRevenueGoal: 'Wie lautet Ihr Umsatzziel für dieses Jahr?',
      whoIsYourTargetMarket: 'Wer ist Ihre Zielgruppe?',
      whatIsYourTeamSize: 'Wie groß ist Ihr aktuelles Team?',
      whatAreYourChallenges: 'Was sind Ihre größten Herausforderungen im Moment?',
      whatIsYourPrimaryRevenue: 'Wie lautet Ihr primäres Umsatzmodell?',
      howDoYouAcquireCustomers: 'Wie gewinnen Sie hauptsächlich Kunden?',
      whatIsYourMRR: 'Wie hoch ist Ihr aktueller monatlicher wiederkehrender Umsatz (MRR)?',
      whatMetricsDoYouTrack: 'Welche wichtigen Metriken verfolgen Sie für Ihr Unternehmen?',
      whatIsYourGrowthStrategy: 'Wie lautet Ihre primäre Wachstumsstrategie?',
      whatIsYourBiggestGoal: 'Wie lautet Ihr größtes Ziel für die nächsten 6 Monate?',
      whatAreYourHobbies: 'Was sind Ihre Hobbys? Was machen Sie gerne?',
      whatIsYourFavoriteSong: 'Was ist Ihr Lieblingslied?',
      whatShouldWeCallYou: 'Wie sollen wir Sie nennen?',
      reviewYourAnswers: 'Überprüfen Sie Ihre Antworten',
      pleaseReview: 'Bitte überprüfen Sie Ihre Antworten unten. Sie können jede Antwort bearbeiten, indem Sie auf die Schaltfläche Bearbeiten klicken.',
      question: 'Frage',
      of: 'von',
      step: 'Schritt',
      selectAnOption: 'Option auswählen',
      typeYourAnswer: 'Geben Sie Ihre Antwort ein...',
      pleaseSpecify: 'Bitte angeben...',
      imagesNotOurProperty: 'Bilder: Gehören uns nicht'
    },
    discover: {
      discoverCreativity: 'Kreativität Entdecken',
      exploreVideos: 'Entdecken Sie Videos, Kunstwerke und Inspiration aus der kreativen Welt',
      recommendedForYou: 'Für Sie Empfohlen',
      moreInspiringTalks: 'Weitere Inspirierende TED-Talks',
      businessLegends: 'Geschäftslegenden und Ihre Geschichten',
      successStories: 'Erfolgsgeschichten',
      watch: 'Ansehen',
      views: 'Aufrufe',
      playNow: 'Jetzt Abspielen',
      yourProgress: 'Ihr Fortschritt',
      videosAvailable: 'Verfügbare Videos',
      savedVideos: 'Gespeicherte Videos',
      storiesExplored: 'Erkundete Geschichten',
      completionRate: 'Abschlussrate',
      refreshRecommendations: 'Empfehlungen Aktualisieren',
      contentTailored: 'Inhalt basierend auf Ihren Check-in-Antworten angepasst',
      basedOnCheckIn: 'Basierend auf Ihren Check-in-Antworten haben wir diese Videos und Geschichten personalisiert, um zu Ihrem aktuellen Fokus und Ihren Herausforderungen zu passen.'
    },
    settings: {
      account: 'Konto',
      preferences: 'Einstellungen',
      notifications: 'Benachrichtigungen',
      connections: 'Verbindungen',
      general: 'Allgemein',
      people: 'Personen',
      teamspaces: 'Teambereiche',
      upgradePlan: 'Plan Upgraden',
      language: 'Sprache',
      changeLanguage: 'Ändern Sie die in der Benutzeroberfläche verwendete Sprache.',
      appearance: 'Erscheinungsbild',
      languageAndTime: 'Sprache und Zeit',
      startWeekOnMonday: 'Woche am Montag beginnen',
      setTimezoneAutomatically: 'Zeitzone automatisch mit Ihrem Standort festlegen',
      timezone: 'Zeitzone',
      desktopApp: 'Desktop-App',
      openLinksInDesktop: 'Links in der Desktop-App öffnen',
      openOnStart: 'Beim Start öffnen',
      manageAccount: 'Verwalten Sie Ihre Kontoeinstellungen',
      usersName: 'Benutzername',
      usersEmail: 'Benutzer-E-Mail',
      customizeAppearance: 'Passen Sie an, wie Notion auf Ihrem Gerät aussieht.',
      light: 'Hell',
      dark: 'Dunkel',
      useSystemSetting: 'Systemeinstellung verwenden',
      topPageInSidebar: 'Oberste Seite in der Seitenleiste',
      lastVisitedPage: 'Zuletzt besuchte Seite',
      home: 'Startseite'
    },
    quickActions: {
      quickActions: 'Schnellaktionen',
      createProject: 'Projekt Erstellen',
      scheduleMeeting: 'Meeting Planen',
      addTask: 'Aufgabe Hinzufügen',
      viewCalendar: 'Kalender Anzeigen'
    },
    guidance: {
      yourJourney: 'Ihre {industry} Reise',
      whatToDoNext: 'Was Als Nächstes Zu Tun',
      personalizedRoadmap: 'Hier ist Ihre personalisierte Roadmap, um in {industry} zu beginnen',
      successTips: '{industry} Erfolgstipps',
      tailoredForYou: 'Für Sie Angepasst',
      ideaStageFocus: 'Fokus auf Ideenstadium',
      foundationStageFocus: 'Fokus auf Gründungsstadium',
      readyToScale: 'Sie Sind Bereit zu Skalieren!',
      simplifyAndPrioritize: 'Vereinfachen und Priorisieren',
      smallStepsForward: 'Kleine Schritte Vorwärts',
      focusOnFirst: 'Konzentrieren Sie sich zuerst auf diese. Wir werden den Rest angehen, wenn Sie bereit sind.',
      moreStepsAvailable: '+ {count} weitere Schritte verfügbar'
    }
  },
  es: {
    common: {
      welcome: 'Bienvenido',
      welcomeBack: 'Bienvenido de nuevo',
      welcomeTo: 'Bienvenido a',
      whatAreWeCreatingToday: '¿Qué estamos creando hoy?',
      next: 'Siguiente',
      back: 'Atrás',
      done: 'Hecho',
      save: 'Guardar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      edit: 'Editar',
      delete: 'Eliminar',
      search: 'Buscar',
      filter: 'Filtrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      yes: 'Sí',
      no: 'No'
    },
    nav: {
      home: 'Inicio',
      discover: 'Descubrir',
      bizoraAI: 'Bizora IA',
      systems: 'Sistemas',
      revenue: 'Ingresos',
      leadership: 'Liderazgo',
      teams: 'Equipos',
      competitorIntelligence: 'Inteligencia Competitiva',
      calendar: 'Calendario',
      projects: 'Proyectos',
      hypeos: 'HypeOS'
    },
    home: {
      sessionActive: 'Sesión Activa',
      howAreYouFeelingToday: '¿Cómo te sientes hoy?',
      helpUsUnderstand: 'Ayúdanos a entender tu estado actual para que podamos brindar orientación personalizada',
      quickCheckIn: 'Verificación Rápida',
      answerQuestions: 'Responder Preguntas',
      jumpBackIn: 'Volver'
    },
    moods: {
      motivated: 'Motivado',
      excited: 'Emocionado',
      energized: 'Energizado',
      demotivated: 'Desmotivado',
      tired: 'Cansado',
      overwhelmed: 'Abrumado',
      stressed: 'Estresado',
      anxious: 'Ansioso',
      uncertain: 'Incierto',
      confident: 'Confiado',
      focused: 'Enfocado',
      determined: 'Determinado',
      neutral: 'Neutral',
      balanced: 'Equilibrado',
      calm: 'Tranquilo'
    },
    onboarding: {
      welcomeToDreamScale: 'Bienvenido a DreamScale',
      excitedToHelp: 'Estamos emocionados de ayudarte a construir, escalar y hacer crecer tu negocio. Comencemos aprendiendo más sobre tu viaje empresarial.',
      letsGetStarted: 'Empecemos',
      whatIsYourBusinessName: '¿Cuál es el nombre de tu negocio?',
      whatIndustry: '¿En qué industria estás?',
      whatStage: '¿En qué etapa está tu negocio?',
      whatIsYourRevenueGoal: '¿Cuál es tu objetivo de ingresos para este año?',
      whoIsYourTargetMarket: '¿Quién es tu mercado objetivo?',
      whatIsYourTeamSize: '¿Cuál es el tamaño actual de tu equipo?',
      whatAreYourChallenges: '¿Cuáles son tus mayores desafíos en este momento?',
      whatIsYourPrimaryRevenue: '¿Cuál es tu modelo de ingresos principal?',
      howDoYouAcquireCustomers: '¿Cómo adquieres principalmente clientes?',
      whatIsYourMRR: '¿Cuál es tu ingreso recurrente mensual (MRR) actual?',
      whatMetricsDoYouTrack: '¿Qué métricas clave rastreas para tu negocio?',
      whatIsYourGrowthStrategy: '¿Cuál es tu estrategia de crecimiento principal?',
      whatIsYourBiggestGoal: '¿Cuál es tu mayor objetivo para los próximos 6 meses?',
      whatAreYourHobbies: '¿Cuáles son tus pasatiempos? ¿Qué te gusta hacer?',
      whatIsYourFavoriteSong: '¿Cuál es tu canción favorita?',
      whatShouldWeCallYou: '¿Cómo deberíamos llamarte?',
      reviewYourAnswers: 'Revisa Tus Respuestas',
      pleaseReview: 'Por favor revisa tus respuestas a continuación. Puedes editar cualquier respuesta haciendo clic en el botón editar.',
      question: 'Pregunta',
      of: 'de',
      step: 'Paso',
      selectAnOption: 'Seleccionar una opción',
      typeYourAnswer: 'Escribe tu respuesta...',
      pleaseSpecify: 'Por favor especifica...',
      imagesNotOurProperty: 'Imágenes: No son de nuestra propiedad'
    },
    discover: {
      discoverCreativity: 'Descubrir Creatividad',
      exploreVideos: 'Explora videos, obras de arte e inspiración del mundo creativo',
      recommendedForYou: 'Recomendado para Ti',
      moreInspiringTalks: 'Más Charlas TED Inspiradoras',
      businessLegends: 'Leyendas Empresariales y Sus Historias',
      successStories: 'Historias de Éxito',
      watch: 'Ver',
      views: 'visualizaciones',
      playNow: 'Reproducir Ahora',
      yourProgress: 'Tu Progreso',
      videosAvailable: 'Videos Disponibles',
      savedVideos: 'Videos Guardados',
      storiesExplored: 'Historias Exploradas',
      completionRate: 'Tasa de Finalización',
      refreshRecommendations: 'Actualizar Recomendaciones',
      contentTailored: 'Contenido adaptado según tus respuestas de verificación',
      basedOnCheckIn: 'Basado en tus respuestas de verificación, hemos personalizado estos videos e historias para que coincidan con tu enfoque y desafíos actuales.'
    },
    settings: {
      account: 'Cuenta',
      preferences: 'Preferencias',
      notifications: 'Notificaciones',
      connections: 'Conexiones',
      general: 'General',
      people: 'Personas',
      teamspaces: 'Espacios de Equipo',
      upgradePlan: 'Actualizar Plan',
      language: 'Idioma',
      changeLanguage: 'Cambiar el idioma utilizado en la interfaz de usuario.',
      appearance: 'Apariencia',
      languageAndTime: 'Idioma y Hora',
      startWeekOnMonday: 'Comenzar la semana el lunes',
      setTimezoneAutomatically: 'Establecer zona horaria automáticamente usando tu ubicación',
      timezone: 'Zona Horaria',
      desktopApp: 'Aplicación de Escritorio',
      openLinksInDesktop: 'Abrir enlaces en la aplicación de escritorio',
      openOnStart: 'Abrir al Iniciar',
      manageAccount: 'Administra la configuración de tu cuenta',
      usersName: 'Nombre del Usuario',
      usersEmail: 'Correo del Usuario',
      customizeAppearance: 'Personaliza cómo se ve Notion en tu dispositivo.',
      light: 'Claro',
      dark: 'Oscuro',
      useSystemSetting: 'Usar configuración del sistema',
      topPageInSidebar: 'Página principal en la barra lateral',
      lastVisitedPage: 'Última página visitada',
      home: 'Inicio'
    },
    quickActions: {
      quickActions: 'Acciones Rápidas',
      createProject: 'Crear Proyecto',
      scheduleMeeting: 'Programar Reunión',
      addTask: 'Agregar Tarea',
      viewCalendar: 'Ver Calendario'
    },
    guidance: {
      yourJourney: 'Tu Viaje {industry}',
      whatToDoNext: 'Qué Hacer Después',
      personalizedRoadmap: 'Aquí está tu hoja de ruta personalizada para comenzar en {industry}',
      successTips: 'Consejos de Éxito {industry}',
      tailoredForYou: 'Adaptado para Ti',
      ideaStageFocus: 'Enfoque en Etapa de Idea',
      foundationStageFocus: 'Enfoque en Etapa de Fundación',
      readyToScale: '¡Estás Listo para Escalar!',
      simplifyAndPrioritize: 'Simplificar y Priorizar',
      smallStepsForward: 'Pequeños Pasos Adelante',
      focusOnFirst: 'Enfócate en estos primero. Abordaremos el resto cuando estés listo.',
      moreStepsAvailable: '+ {count} pasos más disponibles'
    }
  }
}

export function getTranslation(language: Language, key: string, params?: Record<string, string>): string {
  const keys = key.split('.')
  let value: any = translations[language]
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // Fallback to English if translation missing
      let fallback: any = translations.en
      for (const fk of keys) {
        fallback = fallback?.[fk]
      }
      value = fallback || key
      break
    }
  }
  
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] || match
    })
  }
  
  return typeof value === 'string' ? value : key
}

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en
}

export { translations }

