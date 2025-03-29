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
import { useState, useRef, useEffect } from "react";
import { useStore } from "../store";
import { AudioPlayer } from "./audio-player";

export function PlayerControls() {
  const { currentSong, isPlaying } = useStore();
  const [shuffleMode, setShuffleMode] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7); // 存储静音前的音量
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  const progressContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);

  const {
    progress,
    volume,
    togglePlay,
    seek,
    seekEnd,
    changeVolume,
    playNext,
    playPrevious,
    currentTime,
    totalTime,
    isLoading,
    muted,
    toggleMute,
  } = AudioPlayer();

  // 确保组件卸载时调用seekEnd，避免内存泄漏
  useEffect(() => {
    return () => {
      if (isDraggingProgress) {
        seekEnd();
      }
    };
  }, [isDraggingProgress]);

  // 处理进度滑块拖动开始
  const handleProgressDragStart = () => {
    setIsDraggingProgress(true);
  };

  // 处理进度滑块拖动
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    seek(value, true); // 传入true表示正在拖动
  };

  // 处理进度滑块拖动结束
  const handleProgressDragEnd = () => {
    setIsDraggingProgress(false);
    seekEnd();
  };

  // 处理音量滑块拖动开始
  const handleVolumeDragStart = () => {
    setIsDraggingVolume(true);
  };

  // 处理音量调节
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    changeVolume(value);
    if (value > 0) {
      setPreviousVolume(value);
      if (muted) {
        toggleMute(false);
      }
    } else if (value === 0 && !muted) {
      toggleMute(true);
    }
  };

  // 处理音量滑块拖动结束
  const handleVolumeDragEnd = () => {
    setIsDraggingVolume(false);
  };

  // 点击进度条容器直接调整进度
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressContainerRef.current && !isLoading) {
      const rect = progressContainerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const containerWidth = rect.width;
      const percentage = (offsetX / containerWidth) * 100;
      seek(percentage); // 不在拖动中，直接跳转
    }
  };

  // 点击音量条容器直接调整音量
  const handleVolumeBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeContainerRef.current && !isLoading) {
      const rect = volumeContainerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const containerWidth = rect.width;
      const value = offsetX / containerWidth;
      const newVolume = Math.max(0, Math.min(1, value));

      changeVolume(newVolume);
      if (newVolume > 0) {
        setPreviousVolume(newVolume);
        if (muted) {
          toggleMute(false);
        }
      } else if (newVolume === 0 && !muted) {
        toggleMute(true);
      }
    }
  };

  // 静音切换
  const handleToggleMute = () => {
    if (muted) {
      // 恢复到之前的音量
      changeVolume(previousVolume);
      toggleMute(false);
    } else {
      // 记住当前音量并静音
      if (volume > 0) {
        setPreviousVolume(volume);
      }
      toggleMute(true);
    }
  };

  // 随机播放切换
  const toggleShuffle = () => {
    setShuffleMode(!shuffleMode);
  };

  return (
    <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-800">
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
          {currentTime} / {totalTime}
        </div>
      </div>

      {/* 进度条 - 带有填充背景 */}
      <div
        className="mb-2 relative h-2 cursor-pointer"
        ref={progressContainerRef}
        onClick={handleProgressBarClick}
      >
        {/* 背景条 */}
        <div className="absolute top-0 left-0 right-0 h-1 mt-0.5 bg-zinc-800 rounded-full"></div>
        {/* 填充条 */}
        <div
          className="absolute top-0 left-0 h-1 mt-0.5 bg-purple-500 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
        {/* 实际滑块 - 透明但负责滑动功能 */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onMouseDown={handleProgressDragStart}
          onTouchStart={handleProgressDragStart}
          onChange={handleProgressChange}
          onMouseUp={handleProgressDragEnd}
          onTouchEnd={handleProgressDragEnd}
          className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
          disabled={isLoading}
        />
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-between items-center">
        <button
          className={`text-zinc-400 hover:text-white ${
            shuffleMode ? "text-purple-500" : ""
          }`}
          onClick={toggleShuffle}
          disabled={isLoading}
        >
          <Shuffle size={16} />
        </button>
        <button
          className="text-zinc-400 hover:text-white"
          onClick={playPrevious}
          disabled={isLoading}
        >
          <SkipBack size={18} />
        </button>
        <button
          onClick={togglePlay}
          className="bg-purple-500 rounded-full p-1.5 hover:bg-purple-600 transition-colors"
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
          onClick={playNext}
          disabled={isLoading}
        >
          <SkipForward size={18} />
        </button>
        <div className="flex items-center gap-1">
          <button
            className={`text-zinc-400 hover:text-white flex-shrink-0 ${
              muted ? "text-red-500" : ""
            }`}
            onClick={handleToggleMute}
            disabled={isLoading}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* 音量条 - 带有填充背景 */}
          <div
            className="relative w-16 h-4 cursor-pointer"
            ref={volumeContainerRef}
            onClick={handleVolumeBarClick}
          >
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
              value={volume}
              onMouseDown={handleVolumeDragStart}
              onTouchStart={handleVolumeDragStart}
              onChange={handleVolumeChange}
              onMouseUp={handleVolumeDragEnd}
              onTouchEnd={handleVolumeDragEnd}
              className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
