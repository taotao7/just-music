use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::Manager;

pub fn setup_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    // 创建托盘菜单项
    let show_i = MenuItem::with_id(app, "show", "显示", true, None::<&str>)?;
    let hide_i = MenuItem::with_id(app, "hide", "隐藏", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

    // 创建包含多个选项的菜单
    let menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])?;

    let _ = TrayIconBuilder::new()
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => {
                println!("左键点击托盘图标");
                // 显示并聚焦主窗口
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    // 检查窗口是否可见
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                        println!("窗口已隐藏");
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                        println!("窗口已显示并聚焦");
                    }
                }
            }
            _ => {
                println!("未处理的事件 {event:?}");
            }
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                println!("显示菜单项被点击");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "hide" => {
                println!("隐藏菜单项被点击");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
            "quit" => {
                println!("退出菜单项被点击");
                app.exit(0);
            }
            _ => {
                println!("菜单项 {:?} 未处理", event.id);
            }
        })
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("子弹之刃")
        .menu(&menu)
        .build(app)
        .unwrap();

    Ok(())
}
