#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, enter_dir, remove_item])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use std::fs;
use std::{
    fmt::Display,
    path::{Path, PathBuf},
    time::{Duration, SystemTime},
};

use clean_clean_up::*;
use serde::Serialize;

#[tauri::command]
fn enter_dir(base_path: String) -> Vec<ProjectTargetAnalysis> {
    println!("rust enter_dir");
    let root_dir = base_path.as_str();
    let scan_path = Path::new(root_dir);

    let mut projects: Vec<_> = find_cargo_projects(scan_path, 0, true)
        .into_iter()
        .filter_map(|proj| proj.1.then(|| ProjectTargetAnalysis::analyze(&proj.0)))
        .collect();

    projects.sort_by_key(|proj| proj.size);

    println!("Result: {:?}", projects.len());

    projects
}

#[tauri::command]
fn remove_item(remove_path: String) -> Result<RemoveItemReturn, String> {
    println!("remove_item : {} ", remove_path);

    let process_result =
        remove_dir_all::remove_dir_all(PathBuf::from(remove_path.clone()).join("target"))
            .err()
            .map(|e| (remove_path.clone(), e));

    match process_result {
        Some((path, err)) => Err(format!("Err {:?} at {:?}", err, path).to_string()),
        None => Ok(RemoveItemReturn {
            result: true,
            message: "delete done !".to_string(),
        }),
    }
}
#[derive(Serialize)]
struct RemoveItemReturn {
    result: bool,
    message: String,
}
