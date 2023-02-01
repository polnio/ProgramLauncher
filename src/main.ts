import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { SettingsManager } from "tauri-settings";

type Settings = {
  programPath: string;
};

const settingsManager = new SettingsManager<Settings>(
  {
    programPath: "",
  },
  {
    fileName: "settings",
  }
);

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;
let programPathEl: HTMLSpanElement | null;
let runButton: HTMLButtonElement | null;
let selectProgramButton: HTMLButtonElement | null;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

async function runProgram() {
  const programPath = await settingsManager.get("programPath");

  if (programPath.length === 0) {
    return;
  }
  await invoke("run_program", {
    path: programPath,
  });
  appWindow.close();
}

async function selectProgram() {
  const path = await open({
    multiple: false,
  });
  if (path === null) {
    return;
  }
  if (Array.isArray(path)) {
    if (path.length === 0) {
      saveProgramPath(path[0]);
    }
    return;
  }
  saveProgramPath(path);
}

async function saveProgramPath(path: string) {
  if (programPathEl !== null) {
    try {
      await settingsManager.set("programPath", path);
      programPathEl.textContent = path;
    } catch (error) {
      programPathEl.textContent = "Une erreur est survenue";
    }
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const settings = await settingsManager.initialize();
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  programPathEl = document.querySelector<HTMLSpanElement>("#program-path");
  runButton = document.querySelector<HTMLButtonElement>("button#run");
  selectProgramButton = document.querySelector<HTMLButtonElement>(
    "button#select-program"
  );

  if (programPathEl !== null) {
    programPathEl.textContent =
      settings.programPath.length > 0
        ? settings.programPath
        : "Aucun programme sélectionné";
  }

  runButton?.addEventListener("click", runProgram);
  selectProgramButton?.addEventListener("click", selectProgram);

  document
    .querySelector("#greet-button")
    ?.addEventListener("click", () => greet());
});
