import { useState, useEffect } from "react";
import { Table, Button, Spin, Popconfirm, Tabs } from "antd";

import { QuestionCircleOutlined } from "@ant-design/icons";
import { transformTimestampToTaipeiDatetime } from "@/utils";
import axios from "axios";

function OpenOrders(props) {
    const { dataSource, cancelOrderLoading, tradingMarket } = props;

    const spotColumns = [
        {
            title: "幣種",
            width: 100,
            dataIndex: "symbol",
            key: "symbol",
            fixed: "left",
        },
        {
            title: "方向",
            width: 60,
            dataIndex: "side",
            key: "side",
            fixed: "left",
            render: (side) => (
                <div
                    className={
                        side === "buy" ? "text-green-500" : "text-red-600"
                    }
                >
                    {side}
                </div>
            ),
        },
        {
            title: "下單價格",
            width: 150,
            dataIndex: "price",
            key: "price",
        },
        {
            title: "下單數量(token)",
            width: 150,
            dataIndex: "amount",
            key: "amount",
        },
        {
            title: "未成交數量(token)",
            width: 150,
            dataIndex: "remaining",
            key: "remaining",
        },
        {
            title: "下單時間(台灣)",
            width: 150,
            dataIndex: "timestamp",
            key: "timestamp",
            render: (timestamp) => (
                <div>{transformTimestampToTaipeiDatetime(timestamp)}</div>
            ),
        },
        {
            title: "最後更新時間(台灣)",
            width: 150,
            dataIndex: "lastUpdateTimestamp",
            key: "lastUpdateTimestamp",
            render: (lastUpdateTimestamp) =>
                lastUpdateTimestamp && (
                    <div>
                        {transformTimestampToTaipeiDatetime(
                            lastUpdateTimestamp
                        )}
                    </div>
                ),
        },
        {
            title: "取消訂單",
            key: "operation",
            fixed: "right",
            width: 100,
            render: (value) => (
                <Spin spinning={cancelOrderLoading}>
                    <Popconfirm
                        title="刪除所選訂單"
                        description="確定刪除所選訂單？"
                        okText="確定"
                        cancelText="取消"
                        icon={
                            <QuestionCircleOutlined
                                style={{
                                    color: "red",
                                }}
                            />
                        }
                        onConfirm={() =>
                            props.cancelOpenOrder(value.id, value.symbol)
                        }
                    >
                        <Button type="primary" danger className="mr-4">
                            取消訂單
                        </Button>
                    </Popconfirm>
                </Spin>
            ),
        },
    ];

    const futureColumns = [
        {
            title: "幣種",
            width: 100,
            dataIndex: "symbol",
            key: "symbol",
            fixed: "left",
            render: (symbol) => <div>{symbol.split(":")[0]}</div>,
        },
        {
            title: "方向",
            width: 60,
            dataIndex: "side",
            key: "side",
            fixed: "left",
            render: (side) => (
                <div
                    className={
                        side === "long" ? "text-green-500" : "text-red-600"
                    }
                >
                    {side}
                </div>
            ),
        },
        {
            title: "下單價格",
            width: 150,
            dataIndex: "entryPrice",
            key: "entryPrice",
        },
        {
            title: "下單數量(token)",
            width: 150,
            dataIndex: "contracts",
            key: "contracts",
        },
        {
            title: "未實現損益",
            width: 150,
            dataIndex: "unrealizedPnl",
            key: "unrealizedPnl",
            render: (unrealizedPnl) => (
                <div
                    className={
                        unrealizedPnl > 0 ? "text-green-500" : "text-red-600"
                    }
                >
                    {unrealizedPnl}
                </div>
            ),
        },
        {
            title: "未實現損益(%)",
            width: 150,
            dataIndex: "percentage",
            key: "percentage",
            render: (percentage) => (
                <div
                    className={
                        percentage > 0 ? "text-green-500" : "text-red-600"
                    }
                >
                    {percentage}%
                </div>
            ),
        },
        {
            title: "槓桿",
            width: 150,
            dataIndex: "leverage",
            key: "leverage",
        },
        {
            title: "下單時間(台灣)",
            width: 150,
            dataIndex: "timestamp",
            key: "timestamp",
            render: (timestamp) => (
                <div>{transformTimestampToTaipeiDatetime(timestamp)}</div>
            ),
        },
        {
            title: "平倉",
            key: "operation",
            fixed: "right",
            width: 100,
            render: (value) => (
                <Spin spinning={cancelOrderLoading}>
                    <Popconfirm
                        title="平倉所選訂單"
                        description="確定平倉所選訂單？"
                        okText="確定"
                        cancelText="取消"
                        icon={
                            <QuestionCircleOutlined
                                style={{
                                    color: "red",
                                }}
                            />
                        }
                        onConfirm={() =>
                            props.cancelOpenOrder(value.id, value.symbol)
                        }
                    >
                        <Button type="primary" danger className="mr-4">
                            平倉
                        </Button>
                    </Popconfirm>
                </Spin>
            ),
        },
    ];

    return (
        <Table
            dataSource={dataSource}
            columns={tradingMarket === "spot" ? spotColumns : futureColumns}
            scroll={{
                x: 200,
            }}
        ></Table>
    );
}

