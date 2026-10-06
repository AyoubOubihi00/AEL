## Fonctionnalités ajoutées (hors maquette)

- Historique des factures : bouton “Historique” dans la carte Factures avec la liste des factures par contrat.
- Création de compte : validation de l’âge (>= 18 ans obligatoire).
- Thème clair / sombre : toggle Light/Dark en haut à droite (préférence mémorisée).

## API Backend (principaux endpoints)
- POST /auth/login
- POST /auth/register
- GET /auth/check-email
- GET /users/:userId/contracts
- GET /contracts/:contractId
- GET /contracts/:contractId/consommations
- GET /dashboard/:userId/consommations
- GET /dashboard/:userId/factures
- GET /dashboard/:userId/factures/historique
- GET /dashboard/:userId/estimation
- GET /dashboard/:userId/justificatif

## Tests mis en place

### Composants
- app.spec.ts → 2 tests  
- connexion-page.component.spec.ts → 3 tests  
- creation-compte-page.component.spec.ts → 4 tests  
- tableau-bord-page.component.spec.ts → 1 test  

Total composants : 10 tests

### Services
- auth.service.spec.ts → 3 tests  
- contrat.service.spec.ts → 2 tests  
- notification.service.spec.ts → 1 test  
- tableau-bord.service.spec.ts → 1 test  

Total services : 7 tests

Total général : 17 tests

