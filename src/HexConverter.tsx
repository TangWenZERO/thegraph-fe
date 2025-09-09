import React, { useState } from "react";
import { Card, Input, Button, Space, message, Select, Row, Col } from "antd";
import { CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  textToHexAdvanced,
  hexToText,
  xorEncryption,
  caesarEncryption,
  AESDecrypt,
  byteShiftEncryption,
} from "./utils/utils";

const { TextArea } = Input;
const { Option } = Select;

// 定义加密方式选项
const ENCRYPTION_OPTIONS = [
  { label: "无加密（默认）", value: "none" },
  { label: "XOR加密", value: "xor" },
  { label: "凯撒加密", value: "caesar" },
  { label: "字节移位加密", value: "byteShift" },
  { label: "AES加密", value: "aes" },
];

// 定义解密方式选项（与加密方式对应）
const DECRYPTION_OPTIONS = [
  { label: "无解密（默认）", value: "none" },
  { label: "XOR解密", value: "xor" },
  { label: "凯撒解密", value: "caesar" },
  { label: "字节移位解密", value: "byteShift" },
  { label: "AES解密", value: "aes" },
];

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
  const [encryptionMethod, setEncryptionMethod] = useState<string>("none");
  const [decryptionMethod, setDecryptionMethod] = useState<string>("none");
  
  // 加密结果状态
  const [encryptedHexText, setEncryptedHexText] = useState<string>("");
  const [decryptedText, setDecryptedText] = useState<string>("");
  
  const [messageApi, contextHolder] = message.useMessage();

  const convertToHex = () => {
    if (!inputText) {
      messageApi.warning("请输入要转换的文本");
      return;
    }

    try {
      // 默认转换（无加密）
      const defaultResult = textToHexAdvanced(inputText);
      setHexText(defaultResult);
      
      // 加密转换
      let encryptedResult = "";
      switch (encryptionMethod) {
        case "none":
          encryptedResult = textToHexAdvanced(inputText);
          break;
        case "xor":
          encryptedResult = xorEncryption(inputText);
          break;
        case "caesar":
          encryptedResult = caesarEncryption(inputText);
          break;
        case "byteShift":
          encryptedResult = byteShiftEncryption(inputText);
          break;
        case "aes":
          encryptedResult = AESDecrypt(inputText, false);
          break;
        default:
          encryptedResult = textToHexAdvanced(inputText);
      }
      
      setEncryptedHexText(encryptedResult);
    } catch (error) {
      messageApi.error("转换过程中发生错误: " + (error as Error).message);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) {
      message.warning("没有内容可复制");
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success("已成功复制到剪贴板");
      })
      .catch(() => {
        message.error("复制失败");
      });
  };

  // 清空所有输入和输出
  const clearAll = () => {
    setInputText("");
    setHexText("");
    setTextHex("");
    setEncryptedHexText("");
    setDecryptedText("");
  };

  // 反编译函数：将16进制字符串转换回原始文本
  const convertHexToText = (hexString: string, isEncrypted: boolean = false) => {
    if (!hexString) {
      messageApi.warning("请输入要转换的16进制文本");
      return;
    }

    try {
      if (!isEncrypted) {
        // 默认转换（无解密）
        const result = hexToTextEvent(hexString);
        setTextHex(result);
      } else {
        // 解密转换
        let result = "";
        switch (decryptionMethod) {
          case "none":
            result = hexToTextEvent(hexString);
            break;
          case "xor":
            result = xorEncryption(hexString, "defaultKey123", true);
            break;
          case "caesar":
            result = caesarEncryption(hexString, 7, true);
            break;
          case "byteShift":
            result = byteShiftEncryption(hexString, [3, 7, 11, 13], true);
            break;
          case "aes":
            result = AESDecrypt(hexString, true);
            break;
          default:
            result = hexToTextEvent(hexString);
        }
        
        setDecryptedText(result);
      }
    } catch (error) {
      messageApi.error("反编译过程中发生错误: " + (error as Error).message);
    }
  };

  return (
    <div className="page-container">
      {contextHolder}
      <Card title="数据转换工具" style={{ maxWidth: 1200, margin: "0 auto" }}>
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

          <Space>
            <Button type="primary" onClick={convertToHex}>
              将数据转成16进制
            </Button>
            <Button icon={<DeleteOutlined />} onClick={clearAll}>
              清空
            </Button>
          </Space>

          {/* 默认转换区域（无加密） */}
          <div>
            <h3>默认转换（无加密）</h3>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 8, position: "relative" }}>
                  16进制结果:
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(hexText)}
                    style={{ position: "absolute", right: 0, top: 0 }}
                  />
                </div>
                <TextArea
                  rows={6}
                  placeholder="转换后的16进制数据将显示在这里"
                  value={hexText}
                  onChange={(e) => setHexText(e.target.value)}
                />
                <Button
                  type="primary"
                  onClick={() => convertHexToText(hexText, false)}
                  style={{ marginTop: 8 }}
                >
                  将16进制转成文本
                </Button>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>反编译结果:</div>
                <TextArea
                  rows={6}
                  placeholder="转换后的文本将显示在这里"
                  value={textHex}
                  readOnly
                />
              </Col>
            </Row>
          </div>

          {/* 加密转换区域 */}
          <div>
            <h3>加密转换</h3>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>加密方式:</div>
                <Select
                  style={{ width: "100%", marginBottom: 8 }}
                  value={encryptionMethod}
                  onChange={setEncryptionMethod}
                >
                  {ENCRYPTION_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
                
                <div style={{ marginBottom: 8, position: "relative" }}>
                  16进制结果:
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(encryptedHexText)}
                    style={{ position: "absolute", right: 0, top: 0 }}
                  />
                </div>
                <TextArea
                  rows={6}
                  placeholder="加密后的16进制数据将显示在这里"
                  value={encryptedHexText}
                  onChange={(e) => setEncryptedHexText(e.target.value)}
                />
                <Button
                  type="primary"
                  onClick={() => convertHexToText(encryptedHexText, true)}
                  style={{ marginTop: 8 }}
                >
                  将16进制转成文本（解密）
                </Button>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>解密方式:</div>
                <Select
                  style={{ width: "100%", marginBottom: 8 }}
                  value={decryptionMethod}
                  onChange={setDecryptionMethod}
                >
                  {DECRYPTION_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
                
                <div style={{ marginBottom: 8 }}>解密结果:</div>
                <TextArea
                  rows={6}
                  placeholder="解密后的文本将显示在这里"
                  value={decryptedText}
                  readOnly
                />
              </Col>
            </Row>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default HexConverter;