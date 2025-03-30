import { List, Play, Trash2, Shuffle, Pause } from "lucide-react";
import { useStore } from "../store";
import { Song } from "../types";
import { useState } from "react";
import { useAudioPlayerContext } from "react-use-audio-player";
import { readFile } from "@tauri-apps/plugin-fs";
export function PlayList() {
  const { songs, currentSong, setSongs, setCurrentSong, handleNext } =
    useStore();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const { load, isPlaying } = useAudioPlayerContext();

  // 随机播放列表
  const shufflePlaylist = () => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    setSongs(shuffled);
  };

  // 清空播放列表
  const clearPlaylist = () => {
    setShowConfirmClear(true);
  };

  // 确认清空
  const confirmClear = () => {
    setSongs([]);
    setShowConfirmClear(false);
  };

  // 取消清空
  const cancelClear = () => {
    setShowConfirmClear(false);
  };

  // 播放指定歌曲
  const handlePlaySong = async (song: Song) => {
    if (isCurrentSong(song)) {
      return;
    }
    const buffer = await readFile(song.path);
    const url = URL.createObjectURL(new Blob([buffer]));
    setCurrentSong(song);
    load(url, {
      format: song.extension,
      autoplay: true,
      onend() {
        // 播放结束后释放内存
        URL.revokeObjectURL(url);
        handleNext();
      },
    });
  };

  // 检查当前歌曲是否正在播放
  const isCurrentSong = (song: Song) => {
    return currentSong && currentSong.path === song.path;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 播放列表标题 */}
      <div className="border-b border-zinc-800 px-3 py-1 flex justify-between items-center bg-zinc-900/70">
        <div className="flex items-center gap-1">
          <List size={14} className="text-purple-500" />
          <span className="text-xs font-medium">播放列表</span>
          <span className="text-xs text-zinc-500">({songs.length})</span>
        </div>
        <div className="flex gap-1">
          <button
            className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center gap-0.5"
            onClick={shufflePlaylist}
            disabled={songs.length === 0}
          >
            <Shuffle size={10} />
            随机
          </button>
          <button
            className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center gap-0.5"
            onClick={clearPlaylist}
            disabled={songs.length === 0}
          >
            <Trash2 size={10} />
            清空
          </button>
        </div>
      </div>

      {/* 确认清空弹窗 */}
      {showConfirmClear && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 w-64">
            <h3 className="text-sm font-medium mb-2">确认清空播放列表？</h3>
            <p className="text-xs text-zinc-400 mb-4">此操作不可撤销</p>
            <div className="flex justify-end gap-2">
              <button
                className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
                onClick={cancelClear}
              >
                取消
              </button>
              <button
                className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700"
                onClick={confirmClear}
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 播放列表 - 充满剩余空间 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p className="text-xs">播放列表为空</p>
            <p className="text-[10px] mt-1">请将音频文件添加到系统音频文件夹</p>
          </div>
        ) : (
          songs.map((song, index) => (
            <div
              key={song.path}
              className={`border-b border-zinc-800 hover:bg-zinc-900/50 ${
                isCurrentSong(song)
                  ? "bg-gradient-to-r from-purple-900/30 to-transparent"
                  : ""
              }`}
              onClick={() => handlePlaySong(song)}
            >
              <div className="flex items-center px-2 py-1.5 cursor-pointer">
                <div
                  className={`min-w-5 text-center text-xs ${
                    isCurrentSong(song) ? "text-purple-500" : "text-zinc-500"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 ml-1 min-w-0">
                  <div
                    className={`text-xs truncate ${
                      isCurrentSong(song) ? "font-medium" : ""
                    }`}
                  >
                    {song.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {song.artist || "未知艺术家"}
                  </div>
                </div>
                {isCurrentSong(song) && (
                  <div className="text-purple-500">
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
