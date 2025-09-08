import { useState } from "react";
import { gql, request } from "graphql-request";
import { QUERY_URL, headers } from "./utils/config";
import "./App.css";
import "antd/dist/reset.css";
import {
  Button,
  Select,
  Form,
  Row,
  Col,
  Table,
  DatePicker,
  Space,
  message,
  Card,
  Descriptions,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Title } = Typography;

// 实体类型选项 - 包含所有11种事件类型
const ENTITY_TYPES = [
  { label: "Issue (新代币发行事件)", value: "issues" },
  { label: "Redeem (代币赎回事件)", value: "redeems" },
  { label: "Deprecate (合约废弃事件)", value: "deprecates" },
  { label: "Params (参数变更事件)", value: "params" },
  {
    label: "DestroyedBlackFunds (销毁黑名单资金事件)",
    value: "destroyedBlackFunds",
  },
  { label: "AddedBlackList (添加黑名单事件)", value: "addedBlackLists" },
  { label: "RemovedBlackList (移除黑名单事件)", value: "removedBlackLists" },
  { label: "Approval (代币授权事件)", value: "approvals" },
  { label: "Transfer (代币转账事件)", value: "transfers" },
  { label: "Pause (合约暂停事件)", value: "pauses" },
  { label: "Unpause (合约恢复事件)", value: "unpauses" },
];

// 查询数量选项
const LIMIT_OPTIONS = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
];

// 排序方向选项
const ORDER_DIRECTIONS = [
  { label: "升序", value: "asc" },
  { label: "降序", value: "desc" },
];

// 合约信息
const CONTRACT_INFO = {
  name: "Tether(USDT)",
  address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  network: "Ethereum Mainnet",
  subgraphUrl: QUERY_URL,
};

