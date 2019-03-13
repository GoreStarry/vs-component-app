const vscode = require("vscode");
const ccarc = require("create-component-app").default;
const defaultConfig = {
  type: "class",
  jsExtension: "js",
  cssExtension: "css",
  cssModule: true,
  includeTests: false,
  includeStories: false,
  includeCosmos: false,
  indexFile: false,
  connected: false,
  componentMethods: [],
};

const UXtoolSelections = ["no UX tools", "Cosmos", "Storybooks"];

/**
 * Get the config options from settings preference and merge with the default options.
 * @param {string} path of destination.
 */
function getConfig(path) {
  return new Promise(async (resolve, reject) => {
    const { ccarc } = vscode.workspace.getConfiguration();

    try {
      const name = await vscode.window.showInputBox({
        value: "ComponentName",
      });

      if (!name) {
        reject("Name is undefined");
      }

      const cssModule = await vscode.window.showQuickPick([
        "CSS module",
        "Not CSS module",
        "No Style",
      ]);

      const uxTool = await vscode.window.showQuickPick([
        "no UX tools",
        "Cosmos",
        "Storybooks",
      ]);

      // const locale = await vscode.window.showQuickPick([
      //   "No locale file",
      //   "add locale",
      // ]);

      const redux_connected = await vscode.window.showQuickPick([
        "Not Connected",
        "Connected",
      ]);

      const test = await vscode.window.showQuickPick(["No Test", "Test File"]);

      const config = Object.assign({ path, name }, defaultConfig, ccarc, {
        cssExtension:
          cssModule === "No Style"
            ? false
            : ccarc.cssExtension || defaultConfig.cssExtension,
        cssModule: cssModule === "CSS module",
        includeTests: test === "Test File",
        includeStories: uxTool === "Storybooks",
        includeCosmos: uxTool === "Cosmos",
        connected: redux_connected === "Connected",
      });
      resolve(config);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get the config and create the components base on config
 * @param {object} event from vscode.commands.registerCommand
 */
function createComponent(e) {
  const path = e.toJSON().fsPath;
  getConfig(path).then(
    config => {
      if (config.type === "custom") {
        ccarc.generateFilesFromCustom(config);
      }

      ccarc.generateFiles(config);
    },
    error => {
      vscode.window.showErrorMessage(error);
    }
  );
}

// this method is called when your extension is activated
function activate(context) {
  try {
    const disposable = vscode.commands.registerCommand(
      "extension.create-component-app",
      createComponent
    );

    context.subscriptions.push(disposable);
  } catch (error) {
    console.log(error);
  }
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
