import CryptoJS from "crypto-js";

/**
 * 将文本转换为16进制格式（高级版本，支持自定义前缀）
 * @param inputText 要转换的输入文本
 * @param prefix 16进制前缀，默认为"0x"
 * @returns 带有指定前缀的16进制字符串
 */
export function textToHexAdvanced(inputText: string, prefix = "0x") {
  // 将字符串转换为UTF-8字节数组
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(inputText);

  // 将字节数组转换为16进制
  const hex = Array.from(utf8Bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return prefix + hex;
}

/**
 * 将16进制字符串转换回文本
 * @param hexString 16进制字符串（可带或不带"0x"前缀）
 * @returns 转换后的原始文本
 */
export function hexToText(hexString: string) {
  const cleanHex = hexString.replace(/^0x/, "");

  if (cleanHex.length % 2 !== 0) {
    throw new Error("16进制字符串长度必须是偶数");
  }

  let result = "";
  for (let i = 0; i < cleanHex.length; i += 2) {
    const hexPair = cleanHex.substr(i, 2);
    const charCode = parseInt(hexPair, 16);
    result += String.fromCharCode(charCode);
  }

  return result;
}

/**
 * 将16进制字符串转换回文本（增强版本，支持UTF-8解码）
 * @param hexString 16进制字符串（可带或不带"0x"前缀）
 * @returns 转换后的原始文本
 */
export function hexToTextEvent(hexString: string) {
  const cleanHex = hexString.replace(/^0x/, "");

  if (cleanHex.length % 2 !== 0) {
    throw new Error("16进制字符串长度必须是偶数");
  }

  // 将16进制转换为字节数组
  const bytes = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    const hexPair = cleanHex.substr(i, 2);
    bytes.push(parseInt(hexPair, 16));
  }
  console.log("bytes", bytes);

  // 使用TextDecoder解码UTF-8字节
  try {
    const uint8Array = new Uint8Array(bytes);
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(uint8Array);
  } catch (error) {
    console.warn("UTF-8解码失败，使用简单解码方式", error);
    return hexToText(hexString);
  }
}

/**
 * XOR加密/解密函数(支持中文)
 * @param text 要加密/解密的文本
 * @param key 加密密钥，默认为"defaultKey123"
 * @param decrypt 是否为解密操作，默认为false（加密）
 * @returns 加密后的16进制字符串或解密后的原始文本
 */
export function xorEncryption(
  text: string,
  key = "defaultKey123",
  decrypt = false
) {
  // 辅助函数：文本转16进制（支持中文Unicode）
  function textToHex(str: string) {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      hex += charCode.toString(16).padStart(4, "0"); // 使用4位16进制支持中文
    }
    return "0x" + hex;
  }

  // 辅助函数：16进制转文本（支持中文Unicode）
  function hexToText(hex: string) {
    const cleanHex = hex.replace(/^0x/, "");
    let result = "";
    for (let i = 0; i < cleanHex.length; i += 4) {
      // 每4位16进制为一个字符
      const hexGroup = cleanHex.substr(i, 4);
      if (hexGroup.length === 4) {
        result += String.fromCharCode(parseInt(hexGroup, 16));
      }
    }
    return result;
  }

  // 辅助函数：字符串转16进制（用于密钥）
  function stringToHex(str: string) {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16).padStart(4, "0");
    }
    return hex;
  }

  if (!decrypt) {
    // 加密过程
    const hex = textToHex(text);
    const cleanHex = hex.replace(/^0x/, "");
    const keyHex = stringToHex(key);
    let result = "";

    for (let i = 0; i < cleanHex.length; i += 4) {
      const dataChar = parseInt(cleanHex.substr(i, 4), 16);
      const keyIndex = ((i / 4) % (keyHex.length / 4)) * 4;
      const keyChar = parseInt(keyHex.substr(keyIndex, 4), 16);
      const encrypted = dataChar ^ keyChar;
      result += encrypted.toString(16).padStart(4, "0");
    }

    return "0x" + result;
  } else {
    // 解密过程（XOR解密和加密过程相同）
    const cleanHex = text.replace(/^0x/, "");
    const keyHex = stringToHex(key);
    let result = "";

    for (let i = 0; i < cleanHex.length; i += 4) {
      const dataChar = parseInt(cleanHex.substr(i, 4), 16);
      const keyIndex = ((i / 4) % (keyHex.length / 4)) * 4;
      const keyChar = parseInt(keyHex.substr(keyIndex, 4), 16);
      const decrypted = dataChar ^ keyChar;
      result += decrypted.toString(16).padStart(4, "0");
    }

    const decryptedHex = "0x" + result;
    return hexToText(decryptedHex);
  }
}

/**
 * 凯撒加密/解密函数（基于16进制字符移位）
 * @param text 要加密/解密的文本
 * @param shift 移位数量，默认为7
 * @param decrypt 是否为解密操作，默认为false（加密）
 * @returns 加密后的16进制字符串或解密后的原始文本
 */