// 定义数据类型
interface EntityData {
  id: string;
  amount?: string;
  newAddress?: string;
  feeBasisPoints?: string;
  maxFee?: string;
  _blackListedUser?: string;
  _user?: string;
  _balance?: string;
  from?: string;
  to?: string;
  owner?: string;
  spender?: string;
  value?: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

function App() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EntityData[]>([]);
  const [columns, setColumns] = useState<TableColumnsType<EntityData>>([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // 根据实体类型生成表格列
  const generateColumns = (entityType: string) => {
    const baseColumns: TableColumnsType<EntityData> = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: "20%",
        render: (text: string) => (
          <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
            {text}
          </div>
        ),
      },
      {
        title: "区块号",
        dataIndex: "blockNumber",
        key: "blockNumber",
      },
      {
        title: "时间戳",
        dataIndex: "blockTimestamp",
        key: "blockTimestamp",
        render: (timestamp: string) => {
          const date = new Date(Number(timestamp) * 1000);
          return date.toLocaleString();
        },
      },
      {
        title: "交易哈希",
        dataIndex: "transactionHash",
        key: "transactionHash",
        width: "20%",
        render: (text: string) => (
          <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
            {text}
          </div>
        ),
      },
      {
        title: "操作",
        key: "action",
        render: (_: unknown, record: EntityData) => (
          <Space size="middle">
            <Button
              type="link"
              onClick={() => {
                navigator.clipboard.writeText(record.transactionHash);
                messageApi.success("交易哈希已成功复制到剪贴板");
              }}
            >
              复制哈希
            </Button>
            <Button
              type="link"
              onClick={() => {
                navigate(`/transaction/${record.transactionHash}`);
              }}
            >
              详情
            </Button>
          </Space>
        ),
      },
    ];

    switch (entityType) {
      case "issues":
        return [
          ...baseColumns.slice(0, 1),
          {
            title: "发行数量",
            dataIndex: "amount",
            key: "amount",
          },
          ...baseColumns.slice(1),
        ];

      case "redeems":
        return [
          ...baseColumns.slice(0, 1),
          {
            title: "赎回数量",
            dataIndex: "amount",
            key: "amount",
          },
          ...baseColumns.slice(1),
        ];

      case "deprecates":
        return [
          ...baseColumns.slice(0, 1),
          {
            title: "新地址",
            dataIndex: "newAddress",
            key: "newAddress",
            render: (text: string) => (
              <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
                {text}
              </div>
            ),
          },
          ...baseColumns.slice(1),
        ];

      case "params":
        return [
          ...baseColumns.slice(0, 1),
          {
            title: "费用基点",
            dataIndex: "feeBasisPoints",
            key: "feeBasisPoints",
          },
          {
            title: "最大费用",
            dataIndex: "maxFee",
            key: "maxFee",
          },
          ...baseColumns.slice(1),
        ];

      case "destroyedBlackFunds":
        return [
          ...baseColumns.slice(0, 1),
          {
            title: "黑名单用户",
            dataIndex: "_blackListedUser",
            key: "_blackListedUser",
            render: (text: string) => (
              <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
                {text}
              </div>
            ),
          },
          {
            title: "销毁余额",
            dataIndex: "_balance",
            key: "_balance",
          },
          ...baseColumns.slice(1),
        ];

      case "addedBlackLists":
      case "removedBlackLists":
        return [
          ...baseColumns.slice(0, 1),
          {
            title: "用户地址",
            dataIndex: "_user",
            key: "_user",
            render: (text: string) => (
              <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
                {text}
              </div>
            ),
          },
          ...baseColumns.slice(1),
        ];

      case "transfers":
        return [
          ...baseColumns.slice(0, 1),
          {
            title: "发送方",
            dataIndex: "from",
            key: "from",
            ellipsis: true,
          },
          {
            title: "接收方",
            dataIndex: "to",
            key: "to",
            ellipsis: true,
          },
          {
            title: "转账金额",
            dataIndex: "value",
            key: "value",
          },
          ...baseColumns.slice(1),
        ];

      case "approvals":
        return [
          ...baseColumns.slice(0, 1),
          {
            title: "所有者",
            dataIndex: "owner",
            key: "owner",
            // ellipsis: true,
            width: "20%",
            render: (text: string) => (
              <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
                {text}
              </div>
            ),
          },

          {
            title: "被授权方",
            dataIndex: "spender",
            key: "spender",
            // ellipsis: true,
            width: "20%",
            render: (text: string) => (
              <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
                {text}
              </div>
            ),
          },
          {
            title: "授权金额",
            dataIndex: "value",
            key: "value",
            width: "20%",
            render: (text: string) => (
              <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
                {text}
              </div>
            ),
          },
          ...baseColumns.slice(1),
        ];

      case "pauses":
      case "unpauses":
        // 这些事件类型没有特殊字段，只使用基础字段
        return baseColumns;

      default:
        return baseColumns;
    }
  };

  // 构建 GraphQL 查询
  const buildQuery = (values: {
    entityType: string;
    timeRange?: [moment.Moment, moment.Moment];
  }) => {
    const { entityType, timeRange } = values;

    let whereClause = "";
    if (timeRange && timeRange.length === 2) {
      const [start, end] = timeRange;
      if (start && end) {
        const startTime = Math.floor(start.valueOf() / 1000);
        const endTime = Math.floor(end.valueOf() / 1000);
        whereClause = `where: { blockTimestamp_gte: "${startTime}", blockTimestamp_lte: "${endTime}" }`;
      }
    }

    // 根据实体类型确定需要查询的字段
    let fields = "id blockNumber blockTimestamp transactionHash";
    switch (entityType) {
      case "issues":
      case "redeems":
        fields = "id amount blockNumber blockTimestamp transactionHash";
        break;
      case "deprecates":
        fields = "id newAddress blockNumber blockTimestamp transactionHash";
        break;
      case "params":
        fields =
          "id feeBasisPoints maxFee blockNumber blockTimestamp transactionHash";
        break;
      case "destroyedBlackFunds":
        fields =
          "id _blackListedUser _balance blockNumber blockTimestamp transactionHash";
        break;
      case "addedBlackLists":
      case "removedBlackLists":
        fields = "id _user blockNumber blockTimestamp transactionHash";
        break;
      case "transfers":
        fields = "id from to value blockNumber blockTimestamp transactionHash";
        break;
      case "approvals":
        fields =
          "id owner spender value blockNumber blockTimestamp transactionHash";
        break;
      case "pauses":
      case "unpauses":
        fields = "id blockNumber blockTimestamp transactionHash";
        break;
    }

    const query = gql`
      query GetData($first: Int!, $orderBy: String, $orderDirection: String) {
        ${entityType}(first: $first, orderBy: $blockTimestamp, orderDirection: $orderDirection, ${whereClause}) {
          ${fields}
        }
      }
    `;

    return query;
  };

