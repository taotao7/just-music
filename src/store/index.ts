import { create } from "zustand";
import { CurrentSong, Song } from "../types";

interface Store {
  audioDir: string;
  songs: Song[];
  currentSong: CurrentSong;
  isPlaying: boolean;
}

interface StoreActions {
  setAudioDir: (dir: string) => void;
  setSongs: (songs: Song[]) => void;
  setCurrentSong: (song: CurrentSong) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useStore = create<Store & StoreActions>((set) => ({
  audioDir: "",
  setAudioDir: (dir) => set({ audioDir: dir }),
  songs: [],
  setSongs: (songs) => set({ songs }),
  currentSong: {
    id: "",
    name: "",
    current: "01:41",
    total: "04:43",
    path: "",
  },
  isPlaying: false,
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
