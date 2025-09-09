import React, { useState } from "react";
import { Card, Input, Button, Space, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const { TextArea } = Input;
// 更完整的版本，支持自定义前缀和格式
function textToHexAdvanced(inputText: string, prefix = "0x") {
  // 将字符串转换为UTF-8字节数组
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(inputText);

  // 将字节数组转换为16进制
  const hex = Array.from(utf8Bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return prefix + hex;
}
// 反编译函数：16进制转文本
function hexToText(hexString: string) {
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
// 反编译函数：16进制转文本
function hexToTextEvent(hexString: string) {
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
const HexConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [hexText, setHexText] = useState<string>("");
  const [textHex, setTextHex] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  const convertToHex = () => {
    if (!inputText) {
      messageApi.warning("请输入要转换的文本");
      return;
    }

    try {
      // 将文本转换为16进制
      const result = textToHexAdvanced(inputText);
      setHexText(result);
    } catch (error) {
      messageApi.error("转换过程中发生错误: " + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    if (!hexText) {
      message.warning("没有内容可复制");
      return;
    }

    navigator.clipboard
      .writeText(hexText)
      .then(() => {
        message.success("已成功复制到剪贴板");
      })
      .catch(() => {
        message.error("复制失败");
      });
  };
  // 反编译函数：将16进制字符串转换回原始文本
  const hexToText = (hexString: string) => {
    const result = hexToTextEvent(hexString);
    console.log(result, hexString);
    setTextHex(result);
    return result;
  };

  return (
    <div className="page-container">
      {contextHolder}
      <Card title="数据转换工具" style={{ maxWidth: 800, margin: "0 auto" }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div>
            <div style={{ marginBottom: 8 }}>输入文本:</div>
            <TextArea
              rows={6}
              placeholder="请输入要转换为16进制的文本"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <Button type="primary" onClick={convertToHex}>
            将数据转成16进制
          </Button>

          <div>
            <div style={{ marginBottom: 8, position: "relative" }}>
              16进制结果:
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                style={{ position: "absolute", right: 0, top: 0 }}
              />
            </div>
            <TextArea
              rows={6}
              placeholder="转换后的16进制数据将显示在这里"
              value={hexText}
              readOnly
            />
          </div>

          <Button
            type="primary"
            onClick={() => {
              if (hexText.length <= 0) {
                messageApi.error("没有反编译内容");
              }
              console.log("666", hexText);
              hexToText(hexText);
            }}
          >
            将数据转成16进制
          </Button>
          <div>
            <div style={{ marginBottom: 8, position: "relative" }}>
              16进制反编译结果:
            </div>
            <TextArea
              rows={6}
              placeholder="转换后的16进制数据将显示在这里"
              value={textHex}
              readOnly
            />
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default HexConverter;
