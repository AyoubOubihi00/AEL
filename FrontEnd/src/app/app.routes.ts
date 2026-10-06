import { Routes } from '@angular/router';
import { ConnexionPageComponent } from './pages/connexion/connexion-page.component';
import { CreationComptePageComponent } from './pages/creation-compte/creation-compte-page.component';
import { TableauBordPageComponent } from './pages/tableau-bord/tableau-bord-page.component';
import { ContratPageComponent } from './pages/contrat/contrat-page.component';
import { gardeAuthentification } from './core/gardes/garde-authentification';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'connexion' },
  { path: 'connexion', component: ConnexionPageComponent },
  { path: 'inscription', component: CreationComptePageComponent },
  {
    path: 'tableau-bord',
    component: TableauBordPageComponent,
    canActivate: [gardeAuthentification],
  },
  {
    path: 'contrats/:id',
    component: ContratPageComponent,
    canActivate: [gardeAuthentification],
  },
  { path: '**', redirectTo: 'connexion' },
];
