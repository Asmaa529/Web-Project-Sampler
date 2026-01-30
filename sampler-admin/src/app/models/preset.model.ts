import { Sound } from './sound.model';

export interface Preset {
  name: string;
  category: string;
  samples: Sound[];
}