import * as vscode from "vscode";
import * as https from "https";
import * as querystring from "querystring";
import { sha256 } from "../utils/tool";

// 翻译函数 - 使用网易有道翻译API
export async function youdaoTranslateText(
  text: string,
  from: string,
  to: string
): Promise<string> {
  // 从VS Code设置中读取网易有道翻译API的配置信息
  const config = vscode.workspace.getConfiguration("translateCode");
  const appKey = config.get<string>("youdaoAppKey", "");
  const appSecret = config.get<string>("youdaoAppSecret", "");

  // 检查配置是否完整
  if (!appKey || !appSecret) {
    throw new Error(
      "网易有道翻译API配置不完整，请在VS Code设置中配置AppKey和密钥"
    );
  }

  const salt = Math.floor(Math.random() * 1000000000).toString();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signStr = appKey + truncate(text) + salt + timestamp + appSecret;

  const sign = await sha256(signStr);

  // 构建请求参数
  const params = querystring.stringify({
    q: text,
    from: from, //zh-CHS
    to: to, //en
    appKey: appKey,
    salt: salt,
    sign: sign,
    signType: "v3",
    curtime: timestamp,
  });

  // 构建请求URL
  const options = {
    hostname: "openapi.youdao.com",
    path: "/api" + "?" + params,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (result.translation && result.translation.length > 0) {
            resolve(result.translation[0]);
          } else {
            reject(new Error("翻译失败: " + JSON.stringify(result)));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

// 辅助函数：处理过长的文本
function truncate(q: string): string {
  const len = q.length;
  return len <= 20 ? q : q.substring(0, 10) + len + q.substring(len - 10, len);
}
