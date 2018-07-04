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
  return new Promise((resolve, reject) => {
    const { ccarc } = vscode.workspace.getConfiguration();

    vscode.window.showInputBox({ value: "ComponentName" }).then(name => {
      if (!name) {
        reject("Name is undefined");
      }

      vscode.window
        .showQuickPick(["CSS module", "No CSS module"])
        .then(cssModule => {
          vscode.window.showQuickPick(UXtoolSelections).then(UXtool => {
            if (!UXtool) {
              reject("UXtool is undefined");
            }

            vscode.window
              .showQuickPick(["No locale file", "add locale"])
              .then(locale => {
                if (!locale) {
                  reject("locale is undefined");
                }
                vscode.window
                  .showQuickPick(["Not Connected", "Connected"])
                  .then(connected => {
                    let ConfigPick = {};

                    if (cssModule === "No CSS module") {
                      ConfigPick.cssModule = false;
                    }

                    if (UXtool === "Storybooks") {
                      ConfigPick.includeStories = true;
                    } else if (UXtool === "Cosmos") {
                      ConfigPick.includeCosmos = true;
                    }

                    if (connected === "Connected") {
                      ConfigPick.connected = true;
                    }

                    if (locale === "add locale") {
                      ConfigPick.includeLocale = true;
                    }
                    const config = Object.assign(
                      { path, name },
                      defaultConfig,
                      ccarc,
                      ConfigPick
                    );
                    resolve(config);
                  });
              });
          });
        });
    });
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
