#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn run_program(path: &str) {
    println!("run program back");
    if cfg!(target_os = "windows") {
        println!("windows");
        Command::new("cmd")
            .args(["/C", path])
            .spawn()
            .expect("Failed to run the program. Check if the path is correct");
    } else {
        println!("not windows");
        Command::new("sh")
            .args(["-c", path])
            .spawn()
            .expect("Failed to run the program. Check if the path is correct");
    }
}

#[tauri::command]
fn log(message: &str, mode: Option<u8>) {
    match mode.unwrap_or(0) {
        0 => println!("LOG: {}", message),
        1 => eprintln!("Error: {}", message),
        _ => println!("LOG: {}", message),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, run_program, log])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
