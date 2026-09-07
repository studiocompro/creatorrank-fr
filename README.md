# CreatorRank FR — V5 « Base massive » francophone et multi-plateformes

CreatorRank FR est un observatoire factuel des créateurs **YouTube, Twitch et Kick** francophones. Le principe reste simple : **séparer les métriques, afficher la source et la date, conserver l’historique et ne jamais remplacer une donnée manquante par une supposition**.

## État actuel du catalogue V5

Snapshot éditorial du **7 septembre 2026** :

- **248 profils/chaînes YouTube** ;
- **178 chaînes Twitch francophones** ;
- **15 chaînes Kick francophones** ;
- **Top 20 des abonnements Twitch actifs** intégré comme métrique séparée ;
- **25 signaux “Révélations & percées”** ;
- **24 identités multi-plateformes** déjà reliées entre leurs comptes ;
- **15 univers de jeux** préparés pour la collecte ;
- **20 dossiers judiciaires** documentés avec statut, date et sources.

Répartition géographique actuellement vérifiée/étiquetée dans le seed :

| Territoire | YouTube | Twitch | Kick |
| --- | ---: | ---: | ---: |
| France | 184 | 170 | 15 |
| Québec / Canada francophone | 52 | 2 | 0 |
| Suisse romande | 9 | 4 | 0 |
| Belgique | 3 | 2 | 0 |
| Autres francophones | en expansion | en expansion | en expansion |

> Ces nombres décrivent le **catalogue effectivement importé**, pas la taille réelle de la création francophone. Le chantier suivant consiste précisément à élargir les petits comptes et les territoires encore peu représentés.

### Pourquoi 248 et non 250 YouTube ?

L’import initial V5 contenait deux doublons de nom au Québec. `Adam Paradisio` / `Adam Paradisio (ADAM)` et `Aiekillu` / `Nabil Lahrech` ont été fusionnés. CreatorRank préfère une identité propre à un compteur artificiellement plus élevé.

## Couverture et sources de découverte

La V5 ajoute une couche `discoverySources` pour distinguer **une source permettant de découvrir des créateurs** d’une **source suffisamment précise pour classer une métrique**.

Principaux réservoirs actuellement utilisés :

- France : Top 1000 YouTube d’Inside Créateurs ;
- Québec : 52 chaînes YouTube dans InfluenceursQC et 376 profils multi-plateformes dans son annuaire global ;
- Suisse romande : 341 profils dans l’annuaire Vojood, puis validation des comptes de plateforme ;
- Science / éducation / culture : annuaire francophone de Stéphane Debove, contenant plusieurs milliers de chaînes à découvrir ;
- Twitch : classements francophones publics + API officielle pour les comptes suivis ;
- Kick : classement francophone public de lancement + API développeur officielle pour les métadonnées et le live.

**Un annuaire de découverte n’entre pas automatiquement dans un classement.** Les métriques doivent être rattachées à la bonne chaîne, datées et suffisamment comparables.

## Identité multi-plateformes

La V5 introduit `personId` et `profiles`. L’objectif est d’éviter trois fiches séparées pour une même personne.

Exemple conceptuel :

```text
Créateur X
├── YouTube principal
├── YouTube secondaire
├── Twitch
└── Kick
```

Chaque compte garde ses statistiques propres. La fiche “personne” sert seulement à relier les plateformes : **CreatorRank ne mélange pas abonnés YouTube, followers Twitch et followers Kick dans un faux total de popularité**.

## Révélations & percées

CreatorRank cherche les petits/moyens comptes qui connaissent une accélération inhabituelle.

Filtres “petits comptes” actuels :

- YouTube : < 250 000 abonnés ;
- Twitch : < 100 000 followers ;
- Kick : < 100 000 followers.

Les statuts restent prudents : **Percée confirmée**, **Pic événementiel**, **À surveiller**, **Signal à vérifier**.

Pour YouTube, une vidéo doit être comparée aux précédentes **au même âge**. Pour Twitch et Kick, la croissance de followers doit idéalement être corroborée par les viewers, le temps diffusé et les heures regardées.

## Ouvrir le site

```bash
npm run serve
```

Puis ouvrir `http://localhost:8080`.

## Actualisation publique toutes les 48 h

Le projet contient :

- `scripts/update-data.mjs` : collecteur + historique ;
- `.github/workflows/update-data.yml` : automatisation GitHub Actions ;
- `data/catalog.json` : snapshot public ;
- `data/catalog.js` : copie consommée par le front statique ;
- `data/history.json` : historique CreatorRank.

Flux :

