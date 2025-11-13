// 定义翻译服务类型（字符串字面量联合类型）
export type TranslateServiceType = "baidu" | "youdao";

/**
 * 根据目标语言和翻译服务，获取对应的源语言和目标语言编码
 * @param toText 目标语言标识（目前支持 'en' 或其他，其他默认视为中文）
 * @param translateService 翻译服务名称（支持 'baidu' 或 'youdao'）
 * @returns [源语言编码, 目标语言编码]
 */
export function getLanguageFromTo(
  toText: string,
  translateService: TranslateServiceType //限制仅支持的翻译服务
): string[] {
  // 定义各翻译服务的语言编码映射表
  const languageMap = {
    baidu: {
      en: ["zh", "en"], // 目标为英文时，源=中文，目标=英文
      default: ["en", "zh"], // 目标为非英文时，源=英文，目标=中文
    },
    youdao: {
      en: ["zh-CHS", "en"], // 目标为英文时，源=简体中文，目标=英文
      default: ["en", "zh-CHS"], // 目标为非英文时，源=英文，目标=简体中文
    },
  };

  // 根据目标语言和服务类型获取结果
  const targetLang = toText === "en" ? "en" : "default";
  return languageMap[translateService][targetLang];
}

// 定义翻译文本结果类型
export type TranslateTextResult = {
  toLanguage: string; // 目标语言
  text: string; // 需要翻译的文本
};

/**
 * 判断字符串语言类型并处理英文格式
 * @param input 输入字符串
 * @returns 处理后的字符串
 */
export function processStringForTranslation(
  input: string
): TranslateTextResult {
  // 检查是否包含中文字符（Unicode范围：\u4e00-\u9fa5）
  const hasChinese = /[\u4e00-\u9fa5]/.test(input);

  if (hasChinese) {
    // 包含中文，直接返回原字符串
    return {
      toLanguage: "en",
      text: input,
    };
  } else {
    // 全英文或标点，处理格式为正常空格间隔句式
    return convertToNormalEnglish(input);
  }
}

/**
 * 将各种英文格式转换为正常空格间隔句式
 * @param str 输入英文字符串
 * @returns 转换后的正常句式
 */
function convertToNormalEnglish(str: string): TranslateTextResult {
  // 处理驼峰命名（大驼峰/小驼峰）
  // 在大写字母前添加空格（排除字符串开头）
  let processed = str.replace(/(?<!^)([A-Z])/g, " $1");

  // 处理中划线和下划线，替换为空格
  processed = processed.replace(/-|_/g, " ");

  // 处理连续空格为单个空格，并去除首尾空格
  processed = processed.replace(/\s+/g, " ").trim();

  // 确保首字母大写（句子通常以大写开头）
  if (processed.length > 0) {
    processed =
      processed.charAt(0).toUpperCase() + processed.slice(1).toLowerCase();
  }

  return {
    toLanguage: "zh",
    text: processed,
  };
}

export async function sha256(message: string): Promise<string> {
  // 将字符串编码为 Uint8Array
  const encoder = new TextEncoder();
  const data: Uint8Array = encoder.encode(message);

  // 计算哈希
  const hashBuffer: ArrayBuffer = await crypto.subtle.digest("SHA-256", data);

  // 将 ArrayBuffer 转换为十六进制字符串
  const hashArray: number[] = Array.from(new Uint8Array(hashBuffer));
  const hashHex: string = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
