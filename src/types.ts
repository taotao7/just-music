export interface Song {
  name: string;
  path: string;
}

export interface CurrentSong extends Song {
  id: string;
  name: string;
  path: string;
  current: string;
  total: string;
}
