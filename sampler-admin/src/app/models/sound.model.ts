export interface Sound {
  id: number;
  name: string;
  category: string;
  startTime: number;
  endTime: number;
  playbackSpeed: number;
  volume: number;
  loop: boolean;
  url?: string;
}