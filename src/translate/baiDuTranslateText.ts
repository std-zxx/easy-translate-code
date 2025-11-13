import * as vscode from "vscode";
import * as https from "https";
import * as querystring from "querystring";

// 翻译函数 - 使用百度翻译API
export async function baiDuTranslateText(
  text: string,
  from: string,
  to: string
): Promise<string> {
  // 从VS Code设置中读取百度翻译API的配置信息
  const config = vscode.workspace.getConfiguration("translateCode");
  const appid = config.get<string>("baiduAppId", "");
  const key = config.get<string>("baiduAppKey", "");

  // 检查配置是否完整
  if (!appid || !key) {
    throw new Error("百度翻译API配置不完整，请在VS Code设置中配置AppID和密钥");
  }

  const salt = Math.floor(Math.random() * 1000000000).toString();
  const domain = "it";
  const sign = require("crypto")
    .createHash("md5")
    .update(appid + text + salt + domain + key)
    .digest("hex");

  // 构建请求参数
  const params = querystring.stringify({
    q: text,
    from: from, // zh auto
    to: to, //en
    domain: domain,
    appid: appid,
    salt: salt,
    sign: sign,
  });

  // 构建请求URL
  const options = {
    hostname: "fanyi-api.baidu.com",
    // path: "/api/trans/vip/translate?" + params,
    path: "/api/trans/vip/fieldtranslate?" + params,
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
          if (result.trans_result && result.trans_result.length > 0) {
            resolve(result.trans_result[0].dst);
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
