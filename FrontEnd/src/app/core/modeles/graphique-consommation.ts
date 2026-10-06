export type SerieConsommation = {
  label: string;
  data: number[];
};

export type GraphiqueConsommation = {
  labels: string[];
  series: SerieConsommation[];
};