export function caesarEncryption(text: string, shift = 7, decrypt = false) {
  // 辅助函数：文本转16进制（支持中文Unicode）
  function textToHex(str: string) {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      hex += charCode.toString(16).padStart(4, "0");
    }
    return "0x" + hex;
  }

  // 辅助函数：16进制转文本（支持中文Unicode）
  function hexToText(hex: string) {
    const cleanHex = hex.replace(/^0x/, "");
    let result = "";
    for (let i = 0; i < cleanHex.length; i += 4) {
      const hexGroup = cleanHex.substr(i, 4);
      if (hexGroup.length === 4) {
        result += String.fromCharCode(parseInt(hexGroup, 16));
      }
    }
    return result;
  }

  // 辅助函数：Caesar加密16进制字符（改进版）
  function caesarShiftHex(hex: string, shiftAmount: number) {
    const cleanHex = hex.replace(/^0x/, "");
    let result = "";

    for (let i = 0; i < cleanHex.length; i++) {
      const char = cleanHex[i];
      if (char >= "0" && char <= "9") {
        // 数字0-9循环移位
        const shifted = ((parseInt(char) + shiftAmount + 10) % 10).toString();
        result += shifted;
      } else if (char >= "a" && char <= "f") {
        // 字母a-f循环移位
        const shifted = String.fromCharCode(
          ((char.charCodeAt(0) - 97 + shiftAmount + 6) % 6) + 97
        );
        result += shifted;
      } else if (char >= "A" && char <= "F") {
        // 大写字母A-F循环移位
        const shifted = String.fromCharCode(
          ((char.charCodeAt(0) - 65 + shiftAmount + 6) % 6) + 65
        );
        result += shifted;
      } else {
        result += char;
      }
    }

    return "0x" + result;
  }

  if (!decrypt) {
    // 加密过程
    const hex = textToHex(text);
    return caesarShiftHex(hex, shift);
  } else {
    // 解密过程
    const decryptedHex = caesarShiftHex(text, -shift);
    return hexToText(decryptedHex);
  }
}

/**
 * 字节移位加密/解密函数
 * @param text 要加密/解密的文本
 * @param shiftPattern 移位模式数组，默认为[3, 7, 11, 13]
 * @param decrypt 是否为解密操作，默认为false（加密）
 * @returns 加密后的16进制字符串或解密后的原始文本
 */
export function byteShiftEncryption(
  text: string,
  shiftPattern = [3, 7, 11, 13],
  decrypt = false
) {
  // 辅助函数：文本转16进制（支持中文Unicode）
  function textToHex(str: string) {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      hex += charCode.toString(16).padStart(4, "0");
    }
    return "0x" + hex;
  }

  // 辅助函数：16进制转文本（支持中文Unicode）
  function hexToText(hex: string) {
    const cleanHex = hex.replace(/^0x/, "");
    let result = "";
    for (let i = 0; i < cleanHex.length; i += 4) {
      const hexGroup = cleanHex.substr(i, 4);
      if (hexGroup.length === 4) {
        result += String.fromCharCode(parseInt(hexGroup, 16));
      }
    }
    return result;
  }

  if (!decrypt) {
    // 加密过程
    const hex = textToHex(text);
    const cleanHex = hex.replace(/^0x/, "");
    let result = "";

    for (let i = 0; i < cleanHex.length; i += 4) {
      const charCode = parseInt(cleanHex.substr(i, 4), 16);
      const shift = shiftPattern[(i / 4) % shiftPattern.length];
      const encrypted = (charCode + shift) % 65536; // 使用65536作为模数支持Unicode字符
      result += encrypted.toString(16).padStart(4, "0");
    }

    return "0x" + result;
  } else {
    // 解密过程
    const cleanHex = text.replace(/^0x/, "");
    let result = "";

    for (let i = 0; i < cleanHex.length; i += 4) {
      const charCode = parseInt(cleanHex.substr(i, 4), 16);
      const shift = shiftPattern[(i / 4) % shiftPattern.length];
      const decrypted = (charCode - shift + 65536) % 65536;
      result += decrypted.toString(16).padStart(4, "0");
    }

    const decryptedHex = "0x" + result;
    return hexToText(decryptedHex);
  }
}

/**
 * AES加密/解密函数
 * @param text 要加密的文本或要解密的密文
 * @param decrypt 是否为解密操作，默认为false（加密）
 * @param key 加密/解密密钥，默认为"小明最屌"
 * @returns 加密后的字符串或解密后的原始文本
 */
export function AESDecrypt(
  text: string,
  decrypt: boolean = false,
  key: string = "小明最屌"
) {
  if (!text) {
    throw new Error("text is empty");
  }
  if (!key) {
    throw new Error("key is empty");
  }
  // 加密
  if (!decrypt) {
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();
    return encrypted;
  }
  // 解密
  else {
    const decrypted = CryptoJS.AES.decrypt(text, key).toString(
      CryptoJS.enc.Utf8
    );
    return decrypted;
  }
}
