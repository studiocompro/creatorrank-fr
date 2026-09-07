# Sources du snapshot CreatorRank FR — V5 — 7 septembre 2026

Ce fichier décrit les **familles de sources**. Les URL et dates précises utilisées par chaque entrée restent également conservées dans `data/catalog.json`.

## Principe : découverte ≠ classement

CreatorRank distingue désormais deux usages :

1. **source de découverte** : permet de trouver des chaînes/profils susceptibles d’entrer dans la base ;
2. **source métrique** : fournit une donnée suffisamment identifiable, datée et comparable pour apparaître dans un classement.

Un profil trouvé dans un annuaire n’hérite donc pas automatiquement de toutes les métriques de cet annuaire.

## YouTube — France

Sources principales : **Inside Créateurs Top 100 / 500 / 1000 France**, plus pages individuelles et autres agrégateurs publics pour compléter certains profils historiques ou spécialisés.

Le Top 1000 est principalement un réservoir de découverte. CreatorRank étiquette les comptes afin d’éviter de confondre créateurs individuels/duos avec médias, musique, marques ou chaînes institutionnelles.

## Québec / Canada francophone

**InfluenceursQC — Top YouTube au Québec** sert de seed à la V5 : 52 chaînes/créateurs YouTube recensés. Son annuaire global annonce 376 profils multi-plateformes. Les nombres issus de l’annuaire sont utilisés comme valeurs datées de départ lorsqu’ils sont explicitement disponibles ; l’API YouTube doit les remplacer progressivement.

## Suisse romande

**Vojood** recense 341 profils de Suisse romande et sert de source de découverte. Les métriques YouTube/Twitch proviennent ensuite de sources propres aux plateformes ou d’agrégateurs spécialisés.

Seeds actuels vérifiés : Nicocapone, LE GRAND JD, Benoît/Diablox9, Yomi Denzel, Wartek, Verity & Chelsea, Kinstaar, PsYkO17, Mike Horn, BagheraJones, Tonton, RomainJacques_, Yannex.

## Belgique

Premiers seeds V5 : Gaëlle Garcia Diaz, Lufy & Enzo, Guizzi sur YouTube ; AkhaessTV et extaa_be sur Twitch. La couverture belge reste à étendre avant de pouvoir être considérée représentative.

## Science / éducation / culture

L’annuaire francophone de **Stéphane Debove**, mis à jour en février 2026, contient plusieurs milliers de chaînes liées à la vulgarisation scientifique/éducative/culturelle. Il sert de réservoir de découverte pour éviter que CreatorRank ne se limite aux seules chaînes de divertissement les plus visibles.

## Twitch francophone

Snapshot de classement : **TwitchTracker — French channels ranking**, complété par TwitchMetrics, Streams Charts, BetterBanned et d’autres pages individuelles lorsque nécessaire.

TwitchTracker indique que le scraping automatisé de son site est interdit. CreatorRank **ne contient donc aucun scraper TwitchTracker** : ces relevés servent de snapshot éditorial, puis les comptes suivis sont progressivement rafraîchis via **Twitch Helix API** et l’historique propre de CreatorRank.

La V5 ajoute aussi un snapshot séparé **TwitchTracker — abonnements actifs francophones**. Cette métrique est affichée comme une estimation de source tierce datée et n’est jamais confondue avec les followers ou les viewers ; la source signale elle-même une possible marge d’erreur.

## Kick francophone

Seed V5 : **Streams Charts — Kick francophone / France**, fenêtre glissante de 7 jours au 7 septembre 2026. Les entrées incluent notamment jolavanille, bichouu, yoda19k, tobias, perebourrasse69 et plusieurs petits comptes en progression.

KICK dispose d’une **API développeur officielle** (`dev.kick.com`). CreatorRank a préparé l’authentification client_credentials et la lecture des chaînes/live.

**Limite :** le total de followers du seed Kick reste une donnée provenant de l’agrégateur public tant que l’API officielle utilisée par CreatorRank ne fournit pas de manière fiable cette métrique. Les métriques live/officielles et les followers tiers sont donc explicitement distingués.

## APIs de production

- **YouTube Data API v3** : chaîne, statistiques publiques, uploads et vidéos ;
- **Twitch Helix API** : comptes, followers et données live disponibles ;
- **KICK Developer API** : chaînes, live, catégories et compteurs pris en charge ;
- **Historique CreatorRank** : variations, baselines et futurs scores propres.

## Justice

Les entrées judiciaires sont documentées manuellement à partir de sources journalistiques reconnues et du statut procédural disponible. Elles ne sont jamais générées automatiquement à partir d’une simple accusation ou d’un titre.

La V5.1 documente 20 dossiers : Grégory Guillotin, Owen Cenazandotti/Naruto, Safine Hamadi, Até Chuet, Mounim Sabhi/La Team du Château, Ludovic Burger, Papacito (deux procédures distinctes), Loris Giuliano, Ethan Berrebi, Bassem Braïki, Gregory Toussaint, Sophie Fantasy, Greg Inside, Germain Gaiffe, ExperimentBoy, La Menace/Maxime Alexandrov, Norman Thavaud, Léo Grasset/DirtyBiology et Marvel Fitness.

Règle : plainte, enquête, mise en examen, procès, condamnation, relaxe/acquittement et classement sans suite sont des états différents. Les accusations publiques sans procédure judiciaire identifiée ne sont pas intégrées dans cette rubrique ; c’est notamment le choix retenu au 7 septembre 2026 pour Antoine Daniel, les sources consultées indiquant alors l’absence de poursuites judiciaires.

## Publicité, cookies et vie privée

Références de conception :

- CNIL — règles cookies et traceurs : https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles
- CNIL — mise en conformité : https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/comment-mettre-mon-site-web-en-conformite
- Code civil, article 9-1 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006419316

Aucune régie publicitaire réelle n’est chargée dans cette V5.

## Limites du snapshot

- le catalogue n’est pas encore exhaustif de toute la francophonie ;
- les nombres publics YouTube peuvent être arrondis ;
- les agrégateurs peuvent avoir une latence ou une marge d’erreur ;
- le territoire de certains anciens seeds doit encore être revalidé individuellement ;
- les viewers moyens Twitch/Kick nécessitent une collecte live plus fréquente que 48 h pour devenir 100 % internes ;
- les scores Buzz et contre-soi-même dépendent d’un historique CreatorRank suffisamment long ;
- les métriques Kick seed sont sur une fenêtre 7 jours et ne doivent pas être comparées directement à une fenêtre Twitch 30 jours.