function HistoryOrders(props) {
    const { account, tradingMarket } = props;
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [symbolFilter, setSymbolFilter] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});

    useEffect(() => {
        if (account && tradingMarket) {
            setIsLoading(true);
            axios
                .get(`/api/bitget/getHistoryOrders/${account}/${tradingMarket}`)
                .then((res) => {
                    if (tradingMarket === "spot") {
                        setHistoryData(res.data);

                        //處理 symbol 過濾器
                        const uniqueSymbols = [
                            ...new Set(res.data.map((item) => item.symbol)),
                        ];

                        // 將資料轉換為所需的格式
                        const result = uniqueSymbols.map((symbol) => ({
                            text: symbol,
                            value: symbol,
                        }));
                        setSymbolFilter(result);
                    } else {
                        setHistoryData(res.data.fillList);
                    }
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [account, tradingMarket]);

    const handleChange = (_, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const clearAll = () => {
        setFilteredInfo({});
        setSortedInfo({});
    };

    const spotColumns = [
        {
            title: "幣種",
            width: 100,
            dataIndex: "symbol",
            showSorterTooltip: {
                target: "full-header",
            },
            filters: symbolFilter,
            onFilter: (value, record) => record.symbol.indexOf(value) === 0,
            filteredValue: filteredInfo.symbol || null,
            key: "symbol",
            fixed: "left",
        },
        {
            title: "方向",
            width: 60,
            dataIndex: "side",
            key: "side",
            fixed: "left",
            showSorterTooltip: {
                target: "full-header",
            },
            filters: [
                {
                    text: "buy",
                    value: "buy",
                },
                {
                    text: "sell",
                    value: "sell",
                },
            ],
            filteredValue: filteredInfo.side || null,
            onFilter: (value, record) => record.side.indexOf(value) === 0,
            render: (side) => (
                <div
                    className={
                        side === "buy" ? "text-green-500" : "text-red-600"
                    }
                >
                    {side}
                </div>
            ),
        },
        {
            title: "訂單類型",
            width: 150,
            dataIndex: "type",
            showSorterTooltip: {
                target: "full-header",
            },
            filters: [
                {
                    text: "limit",
                    value: "limit",
                },
                {
                    text: "market",
                    value: "market",
                },
            ],
            filteredValue: filteredInfo.type || null,
            onFilter: (value, record) => record.type.indexOf(value) === 0,
            key: "type",
        },
        {
            title: "平均價格",
            width: 150,
            dataIndex: "average",
            key: "average",
            sorter: (a, b) => a.average - b.average,
            sortOrder:
                sortedInfo.columnKey === "average" ? sortedInfo.order : null,
        },
        {
            title: "下單數量(token)",
            width: 150,
            dataIndex: "amount",
            key: "amount",
            sorter: (a, b) => a.amount - b.amount,
            sortOrder:
                sortedInfo.columnKey === "amount" ? sortedInfo.order : null,
        },
        {
            title: "下單數量(USDT)",
            width: 150,
            dataIndex: "cost",
            key: "cost",
            sorter: (a, b) => a.cost - b.cost,
            sortOrder:
                sortedInfo.columnKey === "cost" ? sortedInfo.order : null,
        },
        {
            title: "手續費",
            width: 150,
            dataIndex: "fee",
            key: "fee",
            sorter: (a, b) => a.fee.cost - b.fee.cost,
            sortOrder: sortedInfo.columnKey === "fee" ? sortedInfo.order : null,
            render: (data) => (
                <div>
                    {data.cost}({data.currency})
                </div>
            ),
        },
        {
            title: "下單時間(台灣)",
            width: 150,
            dataIndex: "timestamp",
            key: "timestamp",
            sorter: (a, b) => a.timestamp - b.timestamp,
            sortOrder:
                sortedInfo.columnKey === "timestamp" ? sortedInfo.order : null,
            defaultSortOrder: "descend",
            render: (timestamp) => (
                <div>{transformTimestampToTaipeiDatetime(timestamp)}</div>
            ),
        },
        {
            title: "最後更新時間(台灣)",
            width: 150,
            dataIndex: "lastUpdateTimestamp",
            key: "lastUpdateTimestamp",
            sorter: (a, b) => a.lastUpdateTimestamp - b.lastUpdateTimestamp,
            sortOrder:
                sortedInfo.columnKey === "lastUpdateTimestamp"
                    ? sortedInfo.order
                    : null,
            render: (lastUpdateTimestamp) => (
                <div>
                    {transformTimestampToTaipeiDatetime(lastUpdateTimestamp)}
                </div>
            ),
        },
    ];

    const futureColumns = [
        {
            title: "幣種",
            width: 100,
            dataIndex: "symbol",
            showSorterTooltip: {
                target: "full-header",
            },
            filters: symbolFilter,
            onFilter: (value, record) => record.symbol.indexOf(value) === 0,
            key: "symbol",
            fixed: "left",
        },
    ];

    return (
        <>
            <Spin spinning={isLoading}>
                <Button onClick={clearAll} className="mb-4">
                    清除所有過濾
                </Button>
                <Table
                    dataSource={historyData}
                    columns={
                        tradingMarket === "spot" ? spotColumns : futureColumns
                    }
                    scroll={{
                        x: 200,
                    }}
                    onChange={handleChange}
                >
                    歷史紀錄
                </Table>
            </Spin>
        </>
    );
}

export default function OrderDetailTable(props) {
    const { dataSource, cancelOrderLoading, tradingMarket, account } = props;

    const items = [
        {
            key: "1",
            label: "正在執行訂單",
            children: (
                <OpenOrders
                    dataSource={dataSource}
                    cancelOrderLoading={cancelOrderLoading}
                    tradingMarket={tradingMarket}
                />
            ),
            disabled: account ? false : true,
        },
        {
            key: "2",
            label: "歷史交易紀錄",
            children: (
                <HistoryOrders
                    account={account}
                    tradingMarket={tradingMarket}
                />
            ),
            disabled: account ? false : true,
        },
    ];
    return <Tabs defaultActiveKey="1" items={items} />;
}
