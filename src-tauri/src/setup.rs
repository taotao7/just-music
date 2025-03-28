use std::error::Error;
use tauri::Manager;

use crate::tray;

pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    // 开发工具设置
    #[cfg(debug_assertions)]
    {
        let window = app.get_webview_window("main").unwrap();
        window.open_devtools();
        window.close_devtools();
    }

    // 监听窗口关闭事件，改为隐藏而不是退出
    if let Some(window) = app.get_webview_window("main") {
        // 克隆 window 用于在闭包中使用
        let window_clone = window.clone();

        window.on_window_event(move |event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // 阻止窗口关闭
                api.prevent_close();
                // 仅隐藏窗口
                let _ = window_clone.hide();
            }
        });
    }

    // 设置系统托盘
    tray::setup_tray(app.app_handle())?;

    Ok(())
}
