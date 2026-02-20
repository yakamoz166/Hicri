
export enum CalendarType {
  HIJRI = 'Hicri',
  GREGORIAN = 'Miladi'
}

export interface EventDetail {
  date: string;
  description: string;
}

export interface NotableFigure {
  name: string;
  role: string;
  description: string;
}

export interface Resource {
  title: string;
  url: string;
}

export interface HistoricalInsight {
  year: number;
  type: CalendarType;
  events: EventDetail[];
  notableFigures: NotableFigure[];
  culturalSignificance: string;
  furtherReading: Resource[];
}