```text
GitHub Actions
      ↓
contrôle : dernier cycle ≥ 48 h ?
      ↓
YouTube Data API + Twitch Helix + KICK API
      ↓
normalisation + snapshots
      ↓
calculs CreatorRank disponibles
      ↓
data/catalog.json + data/history.json
      ↓
commit automatique → redéploiement
```

Le workflow peut être déclenché chaque jour, mais le collecteur applique lui-même la fenêtre de **48 h** aux snapshots publics.

## Secrets nécessaires à la publication

```text
YOUTUBE_API_KEY
TWITCH_CLIENT_ID
TWITCH_CLIENT_SECRET
KICK_CLIENT_ID
KICK_CLIENT_SECRET
```

Ils doivent rester dans GitHub Secrets / l’environnement serveur, jamais dans le JavaScript public.

## YouTube

Le collecteur officiel peut récupérer les identifiants, abonnés publics, vues cumulées, nombre de vidéos et vidéos récentes. L’historique permettra progressivement la croissance 30/90/365 jours, Buzz et “contre soi-même”.

### Buzz J+7

```text
Buzz 7j = vues de la vidéo à J+7
          ÷ médiane des vues à J+7 des 20 vidéos précédentes
```

Le score n’est publié que lorsque suffisamment de références comparables existent.

## Twitch

Twitch Helix sert à résoudre les comptes, suivre leurs données officielles disponibles et stocker les snapshots. Une publication toutes les 48 h suffit pour les compteurs lents, mais **les métriques de live** (viewer moyen, heures regardées, jeu diffusé) devront être échantillonnées bien plus souvent en production afin de ne pas rater un live entre deux snapshots publics.

## Kick

La V5 ajoute une vraie collection `kick` et une intégration à l’API développeur officielle.

Le collecteur peut actuellement enregistrer, lorsque l’API les renvoie :

- identifiant de chaîne ;
- description ;
- catégorie courante ;
- statut live ;
- viewers live ;
- heure de début ;
- miniature ;
- compteurs d’abonnements actifs lorsqu’ils sont disponibles.

### Limite importante

Au moment de cette V5, **CreatorRank ne considère pas le total de followers Kick comme une métrique officiellement rafraîchie par l’API**. Les followers et métriques 7 jours du seed proviennent donc d’agrégateurs publics datés. Le site les affiche comme tels au lieu de prétendre qu’ils viennent de KICK.

Le collecteur envoie les requêtes par petits lots pour limiter les risques d’incohérence et pourra être adapté lorsque l’API officielle exposera de façon stable les métriques nécessaires.

## Jeux

Les 15 catégories sont préparées. À terme : catégories Twitch/Kick officielles + classification contrôlée des vidéos YouTube. Une simple occurrence d’un nom de jeu dans un titre ne doit pas suffire à attribuer définitivement un créateur à ce jeu.

## Affaires & décisions

La rubrique documente des statuts judiciaires, **pas un classement moral**. Les filtres séparent condamnations, procédures en cours, plaintes/signalements et affaires closes/classées. Une plainte ou une mise en examen n’est jamais affichée comme une condamnation.

## Publicité, AdBlock et consentement

Trois emplacements publicitaires sont préparés, un message AdBlock reste facultatif, et le gestionnaire de consentement conserve les traceurs non essentiels désactivés tant qu’ils ne sont pas autorisés lorsqu’un consentement est requis. Aucune régie réelle n’est branchée dans cette version.

Pages : `about.html`, `advertising.html`, `privacy.html`, `cookies.html`, `legal.html`, `corrections.html`, `contact.html`, `404.html`.

## Sources

Voir `data/SOURCES.md` et les objets `sources` de `data/catalog.json`.

## Règles éditoriales

1. une métrique = une idée ;
2. source + date visibles ;
3. “indisponible” vaut mieux qu’un chiffre inventé ;
4. YouTube, Twitch et Kick gardent leurs métriques propres ;
5. un annuaire sert à découvrir, pas automatiquement à classer ;
6. un pic n’est pas automatiquement une tendance ;
7. une hausse suspecte reste marquée comme telle ;
8. les formules CreatorRank sont publiques ;
9. deux comptes d’une même personne sont reliés mais jamais fusionnés statistiquement ;
10. la géographie n’est affichée comme vérifiée que lorsque la source permet de la soutenir.


## Contrôle judiciaire V5.1 — 7 septembre 2026

La rubrique compte 20 dossiers documentés. Chaque carte affiche désormais une phrase « Faits en bref », la date de l’événement judiciaire, la date de contrôle du dossier et les sources. Les accusations publiques sans procédure judiciaire identifiée ne sont pas intégrées à la rubrique « Affaires & décisions ».
