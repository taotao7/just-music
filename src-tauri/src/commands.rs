// 命令模块，包含所有 Tauri 命令实现

// 问候命令
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 这里可以添加更多命令
