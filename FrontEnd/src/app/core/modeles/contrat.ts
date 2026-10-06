export type ConsommationMensuelle = {
  month: string;
  value: number;
};

export type Facture = {
  reference: string;
  amount: number;
  date: string;
};

export type Contrat = {
  id: string;
  userId: string;
  reference: string;
  name: string;
  activity: string;
  subscriptionDate: string;
  address: string;
  consumptions: ConsommationMensuelle[];
  invoices: Facture[];
  nextInvoiceEstimate: number;
};
export type FactureHistorique = Facture & {
  contractName: string;
  contractReference: string;
};
