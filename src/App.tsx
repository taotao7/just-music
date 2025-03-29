import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  X,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Shuffle,
  List,
} from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: "樱花草",
    artist: "Sweety",
    current: "01:41",
    total: "04:43",
  });

  const songs = [
    { title: "当你离开的时候", artist: "蔡健雅" },
    { title: "我们没有在一起", artist: "刘若英" },
    { title: "清新", artist: "许慧欣" },
    { title: "梦醒时分", artist: "陈淑桦" },
    { title: "我想大声告诉你", artist: "樊凡" },
    { title: "奔", artist: "孙燕姿" },
    { title: "永远的画面", artist: "张惠妹" },
    { title: "守着你到永久", artist: "樊凡" },
    { title: "好心分手", artist: "王力宏, 卢巧音" },
  ];

  const handleHide = () => {
    getCurrentWindow().hide();
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white">
      {/* 标题栏 */}
      <div
        className="flex justify-between items-center px-2 py-1.5 bg-black border-b border-zinc-800"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-1" data-tauri-drag-region>
          <Music size={14} className="text-purple-500" />
          <span className="text-xs font-medium text-white">SONIQUE</span>
        </div>
        <button
          onClick={handleHide}
          className="p-0.5 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X size={14} className="text-zinc-400 hover:text-white" />
        </button>
      </div>

      {/* 紧凑播放控制区 */}
      <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-800">
        <div className="flex justify-between items-center mb-1">
          <div className="truncate">
            <div className="text-sm font-medium truncate">
              {currentSong.title}
            </div>
            <div className="text-xs text-zinc-400 truncate">
              {currentSong.artist}
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

      {/* 播放列表标题 */}
      <div className="border-b border-zinc-800 px-3 py-1 flex justify-between items-center bg-zinc-900/70">
        <div className="flex items-center gap-1">
          <List size={14} className="text-purple-500" />
          <span className="text-xs font-medium">播放列表</span>
          <span className="text-xs text-zinc-500">({songs.length})</span>
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
                {currentSong.title}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {currentSong.artist}
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
                <div className="text-xs truncate">{song.title}</div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {song.artist}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
