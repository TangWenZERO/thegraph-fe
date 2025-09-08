import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql, request } from "graphql-request";
import { QUERY_URL, headers } from "./utils/config";
import {
  Button,
  Spin,
  Card,
  Descriptions,
  Alert,
  Space,
  Typography,
  message,
} from "antd";
import "./App.css";

const { Title } = Typography;

interface TransactionData {
  id: string;
  from?: string;
  to?: string;
  value?: string;
  amount?: string;
  owner?: string;
  spender?: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

// Define the GraphQL query result type
interface QueryResult {
  transfers: TransactionData[];
  issues: TransactionData[];
  redeems: TransactionData[];
  approvals: TransactionData[];
}

const TransactionDetail: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [transactionData, setTransactionData] =
    useState<TransactionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!hash) return;

      try {
        setLoading(true);
        // 查询所有可能包含该交易哈希的实体类型
        const query = gql`
          query GetTransactionData($hash: String!) {
            transfers(where: { transactionHash: $hash }) {
              id
              from
              to
              value
              blockNumber
              blockTimestamp
              transactionHash
            }
            issues(where: { transactionHash: $hash }) {
              id
              amount
              blockNumber
              blockTimestamp
              transactionHash
            }
            redeems(where: { transactionHash: $hash }) {
              id
              amount
              blockNumber
              blockTimestamp
              transactionHash
            }
            approvals(where: { transactionHash: $hash }) {
              id
              owner
              spender
              value
              blockNumber
              blockTimestamp
              transactionHash
            }
          }
        `;

        const result: QueryResult = await request(
          QUERY_URL,
          query,
          { hash },
          headers
        );

        // 查找第一个非空的结果
        let data: TransactionData | null = null;
        if (result.transfers && result.transfers.length > 0) {
          data = result.transfers[0];
        } else if (result.issues && result.issues.length > 0) {
          data = result.issues[0];
        } else if (result.redeems && result.redeems.length > 0) {
          data = result.redeems[0];
        } else if (result.approvals && result.approvals.length > 0) {
          data = result.approvals[0];
        }

        if (data) {
          setTransactionData(data);
        } else {
          setError("未找到交易数据");
        }
      } catch (err) {
        console.error("获取交易详情出错:", err);
        setError("获取交易详情时发生错误");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [hash]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div className="page-container">
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>正在加载交易详情...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <div className="page-container">
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <div style={{ textAlign: "center" }}>
            <Space>
              <Button onClick={() => navigate(-1)}>返回</Button>
              <Button type="primary" onClick={() => navigate("/")}>
                首页
              </Button>
            </Space>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="page-container">
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Title level={3} style={{ margin: 0, color: "#2c3e50" }}>
            交易详情
          </Title>
        </div>

        <Space
          style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
        >
          <Button onClick={() => navigate(-1)}>返回</Button>
          <Button type="primary" onClick={() => navigate("/")}>
            首页
          </Button>
        </Space>

        {transactionData && (
          <Card>
            <Descriptions title="交易信息" bordered column={1} size="middle">
              <Descriptions.Item label="交易哈希">
                <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
                  {transactionData.transactionHash}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="区块号">
                {transactionData.blockNumber}
              </Descriptions.Item>
              <Descriptions.Item label="时间戳">
                {new Date(
                  Number(transactionData.blockTimestamp) * 1000
                ).toLocaleString()}
              </Descriptions.Item>

              {transactionData.from && (
                <Descriptions.Item label="发送方">
                  <div
                    style={{ wordWrap: "break-word", wordBreak: "break-all" }}
                  >
                    {transactionData.from}
                  </div>
                </Descriptions.Item>
              )}

              {transactionData.to && (
                <Descriptions.Item label="接收方">
                  <div
                    style={{ wordWrap: "break-word", wordBreak: "break-all" }}
                  >
                    {transactionData.to}
                  </div>
                </Descriptions.Item>
              )}

              {transactionData.value && (
                <Descriptions.Item label="转账金额">
                  {transactionData.value}
                </Descriptions.Item>
              )}

              {transactionData.amount && (
                <Descriptions.Item label="发行/赎回金额">
                  {transactionData.amount}
                </Descriptions.Item>
              )}

              {transactionData.owner && (
                <Descriptions.Item label="所有者">
                  <div
                    style={{ wordWrap: "break-word", wordBreak: "break-all" }}
                  >
                    {transactionData.owner}
                  </div>
                </Descriptions.Item>
              )}

              {transactionData.spender && (
                <Descriptions.Item label="被授权方">
                  <div
                    style={{ wordWrap: "break-word", wordBreak: "break-all" }}
                  >
                    {transactionData.spender}
                  </div>
                </Descriptions.Item>
              )}

              {transactionData.id && (
                <Descriptions.Item label="事件ID">
                  <div
                    style={{ wordWrap: "break-word", wordBreak: "break-all" }}
                  >
                    {transactionData.id}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <Button
                type="primary"
                onClick={() => {
                  navigator.clipboard.writeText(
                    transactionData.transactionHash
                  );
                  message.success("交易哈希已成功复制到剪贴板");
                }}
              >
                复制交易哈希
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionDetail;
