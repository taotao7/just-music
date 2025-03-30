import { create } from "zustand";
import { Song } from "../types";
import { persist } from "zustand/middleware";

interface Store {
  audioDir: string;
  songs: Song[];
  currentSong: Song;
  shuffle: boolean;
}

interface StoreActions {
  setAudioDir: (dir: string) => void;
  setSongs: (songs: Song[]) => void;
  setCurrentSong: (song: Song) => void;
  setShuffle: (shuffle: boolean) => void;
  handleNext: () => void;
  handlePrev: () => void;
  selectAndPlaySong: (song: Song) => void;
  getRandomSong: () => Song | null;
}

export const useStore = create<Store & StoreActions>()(
  persist(
    (set, get) => ({
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
      setCurrentSong: (song) => set({ currentSong: song }),
      shuffle: false,
      setShuffle: (shuffle) => set({ shuffle }),
      getRandomSong: () => {
        const { songs, currentSong } = get();
        const currentIndex = songs.findIndex(
          (song) => song.id === currentSong?.id
        );
        if (songs.length <= 1) return null;
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * songs.length);
        } while (randomIndex === currentIndex && songs.length > 1);

        return songs[randomIndex];
      },
      selectAndPlaySong: (song: Song) => {
        if (!song) return;
        set({ currentSong: song });
      },
      handleNext: async () => {
        const {
          songs,
          currentSong,
          shuffle,
          selectAndPlaySong,
          getRandomSong,
        } = get();
        if (shuffle) {
          const nextSong = getRandomSong();
          if (nextSong) selectAndPlaySong(nextSong);
        } else {
          const currentIndex = songs.findIndex(
            (song) => song.id === currentSong?.id
          );
          if (currentIndex < songs.length - 1) {
            selectAndPlaySong(songs[currentIndex + 1]);
          }
        }
      },
      handlePrev: async () => {
        const {
          songs,
          currentSong,
          shuffle,
          selectAndPlaySong,
          getRandomSong,
        } = get();
        if (shuffle) {
          const prevSong = getRandomSong();
          if (prevSong) selectAndPlaySong(prevSong);
        } else {
          const currentIndex = songs.findIndex(
            (song) => song.id === currentSong?.id
          );
          if (currentIndex > 0) {
            selectAndPlaySong(songs[currentIndex - 1]);
          }
        }
      },
    }),
    {
      name: "audio-player-storage",
    }
  )
);
