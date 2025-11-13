import * as vscode from "vscode";
import TextFormatter from "./utils/TextFormatter";
import { baiDuTranslateText } from "./translate/baiDuTranslateText";
import { youdaoTranslateText } from "./translate/youdaoTranslateText";
import {
  getLanguageFromTo,
  processStringForTranslation,
  TranslateServiceType,
} from "./utils/tool";

export function activate(context: vscode.ExtensionContext) {
  console.log("translate-code 拓展已激活");

  // 创建通用的翻译函数
  const translateWithFormat = async (formatMethod: keyof TextFormatter) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text) {
      vscode.window.showInformationMessage("请先选择要翻译的文本");
      return;
    }

    try {
      // 从设置中获取翻译服务类型
      const config = vscode.workspace.getConfiguration("translateCode");
      const translateService: TranslateServiceType =
        config.get<TranslateServiceType>("translateService", "baidu");

      let translatedText: string;
      const processedText = processStringForTranslation(text);

      let [from, to] = getLanguageFromTo(
        formatMethod === "getOriginalText" ? processedText.toLanguage : "en",
        translateService
      );
      // 根据选择的服务类型调用不同的翻译函数
      if (translateService === "baidu") {
        translatedText = await baiDuTranslateText(processedText.text, from, to);
      } else if (translateService === "youdao") {
        translatedText = await youdaoTranslateText(
          processedText.text,
          from,
          to
        );
      } else {
        throw new Error(`不支持的翻译服务类型: ${translateService}`);
      }

      const formatter = new TextFormatter(translatedText);
      // 使用指定的格式化方法
      const formattedText = formatter[formatMethod]();

      // 替换选中的文本
      await editor.edit((editBuilder) => {
        editBuilder.replace(selection, formattedText);
      });

      // vscode.window.showInformationMessage("翻译完成");
      // vscode.window.setStatusBarMessage("翻译完成", 2000);
    } catch (error) {
      vscode.window.showErrorMessage("翻译失败: " + (error as Error).message);
    }
  };

  // 注册多个命令，每个命令对应不同的格式化方法
  const commands = [
    {
      command: "extension.translateToCamelCase",
      callback: () => translateWithFormat("toCamelCase"),
    },
    {
      command: "extension.translateToKebabCase",
      callback: () => translateWithFormat("toKebabCase"),
    },
    {
      command: "extension.translateToSnakeCase",
      callback: () => translateWithFormat("toSnakeCase"),
    },
    {
      command: "extension.translateToPascalCase",
      callback: () => translateWithFormat("toPascalCase"),
    },
    {
      command: "extension.translateOriginalText",
      callback: () => translateWithFormat("getOriginalText"),
    },
  ];

  // 注册所有命令
  commands.forEach(({ command, callback }) => {
    const disposable = vscode.commands.registerCommand(command, callback);
    context.subscriptions.push(disposable);
  });
}

export function deactivate() {}
