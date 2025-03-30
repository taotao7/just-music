import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAudioPlayerContext } from "react-use-audio-player";
import { formatTime } from "../utils/format-time";
import { useStore } from "../store";
import { readFile } from "@tauri-apps/plugin-fs";
import { Song } from "../types";

export function PlayerControls() {
  const { currentSong, setShuffle, shuffle, songs, setCurrentSong } =
    useStore();
  const [pos, setPos] = useState(0);
  const frameRef = useRef<number>();

  // 使用增强的音频播放器
  const {
    load,
    duration,
    error,
    isLoading,
    setVolume,
    volume,
    isMuted,
    toggleMute,
    togglePlayPause,
    getPosition,
    isPlaying,
    seek,
  } = useAudioPlayerContext();

  useEffect(() => {
    if (error) {
      console.error("[ERROR] 音频播放错误:", error);
    }
  }, [error]);

  useEffect(() => {
    const animate = () => {
      setPos(getPosition());
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [getPosition]);

  // 优化后的切歌逻辑，减少冗余代码
  const selectAndPlaySong = (song: Song) => {
    if (!song) return;
    playCurrentSong(song);
  };

  // 获取随机歌曲（排除当前歌曲）
  const getRandomSong = () => {
    // 获取当前歌曲的索引
    const currentIndex = songs.findIndex((song) => song.id === currentSong?.id);

    // 如果只有一首歌曲或没有歌曲，返回null
    if (songs.length <= 1) return null;

    // 确保随机到不同的歌曲
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentIndex && songs.length > 1);

    return songs[randomIndex];
  };

  const handleNext = async () => {
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
  };

  const handlePrevious = () => {
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
  };

  const playCurrentSong = async (song: Song) => {
    const buffer = await readFile(song.path);
    const url = URL.createObjectURL(new Blob([buffer]));
    setCurrentSong(song);
    load(url, {
      format: song.extension,
      autoplay: true,
      onend() {
        // 播放结束后释放内存
        URL.revokeObjectURL(url);
      },
    });
  };
  // 监听错误状态
  return (
    <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-800 relative">
      <div className="flex justify-between items-center mb-1">
        <div className="truncate">
          <div className="text-sm font-medium truncate">
            {currentSong?.name || "未选择歌曲"}
          </div>
          <div className="text-xs text-zinc-400 truncate">
            {currentSong?.artist || "未知艺术家"}
          </div>
        </div>
        <div className="text-xs text-zinc-400 whitespace-nowrap ml-1">
          {formatTime(pos)} / {formatTime(duration)}
        </div>
      </div>

      {/* 进度条 - 带有填充背景 */}
      <div className="mb-2 relative h-2 cursor-pointer">
        {/* 背景条 */}
        <div className="absolute top-0 left-0 right-0 h-1 mt-0.5 bg-zinc-800 rounded-full"></div>
        {/* 填充条 */}
        <div
          className="absolute top-0 left-0 h-1 mt-0.5 bg-purple-500 rounded-full"
          style={{ width: `${duration ? (pos / duration) * 100 : 0}%` }}
        ></div>
        {/* 实际滑块 - 透明但负责滑动功能 */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={pos}
          step="0.1"
          onChange={(e) => {
            const newPos = parseFloat(e.target.value);
            seek(newPos);
            setPos(newPos);
          }}
          className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
          disabled={isLoading}
        />
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-between items-center">
        <button
          className={`text-zinc-400 hover:text-white`}
          disabled={isLoading}
          onClick={() => setShuffle(!shuffle)}
        >
          <Shuffle
            size={16}
            className={`${shuffle ? "text-purple-500" : ""}`}
          />
        </button>
        <button
          className="text-zinc-400 hover:text-white"
          disabled={isLoading}
          onClick={handlePrevious}
        >
          <SkipBack size={18} />
        </button>
        <button
          onClick={togglePlayPause}
          className={`bg-purple-500 rounded-full p-1.5 hover:bg-purple-600 transition-colors `}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>
        <button
          className="text-zinc-400 hover:text-white"
          disabled={isLoading}
          onClick={handleNext}
        >
          <SkipForward size={18} />
        </button>
        <div className="flex items-center gap-1">
          <button
            className={`text-zinc-400 hover:text-white flex-shrink-0 ${
              isMuted ? "text-red-500" : ""
            }`}
            onClick={() => toggleMute()}
            disabled={isLoading}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* 音量条 - 带有填充背景 */}
          <div className="relative w-16 h-4 cursor-pointer">
            {/* 背景条 */}
            <div className="absolute top-0 left-0 right-0 h-1 mt-1.5 bg-zinc-800 rounded-full"></div>
            {/* 填充条 */}
            <div
              className="absolute top-0 left-0 h-1 mt-1.5 bg-purple-500 rounded-full"
              style={{ width: `${volume * 100}%` }}
            ></div>
            {/* 实际滑块 - 透明但负责滑动功能 */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
