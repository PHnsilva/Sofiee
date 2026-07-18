use serde::{Deserialize, Serialize};
use std::{env, path::PathBuf, process::Command};

const MAX_GIT_OUTPUT_BYTES: usize = 8_000;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
enum AllowedApp {
    Browser,
    Spotify,
    Vscode,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", deny_unknown_fields)]
enum DesktopAction {
    OpenApp {
        #[serde(rename = "appId")]
        app_id: AllowedApp,
    },
    OpenProject {},
    GitStatus {},
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BridgeResult {
    message: String,
    output: Option<String>,
    success: bool,
}

#[tauri::command]
async fn execute_desktop_action(action: DesktopAction) -> Result<BridgeResult, String> {
    tauri::async_runtime::spawn_blocking(move || execute_action(action))
        .await
        .map_err(|_| "A bridge desktop não conseguiu concluir a ação.".to_owned())?
}

fn execute_action(action: DesktopAction) -> Result<BridgeResult, String> {
    match action {
        DesktopAction::OpenApp { app_id } => open_allowed_app(app_id),
        DesktopAction::OpenProject {} => open_project(),
        DesktopAction::GitStatus {} => git_status(),
    }
}

fn configured_project_path() -> Result<PathBuf, String> {
    let configured = env::var_os("SOFIIE_PROJECT_PATH")
        .ok_or_else(|| "SOFIIE_PROJECT_PATH não está configurado na bridge.".to_owned())?;
    let path = PathBuf::from(configured)
        .canonicalize()
        .map_err(|_| "O projeto configurado não pôde ser localizado.".to_owned())?;
    if !path.is_dir() {
        return Err("O projeto configurado não é uma pasta válida.".to_owned());
    }
    Ok(path)
}

fn git_status() -> Result<BridgeResult, String> {
    let project = configured_project_path()?;
    let output = Command::new("git")
        .args(["status", "--short", "--branch"])
        .current_dir(project)
        .output()
        .map_err(|_| "Git não está disponível neste dispositivo.".to_owned())?;

    if !output.status.success() {
        return Err("Não foi possível consultar o repositório configurado.".to_owned());
    }

    let mut status = String::from_utf8_lossy(&output.stdout).trim().to_owned();
    if status.len() > MAX_GIT_OUTPUT_BYTES {
        let mut boundary = MAX_GIT_OUTPUT_BYTES;
        while !status.is_char_boundary(boundary) {
            boundary -= 1;
        }
        status.truncate(boundary);
    }
    if status.is_empty() {
        status = "Árvore de trabalho limpa.".to_owned();
    }

    Ok(BridgeResult {
        message: "Git status concluído.".to_owned(),
        output: Some(status),
        success: true,
    })
}

#[cfg(target_os = "windows")]
fn open_allowed_app(app_id: AllowedApp) -> Result<BridgeResult, String> {
    let (label, program, arguments): (&str, &str, &[&str]) = match app_id {
        AllowedApp::Browser => (
            "Navegador",
            "rundll32.exe",
            &["url.dll,FileProtocolHandler", "https://www.google.com"],
        ),
        AllowedApp::Spotify => ("Spotify", "explorer.exe", &["spotify:"]),
        AllowedApp::Vscode => ("VS Code", "explorer.exe", &["vscode://"]),
    };
    Command::new(program)
        .args(arguments)
        .spawn()
        .map_err(|_| format!("{label} não pôde ser aberto."))?;
    Ok(opened_result(label))
}

#[cfg(target_os = "macos")]
fn open_allowed_app(app_id: AllowedApp) -> Result<BridgeResult, String> {
    let (label, arguments): (&str, &[&str]) = match app_id {
        AllowedApp::Browser => ("Navegador", &["https://www.google.com"]),
        AllowedApp::Spotify => ("Spotify", &["-a", "Spotify"]),
        AllowedApp::Vscode => ("VS Code", &["-a", "Visual Studio Code"]),
    };
    Command::new("open")
        .args(arguments)
        .spawn()
        .map_err(|_| format!("{label} não pôde ser aberto."))?;
    Ok(opened_result(label))
}

#[cfg(target_os = "linux")]
fn open_allowed_app(app_id: AllowedApp) -> Result<BridgeResult, String> {
    let (label, program, arguments): (&str, &str, &[&str]) = match app_id {
        AllowedApp::Browser => ("Navegador", "xdg-open", &["https://www.google.com"]),
        AllowedApp::Spotify => ("Spotify", "spotify", &[]),
        AllowedApp::Vscode => ("VS Code", "code", &[]),
    };
    Command::new(program)
        .args(arguments)
        .spawn()
        .map_err(|_| format!("{label} não pôde ser aberto."))?;
    Ok(opened_result(label))
}

fn open_project() -> Result<BridgeResult, String> {
    let project = configured_project_path()?;

    #[cfg(target_os = "windows")]
    let mut command = Command::new("explorer.exe");
    #[cfg(target_os = "macos")]
    let mut command = Command::new("open");
    #[cfg(target_os = "linux")]
    let mut command = Command::new("xdg-open");

    command
        .arg(project)
        .spawn()
        .map_err(|_| "A pasta do projeto não pôde ser aberta.".to_owned())?;
    Ok(opened_result("Projeto configurado"))
}

fn opened_result(label: &str) -> BridgeResult {
    BridgeResult {
        message: format!("{label} aberto pela bridge local."),
        output: None,
        success: true,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![execute_desktop_action])
        .run(tauri::generate_context!())
        .expect("error while running Sofiie desktop");
}

#[cfg(test)]
mod tests {
    use super::DesktopAction;

    #[test]
    fn rejects_unknown_action_fields() {
        let action =
            serde_json::from_str::<DesktopAction>(r#"{"type":"git_status","command":"git push"}"#);

        assert!(action.is_err());
    }

    #[test]
    fn rejects_non_allowlisted_applications() {
        let action =
            serde_json::from_str::<DesktopAction>(r#"{"type":"open_app","appId":"powershell"}"#);

        assert!(action.is_err());
    }
}
