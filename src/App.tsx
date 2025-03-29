import { useEffect } from "react";
import { TitleBar } from "./components/title-bar";
import { PlayerControls } from "./components/player-controls";
import { PlayList } from "./components/play-list";
import { DirEntry, readDir } from "@tauri-apps/plugin-fs";
import { audioDir, join } from "@tauri-apps/api/path";
import { useStore } from "./store";

function App() {
  const {
    songs,
    setSongs,
    currentSong,
    setCurrentSong,
    isPlaying,
    setIsPlaying,
  } = useStore();

  useEffect(() => {
    // 读取音频目录
    audioDir()
      .then((path) => {
        readDir(path)
          .then(async (entries: any) => {
            // 获取目录下所有文件
            const audioFileEntries = entries.filter((entry: any) => {
              // 筛选音频文件 (可根据需要添加更多格式)
              if (!entry.isDirectory && entry.name) {
                const fileName = entry.name.toLowerCase();
                return (
                  fileName.endsWith(".mp3") ||
                  fileName.endsWith(".wav") ||
                  fileName.endsWith(".flac") ||
                  fileName.endsWith(".ogg") ||
                  fileName.endsWith(".m4a")
                );
              }
              return false;
            });

            // 处理每个音频文件，创建完整路径
            const audioFiles = await Promise.all(
              audioFileEntries.map(async (entry: any) => {
                // 创建歌曲对象
                const filePath = await join(path, entry.name);
                return {
                  id: filePath, // 使用文件路径作为唯一标识
                  name: entry.name,
                  path: filePath,
                  artist: "未知艺术家", // 可以后续添加元数据提取功能
                };
              })
            );

            console.log("找到音频文件:", audioFiles);
            // 设置歌曲列表
            setSongs(audioFiles);

            // 如果有歌曲且当前没有选中歌曲，则设置第一首为当前歌曲
            if (audioFiles.length > 0 && !currentSong) {
              setCurrentSong(audioFiles[0]);
            }
          })
          .catch((err) => console.error("读取音频目录失败:", err));
      })
      .catch((err) => console.error("获取音频目录失败:", err));
  }, [currentSong, setCurrentSong, setSongs]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white">
      <TitleBar />
      <PlayerControls
        isPlaying={isPlaying}
        currentSong={currentSong}
        togglePlay={togglePlay}
      />
      <PlayList songs={songs} currentSong={currentSong} />
    </div>
  );
}

export default App;
