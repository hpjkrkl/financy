use tauri::Manager;
use base64::Engine;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      app.handle().plugin(tauri_plugin_store::Builder::new().build())?;
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![save_receipt_image])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn save_receipt_image(image_base64: String, filename: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_data_dir = app_handle.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    let receipts_dir = app_data_dir.join("receipts");
    std::fs::create_dir_all(&receipts_dir)
        .map_err(|e| format!("Failed to create receipts directory: {}", e))?;

    let file_path = receipts_dir.join(&filename);
    let image_data = base64::engine::general_purpose::STANDARD.decode(&image_base64)
        .map_err(|e| format!("Failed to decode base64 image: {}", e))?;

    std::fs::write(&file_path, image_data)
        .map_err(|e| format!("Failed to write image file: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}
