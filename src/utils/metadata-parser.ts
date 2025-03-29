import * as mm from "music-metadata";
import { readFile } from "@tauri-apps/plugin-fs";
import { basename } from "@tauri-apps/api/path";

export interface AudioMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number;
}

export async function parseMetadata(filePath: string): Promise<AudioMetadata> {
  try {
    // 读取文件数据
    const fileData = await readFile(filePath);

    // 提取文件名（不带扩展名）作为备用标题
    const fileName = await basename(filePath);

    try {
      // 解析元数据 - 使用 music-metadata 库
      const metadata = await mm.parseBuffer(fileData);
      console.log(metadata);

      // 提取所需信息
      return {
        title: metadata.common.title || fileName,
        artist: metadata.common.artist || "未知艺术家",
        album: metadata.common.album || "未知专辑",
        duration: metadata.format.duration || 0,
      };
    } catch (metadataError) {
      console.error("解析音频元数据失败:", metadataError);

      // 如果元数据解析失败，返回基本信息
      return {
        title: fileName,
        artist: "未知艺术家",
        album: "未知专辑",
        duration: 0,
      };
    }
  } catch (fileError) {
    console.error("读取音频文件失败:", fileError);
    throw fileError;
  }
}
