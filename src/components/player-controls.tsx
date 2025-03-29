import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Volume2,
} from "lucide-react";
import { CurrentSong } from "../types";

interface PlayerControlsProps {
  isPlaying: boolean;
  currentSong: CurrentSong;
  togglePlay: () => void;
}

export function PlayerControls({
  isPlaying,
  currentSong,
  togglePlay,
}: PlayerControlsProps) {
  return (
    <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-800">
      <div className="flex justify-between items-center mb-1">
        <div className="truncate">
          <div className="text-sm font-medium truncate">{currentSong.name}</div>
          <div className="text-xs text-zinc-400 truncate">
            {currentSong.name}
          </div>
        </div>
        <div className="text-xs text-zinc-400 whitespace-nowrap ml-1">
          {currentSong.current} / {currentSong.total}
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-2">
        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
          <div className="bg-purple-500 h-1 rounded-full w-[35%]"></div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-between items-center">
        <button className="text-zinc-400 hover:text-white">
          <Shuffle size={16} />
        </button>
        <button className="text-zinc-400 hover:text-white">
          <SkipBack size={18} />
        </button>
        <button
          onClick={togglePlay}
          className="bg-purple-500 rounded-full p-1.5 hover:bg-purple-600 transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button className="text-zinc-400 hover:text-white">
          <SkipForward size={18} />
        </button>
        <div className="flex items-center">
          <Volume2 size={16} className="text-zinc-400 mr-1" />
          <div className="w-12 bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-1 rounded-full w-[70%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
