import { Music, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import { platform } from "@tauri-apps/plugin-os";

export function TitleBar() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // 检测操作系统类型
    const checkPlatform = async () => {
      try {
        const currentPlatform = platform();
        setIsMac(currentPlatform === "macos");
      } catch (error) {
        console.error("检测操作系统失败", error);
      }
    };

    checkPlatform();
  }, []);

  const handleHide = () => {
    getCurrentWindow().hide();
  };

  return (
    <div
      className="flex justify-between items-center px-2 py-1.5 bg-black border-b border-zinc-800"
      data-tauri-drag-region
    >
      {isMac ? (
        // Mac 系统布局 - 关闭按钮在左侧
        <>
          <div className="flex items-center gap-2" data-tauri-drag-region>
            <button
              onClick={handleHide}
              className="p-0.5 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none"
              aria-label="Close"
            >
              <X size={14} className="text-zinc-400 hover:text-white" />
            </button>
            <Music size={14} className="text-purple-500" />
            <span className="text-xs font-medium text-white">Just Music</span>
          </div>
          <div data-tauri-drag-region />
        </>
      ) : (
        // 默认布局 (Windows/Linux) - 关闭按钮在右侧
        <>
          <div className="flex items-center gap-1" data-tauri-drag-region>
            <Music size={14} className="text-purple-500" />
            <span className="text-xs font-medium text-white">Just Music</span>
          </div>
          <button
            onClick={handleHide}
            className="p-0.5 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none"
            aria-label="Close"
          >
            <X size={14} className="text-zinc-400 hover:text-white" />
          </button>
        </>
      )}
    </div>
  );
}
