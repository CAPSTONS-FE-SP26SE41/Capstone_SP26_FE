export interface Promotion {
  title: string;
  description: string;
  terms?: string;
}

export interface Ad {
  adId: string;
  poiId: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  startDate: string;
  endDate: string;
  promotion?: Promotion;
  status?: string;
}
