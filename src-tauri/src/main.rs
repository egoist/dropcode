#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::Path;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn path_exists(path: &str) -> bool {
    let path = Path::new(path);
    path.exists()
}

#[tauri::command]
async fn show_main_window(window: tauri::Window) {
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            path_exists,
            show_main_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
