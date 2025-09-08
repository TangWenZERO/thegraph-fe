import React, { useState } from "react";
import { Card, Input, Button, Space, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const HexConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [hexText, setHexText] = useState<string>("");

  const convertToHex = () => {
    if (!inputText) {
      message.warning("请输入要转换的文本");
      return;
    }

    try {
      // 将文本转换为16进制
      const hex = Array.from(inputText)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(" ");
      
      setHexText(hex.toUpperCase());
    } catch (error) {
      message.error("转换过程中发生错误: " + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    if (!hexText) {
      message.warning("没有内容可复制");
      return;
    }

    navigator.clipboard.writeText(hexText)
      .then(() => {
        message.success("已成功复制到剪贴板");
      })
      .catch(() => {
        message.error("复制失败");
      });
  };

  return (
    <div className="page-container">
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
        </Space>
      </Card>
    </div>
  );
};

export default HexConverter;