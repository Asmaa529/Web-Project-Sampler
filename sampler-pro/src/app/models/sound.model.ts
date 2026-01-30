export interface Sound {
  id: number;
  name: string;
  audioBuffer: AudioBuffer;
  startTime: number;
  endTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  volume: number;
  loop: boolean;
  category: string;
  activeNode?: AudioBufferSourceNode;
}