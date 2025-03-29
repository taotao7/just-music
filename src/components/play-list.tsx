import { List, Play } from "lucide-react";
import { Song } from "../types";

interface PlayListProps {
  songs: Song[];
  currentSong: Song;
}

export function PlayList({ songs, currentSong }: PlayListProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 播放列表标题 */}
      <div className="border-b border-zinc-800 px-3 py-1 flex justify-between items-center bg-zinc-900/70">
        <div className="flex items-center gap-1">
          <List size={14} className="text-purple-500" />
          <span className="text-xs font-medium">播放列表</span>
          <span className="text-xs text-zinc-500">({songs.length + 1})</span>
        </div>
        <div className="flex gap-1">
          <button className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700">
            随机
          </button>
          <button className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700">
            清空
          </button>
        </div>
      </div>

      {/* 播放列表 - 充满剩余空间 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="bg-gradient-to-r from-purple-900/30 to-transparent border-b border-zinc-800">
          <div className="flex items-center px-2 py-1.5">
            <div className="min-w-5 text-center text-purple-500 text-xs">1</div>
            <div className="flex-1 ml-1 mr-1 min-w-0">
              <div className="text-xs font-medium truncate">
                {currentSong.name}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {currentSong.name}
              </div>
            </div>
            <div className="text-purple-500">
              <Play size={12} />
            </div>
          </div>
        </div>

        {songs.map((song, index) => (
          <div
            key={index}
            className="border-b border-zinc-800 hover:bg-zinc-900/50"
          >
            <div className="flex items-center px-2 py-1.5">
              <div className="min-w-5 text-center text-zinc-500 text-xs">
                {index + 2}
              </div>
              <div className="flex-1 ml-1 min-w-0">
                <div className="text-xs truncate">{song.name}</div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {song.name}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