  // 执行查询
  const handleQuery = async (values: {
    entityType: string;
    limit: number;
    orderDirection: string;
  }) => {
    setLoading(true);
    try {
      // 生成表格列
      const newColumns = generateColumns(values.entityType);
      setColumns(newColumns);

      // 构建查询
      const query = buildQuery(values);

      // 执行查询
      const result: Record<string, EntityData[]> = await request(
        QUERY_URL,
        query,
        {
          first: values.limit,
          orderBy: "blockTimestamp",
          orderDirection: values.orderDirection,
        },
        headers
      );

      // 处理结果
      const entityData = result[values.entityType] || [];
      setData(entityData);

      // 显示查询结果提示
      if (entityData.length > 0) {
        message.success(`成功查询到 ${entityData.length} 条记录`);
      } else {
        message.info("未查询到相关记录");
      }
    } catch (error) {
      console.error("查询出错:", error);
      message.error("查询过程中发生错误，请稍后重试");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {contextHolder}
      <div className="page-container">
        <div
          style={{
            textAlign: "center",
            marginBottom: 30,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button 
            type="primary" 
            onClick={() => navigate('/hex-converter')}
          >
            数据转化
          </Button>
          <Title
            level={2}
            style={{
              margin: 0,
              color: "#2c3e50",
              flex: 1,
              textAlign: "center",
            }}
          >
            TPS Subgraph 数据查询系统
          </Title>
          <div style={{ width: 60 }}></div> {/* 右侧占位元素 */}
        </div>

        <Card>
          <Descriptions
            title="合约信息"
            column={{ xs: 1, sm: 1, md: 2, lg: 4 }}
            bordered
            size="middle"
          >
            <Descriptions.Item label="合约名称">
              {CONTRACT_INFO.name}
            </Descriptions.Item>
            <Descriptions.Item label="合约地址">
              {CONTRACT_INFO.address}
            </Descriptions.Item>
            <Descriptions.Item label="网络">
              {CONTRACT_INFO.network}
            </Descriptions.Item>
            <Descriptions.Item label="Subgraph查询地址">
              {CONTRACT_INFO.subgraphUrl}
            </Descriptions.Item>
          </Descriptions>

          <Form
            form={form}
            layout="horizontal"
            onFinish={handleQuery}
            initialValues={{
              entityType: "issues",
              limit: 10,
              orderDirection: "desc",
            }}
            style={{ marginTop: 30 }}
          >
            <Row gutter={[16, 0]} wrap>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="entityType"
                  label="实体类型"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  rules={[{ required: true, message: "请选择实体类型" }]}
                >
                  <Select options={ENTITY_TYPES} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="limit"
                  label="查询数量"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  rules={[{ required: true, message: "请选择查询数量" }]}
                >
                  <Select options={LIMIT_OPTIONS} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="orderDirection"
                  label="排序方向"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  rules={[{ required: true, message: "请选择排序方向" }]}
                >
                  <Select options={ORDER_DIRECTIONS} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="timeRange"
                  label="时间范围"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  <DatePicker.RangePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder={["开始时间", "结束时间"]}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              wrapperCol={{ span: 24 }}
              style={{ textAlign: "center", marginBottom: 0 }}
            >
              <Space size="large">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="middle"
                >
                  查询
                </Button>
                <Button
                  htmlType="button"
                  onClick={() => form.resetFields()}
                  size="middle"
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>

          <div style={{ marginTop: 30 }}>
            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: true }}
              size="middle"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
