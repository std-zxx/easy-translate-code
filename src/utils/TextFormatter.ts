class TextFormatter {
  // 原始输入文本
  private originalText: string;

  constructor(text: string) {
    this.originalText = text;
  }

  /**
   * 预处理文本：提取所有英文单词（忽略特殊字符，转为小写）
   * @returns 单词数组（如 "Hello_World! 123" → ["hello", "world"]）
   */
  private getWords(): string[] {
    // 匹配字母序列（忽略数字和特殊字符），并转为小写
    const wordMatches = this.originalText.match(/[A-Za-z]+/g);
    return wordMatches ? wordMatches.map((word) => word.toLowerCase()) : [];
  }

  /**
   * 转换为小驼峰格式（camelCase）
   * @example "hello world" → "helloWorld"；"Hello_World" → "helloWorld"
   */
  toCamelCase(): string {
    const words = this.getWords();
    if (words.length === 0) {
      return "";
    }

    // 首单词小写，后续单词首字母大写
    return (
      words[0] +
      words
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
    );
  }

  /**
   * 转换为中划线连接格式（kebab-case）
   * @example "hello world" → "hello-world"；"HelloWorld" → "hello-world"
   */
  toKebabCase(): string {
    return this.getWords().join("-");
  }

  /**
   * 转换为下划线连接格式（snake_case）
   * @example "hello world" → "hello_world"；"Hello-World" → "hello_world"
   */
  toSnakeCase(): string {
    return this.getWords().join("_");
  }

  /**
   * 转换为帕斯卡命名（PascalCase，大驼峰）
   * @example "hello world" → "HelloWorld"；"hello_world" → "HelloWorld"
   */
  toPascalCase(): string {
    return this.getWords()
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  /**
   * 获取原始文本
   */
  getOriginalText(): string {
    return this.originalText;
  }
}

export default TextFormatter;
