import { useEffect } from "react";
import { TitleBar } from "./components/title-bar";
import { PlayerControls } from "./components/player-controls";
import { PlayList } from "./components/play-list";
import { readDir, readFile } from "@tauri-apps/plugin-fs";
import { audioDir, join, basename } from "@tauri-apps/api/path";
import { useStore } from "./store";
import { parseMetadata } from "./utils/metadata-parser";
import { useAudioPlayerContext } from "react-use-audio-player";

function App() {
  const { setSongs, currentSong, setCurrentSong } = useStore();
  const { load } = useAudioPlayerContext();

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

            // 处理每个音频文件，创建完整路径和读取元数据
            const audioFiles = await Promise.all(
              audioFileEntries.map(async (entry: any) => {
                try {
                  // 创建完整文件路径
                  const filePath = await join(path, entry.name);

                  // 读取元数据
                  const metadata = await parseMetadata(filePath);

                  // 创建歌曲对象
                  return {
                    id: filePath, // 使用文件路径作为唯一标识
                    name: metadata.title,
                    path: filePath,
                    artist: metadata.artist,
                    album: metadata.album,
                    duration: metadata.duration,
                    extension: entry.name.split(".").pop(),
                  };
                } catch (error) {
                  // 元数据读取失败，使用基本信息
                  console.error(`无法读取 ${entry.name} 的元数据:`, error);
                  const filePath = await join(path, entry.name);
                  const fileName = await basename(entry.name);

                  return {
                    id: filePath,
                    name: fileName,
                    path: filePath,
                    artist: "未知艺术家",
                    album: "未知专辑",
                    duration: 0,
                  };
                }
              })
            );

            // 设置歌曲列表
            setSongs(audioFiles);

            // 如果有歌曲且当前没有选中歌曲，则设置第一首为当前歌曲
            if (audioFiles.length > 0 && !currentSong?.id) {
              setCurrentSong(audioFiles[0]);
              const buffer = await readFile(audioFiles[0].path);
              const url = URL.createObjectURL(new Blob([buffer]));
              load(url, {
                format: audioFiles[0].extension,
                autoplay: false,
              });
            }
          })
          .catch((err) => console.error("读取音频目录失败:", err));
      })
      .catch((err) => console.error("获取音频目录失败:", err));
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white">
      <TitleBar />
      <PlayerControls />
      <PlayList />
    </div>
  );
}

export default App;
