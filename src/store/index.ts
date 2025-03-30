import { create } from "zustand";
import { Song } from "../types";

interface Store {
  audioDir: string;
  songs: Song[];
  currentSong: Song;
  isPlaying: boolean;
  shuffle: boolean;
}

interface StoreActions {
  setAudioDir: (dir: string) => void;
  setSongs: (songs: Song[]) => void;
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setShuffle: (shuffle: boolean) => void;
}

export const useStore = create<Store & StoreActions>((set) => ({
  audioDir: "",
  setAudioDir: (dir) => set({ audioDir: dir }),
  songs: [],
  setSongs: (songs) => set({ songs }),
  currentSong: {
    id: "",
    name: "",
    artist: "",
    path: "",
  },
  isPlaying: false,
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  shuffle: false,
  setShuffle: (shuffle) => set({ shuffle }),
}));
