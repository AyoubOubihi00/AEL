# AEL – Application de gestion de contrats énergétiques

AEL est une application web réalisée dans le cadre d’un projet universitaire.  
Elle permet à un utilisateur de gérer et consulter ses contrats énergétiques, ses consommations et ses factures depuis un tableau de bord.

Le projet repose sur une architecture séparant le **front-end Angular** et une **API back-end Node.js / Express**.

## Technologies utilisées

### Front-end
- Angular
- TypeScript
- Angular Material
- HTML / CSS

### Back-end
- Node.js
- Express
- TypeScript
- LowDB

### Outils
- npm
- Git / GitHub

## Fonctionnalités

L’application propose notamment :

- création d’un compte utilisateur ;
- authentification ;
- contrôle de l’adresse e-mail lors de l’inscription ;
- validation de l’âge avec un minimum de 18 ans ;
- consultation des contrats énergétiques ;
- affichage des informations détaillées d’un contrat ;
- tableau de bord utilisateur ;
- suivi des consommations ;
- consultation des factures ;
- estimation de consommation ;
- accès aux justificatifs ;
- notifications utilisateur.

### Fonctionnalités supplémentaires

Plusieurs fonctionnalités ont également été ajoutées au-delà de la maquette initiale :

- **Historique des factures** : accès à la liste des factures associées aux contrats depuis la carte « Factures » ;
- **Validation de l’âge** : création de compte réservée aux utilisateurs âgés d’au moins 18 ans ;
- **Thème clair / sombre** : possibilité de basculer entre les deux thèmes avec mémorisation de la préférence.

## Architecture du projet

```text
AEL/
├── BackEnd/
│   ├── data/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── FrontEnd/
│   ├── public/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       ├── features/
│   │       ├── pages/
│   │       └── service/
│   ├── angular.json
│   └── package.json
│
└── README.md
```

## API REST

Principaux endpoints exposés par le back-end :

### Authentification

```text
POST /auth/login
POST /auth/register
GET  /auth/check-email
```

### Contrats

```text
GET /users/:userId/contracts
GET /contracts/:contractId
GET /contracts/:contractId/consommations
```

### Tableau de bord

```text
GET /dashboard/:userId/consommations
GET /dashboard/:userId/factures
GET /dashboard/:userId/factures/historique
GET /dashboard/:userId/estimation
GET /dashboard/:userId/justificatif
```

## Tests

Des tests ont été mis en place sur les composants et services Angular.

### Composants

| Fichier | Tests |
|---|---:|
| `app.spec.ts` | 2 |
| `connexion-page.component.spec.ts` | 3 |
| `creation-compte-page.component.spec.ts` | 4 |
| `tableau-bord-page.component.spec.ts` | 1 |
| **Total** | **10** |

### Services

| Fichier | Tests |
|---|---:|
| `auth.service.spec.ts` | 3 |
| `contrat.service.spec.ts` | 2 |
| `notification.service.spec.ts` | 1 |
| `tableau-bord.service.spec.ts` | 1 |
| **Total** | **7** |

**Total : 17 tests**

## Installation

### Prérequis

- Node.js
- npm
- Angular CLI

### Back-end

```bash
cd BackEnd
npm install
npm start
```

### Front-end

Dans un second terminal :

```bash
cd FrontEnd
npm install
ng serve
```

L’application front-end est ensuite accessible à l’adresse indiquée par Angular dans le terminal.

## Contexte

Projet réalisé dans le cadre de ma formation en **Master Génie Informatique à l’Université de Lorraine**.

Ce projet m’a notamment permis de travailler sur :

- le développement d’une SPA avec Angular et TypeScript ;
- la conception d’une API REST avec Node.js et Express ;
- la communication front-end / back-end ;
- la gestion des données avec LowDB ;
- l’authentification et la gestion des utilisateurs ;
- la structuration d’une application web en composants et services ;
- la mise en place de tests unitaires.

## Auteur

**Ayoub OUBIHI**  
Master Génie Informatique – Université de Lorraine
