export interface Song {
  id: string;
  name: string;
  path: string;
  artist: string;
  album?: string;
  duration?: number;
}
