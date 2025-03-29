import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { formatTime } from "../utils/format-time";
import { useStore } from "../store";
import { Song } from "../types";
import { readFile } from "@tauri-apps/plugin-fs";

export function AudioPlayer() {
  const { songs, currentSong, setCurrentSong, isPlaying, setIsPlaying } =
    useStore();

  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [formattedCurrentTime, setFormattedCurrentTime] = useState("00:00");
  const [formattedTotalTime, setFormattedTotalTime] = useState("00:00");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [seekToTime, setSeekToTime] = useState<number | null>(null);

  const soundRef = useRef<Howl | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const lastBlobUrlRef = useRef<string | null>(null);

  // 读取音频文件并创建 Blob
  useEffect(() => {
    async function loadAudioFile() {
      if (currentSong && currentSong.path) {
        setIsLoading(true);
        try {
          // 读取文件数据
          const fileData = await readFile(currentSong.path);
          // 创建 Blob 对象
          const blob = new Blob([fileData], {
            type: getAudioMimeType(currentSong.path),
          });
          setAudioBlob(blob);
        } catch (error) {
          console.error("读取音频文件失败:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadAudioFile();
  }, [currentSong?.path]);

  // 组件卸载时设置状态
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // 清理上一个音频实例和 Blob URL
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
      }

      if (lastBlobUrlRef.current) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
      }
    };
  }, []);

  // 获取音频 MIME 类型
  const getAudioMimeType = (filePath: string): string => {
    const extension = filePath.toLowerCase().split(".").pop() || "";
    switch (extension) {
      case "mp3":
        return "audio/mpeg";
      case "wav":
        return "audio/wav";
      case "ogg":
        return "audio/ogg";
      case "flac":
        return "audio/flac";
      case "m4a":
        return "audio/mp4";
      default:
        return "audio/mpeg";
    }
  };

  // 当 Blob 准备好时创建并加载音频
  useEffect(() => {
    if (audioBlob && currentSong) {
      // 如果有正在播放的音频，先停止并销毁
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      }

      // 如果有上一个 Blob URL，先回收
      if (lastBlobUrlRef.current) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
      }

      // 创建 Blob URL
      const blobUrl = URL.createObjectURL(audioBlob);
      lastBlobUrlRef.current = blobUrl;

      // 创建新的音频实例
      const sound = new Howl({
        src: [blobUrl],
        html5: true,
        volume: volume,
        format: [currentSong.path.split(".").pop() || "mp3"],
        onload: () => {
          const totalDuration = sound.duration();
          setDuration(totalDuration);
          setFormattedTotalTime(formatTime(totalDuration));
          setFormattedCurrentTime("00:00");

          // 确保静音状态正确应用
          sound.mute(muted);
        },
        onplay: () => {
          setIsPlaying(true);
          startProgressAnimation();
        },
        onpause: () => {
          setIsPlaying(false);
          stopProgressAnimation();
        },
        onstop: () => {
          setIsPlaying(false);
          stopProgressAnimation();
        },
        onend: () => {
          playNext();
        },
        onloaderror: (id, error) => {
          console.error("加载音频失败:", error, id);
        },
      });

      soundRef.current = sound;

      // 自动播放
      if (isPlaying) {
        sound.play();
      }

      // 清理函数
      return () => {
        if (soundRef.current) {
          soundRef.current.stop();
          soundRef.current.unload();
        }
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        // URL 回收在组件卸载或者下一次加载音频时处理
      };
    }
  }, [audioBlob]);

  // 处理拖动结束后的跳转
  useEffect(() => {
    if (!isDragging && seekToTime !== null && soundRef.current) {
      soundRef.current.seek(seekToTime);
      setSeekToTime(null);
    }
  }, [isDragging, seekToTime]);

  // 监听音量变化
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  // 监听静音状态变化
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.mute(muted);
    }
  }, [muted]);

  // 监听播放状态变化
  useEffect(() => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.play();
      } else {
        soundRef.current.pause();
      }
    }
  }, [isPlaying]);

  // 使用requestAnimationFrame更新进度
  const updateProgress = () => {
    if (!soundRef.current || !isMountedRef.current || isDragging) return;

    if (soundRef.current.playing()) {
      const seconds = soundRef.current.seek();
      if (typeof seconds === "number") {
        setProgress((seconds / duration) * 100 || 0);
        setFormattedCurrentTime(formatTime(seconds));
      }

      // 继续请求下一帧
      rafIdRef.current = requestAnimationFrame(updateProgress);
    }
  };

  // 开始进度动画
  const startProgressAnimation = () => {
    stopProgressAnimation(); // 先停止之前的动画
    rafIdRef.current = requestAnimationFrame(updateProgress);
  };

  // 停止进度动画
  const stopProgressAnimation = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  // 播放/暂停
  const togglePlay = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  // 跳转到指定时间 - 现在支持拖动模式
  const seek = (value: number, isDraggingNow = false) => {
    if (!soundRef.current) return;

    setProgress(value);
    const seconds = (value / 100) * duration;
    setFormattedCurrentTime(formatTime(seconds));

    // 如果是拖动中，只记录目标时间，不立即跳转
    if (isDraggingNow) {
      setIsDragging(true);
      setSeekToTime(seconds);
    } else {
      // 如果不是拖动，或者是拖动结束，立即跳转
      setIsDragging(false);
      soundRef.current.seek(seconds);
    }
  };

  // 拖动结束
  const seekEnd = () => {
    setIsDragging(false);
  };

  // 更改音量
  const changeVolume = (value: number) => {
    setVolume(value);

    // 当设置音量时，确保直接应用到当前的Howl实例
    if (soundRef.current) {
      soundRef.current.volume(value);
    }
  };

  // 设置静音状态
  const toggleMute = (muteState: boolean) => {
    setMuted(muteState);
    if (soundRef.current) {
      soundRef.current.mute(muteState);
    }
  };

  // 播放下一首
  const playNext = () => {
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex(
      (song) => song.path === currentSong.path
    );
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];

    if (nextSong) {
      setCurrentSong({
        id: nextSong.path,
        name: nextSong.name,
        path: nextSong.path,
        artist: nextSong.artist || "未知艺术家",
      });
    }
  };

  // 播放上一首
  const playPrevious = () => {
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex(
      (song) => song.path === currentSong.path
    );
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];

    if (prevSong) {
      setCurrentSong({
        id: prevSong.path,
        name: prevSong.name,
        path: prevSong.path,
        artist: prevSong?.artist || "未知艺术家",
      });
    }
  };

  // 播放指定歌曲
  const playSong = (song: Song) => {
    setCurrentSong({
      id: song.path,
      name: song.name,
      path: song.path,
      artist: song.artist || "未知艺术家",
    });
    setIsPlaying(true);
  };

  return {
    progress,
    volume,
    togglePlay,
    seek,
    seekEnd,
    changeVolume,
    playNext,
    playPrevious,
    playSong,
    currentTime: formattedCurrentTime,
    totalTime: formattedTotalTime,
    isLoading,
    muted,
    toggleMute,
  };
}
