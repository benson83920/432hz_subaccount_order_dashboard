"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Form,
    InputNumber,
    Space,
    Radio,
    Select,
    Spin,
    message,
    Divider,
    Popconfirm,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import axios from "axios";

import OrderDetailTable from "./OrderDetailTable";
import Balance from "./Balance";
import { transformTimestampToTaipeiDatetime } from "@/utils";
import { accountOptions } from "@/account";
import { useBalance } from "@/hooks/useBalance"; // 引入 useBalance hook
import TransferBalanceButton from "./TransferBalanceButton";

export default function Order() {
    const [form] = Form.useForm();

    // 獲取表單的值
    const values = Form.useWatch([], form);

    // 監聽orderType的值
    const orderType = Form.useWatch("orderType", form);
    // 是否可進行買賣
    const [submittable, setSubmittable] = useState(false);
    // 是否正在下單
    const [orderLoading, setOrderLoading] = useState(false);
    // 是否正在獲取訂單
    const [tableLoading, setTableLoading] = useState(false);
    // 是否正在取消訂單
    const [cancelOrderLoading, setCancelOrderLoading] = useState(false);
    // 正在掛的訂單
    const [openOrdersDetail, setOpenOrdersDetail] = useState([]);
    // 餘額資料
    const [balanceData, setBalanceData] = useState([]);
    // 是否正在獲取餘額
    const [isBalanceLoading, setIsBalanceLoading] = useState(false);
    // 是否已經選定帳戶
    const [isAccountSelected, setIsAccountSelected] = useState(false);
    //帳戶
    const [account, setAccount] = useState(null);
    //是否已經選好交易市場
    const [isSelectMarketTrading, setIsSelectMarketTrading] = useState(true);
    // 可使用的交易對
    const [symbolOptions, setSymbolOptions] = useState([]);
    // 設置現貨 or USDT專業合約市場
    const [tradingMarket, setTradingMarket] = useState(null);

    // 是否正在獲取交易對
    const [getSymbolsLoading, setGetSymbolsLoading] = useState(false);

    //最小下單數量(token)
    const [minTradeAmount, setMinTradeAmount] = useState(0);

    //最小下單精度
    const [minTradePrecision, setMinTradePrecision] = useState(0.0001);

    // 提示訊息
    const [messageApi, contextHolder] = message.useMessage();

    // 監聽所有表單是否填入
    useEffect(() => {
        form.validateFields({
            validateOnly: true,
        })
            .then(() => setSubmittable(true))
            .catch(() => setSubmittable(false));
    }, [form, values]);

    useEffect(() => {
        // 如果 openOrdersDetail 有資料才進行重複撈取
        if (openOrdersDetail.length > 0) {
            const intervalId = setInterval(() => {
                const url = `/api/bitget/getOpenOrders/${account}/${tradingMarket}`;
                axios
                    .get(url)
                    .then((res) => {
                        setOpenOrdersDetail(res.data);
                    })
                    .catch((error) => console.log(error));
            }, 3000);

            // 在組件卸載時清除定時器
            return () => clearInterval(intervalId);
        }
    }, [openOrdersDetail, account, tradingMarket]);

    // 监听 tradingMarket 变化
    useEffect(() => {
        if (account && tradingMarket) {
            getOpenOrderDetail(account);
            getAllSymbols(tradingMarket, account);
        }
    }, [tradingMarket, account]);

    //下單成功的訊息
    const orderSuccess = (order) => {
        messageApi.open({
            type: "success",
            content: (
                <>
                    {tradingMarket === "spot" ? (
                        //現貨
                        <>
                            <div>下單成功</div>
                            <div>
                                下單類型：
                                {order.type === "limit" ? "限價單" : "市價單"}
                            </div>
                            <div>幣種：{order.symbol}</div>
                            <div>方向：{order.side}</div>
                            <div>價格：{order.price}</div>
                            <div>數量：{order.amount}</div>
                            <div>
                                台灣時間：
                                {transformTimestampToTaipeiDatetime(
                                    order.timestamp
                                )}
                            </div>
                        </>
                    ) : (
                        //合約
                        <>
                            <div>下單成功</div>

                            <div>幣種：{order.symbol}</div>
                            <div>方向：{order.side}</div>
                            <div>價格：{order.priceAvg}</div>
                            <div>數量：{order.baseVolume}</div>
                            <div>槓桿：{order.leverage}</div>
                            <div>止損價：{order.presetStopLossPrice}</div>
                            <div>止盈價：{order.presetStopSurplusPrice}</div>
                            <div>
                                台灣時間：
                                {transformTimestampToTaipeiDatetime(
                                    Number(order.cTime)
                                )}
                            </div>
                        </>
                    )}
                </>
            ),
        });
    };

    //下單失敗的訊息
    const orderError = (error) => {
        messageApi.open({
            type: "error",
            content: `下單出錯：${error}`,
        });
    };

    // 取消訂單的成功訊息
    const cancelOrderSuccess = () => {
        messageApi.open({
            type: "success",
            content: (
                <div>
                    {tradingMarket === "spot" ? "取消訂單成功" : "平倉成功"}
                </div>
            ),
        });
    };

    // 取消訂單失敗的訊息
    const cancelOrderError = (error) => {
        messageApi.open({
            type: "error",
            content: (
                <div>
                    {tradingMarket === "spot"
                        ? `訂單不存在 或是 取消訂單失敗：${error}`
                        : `倉位不存在 或是 取消倉位失敗：${error}`}
                </div>
            ),
        });
    };

    // 取消所有訂單的成功訊息
    const cancelAllOrdersSuccess = () => {
        messageApi.open({
            type: "success",
            content: (
                <div>
                    {tradingMarket === "spot"
                        ? "取消所有訂單成功"
                        : "平掉所有倉位成功"}
                </div>
            ),
        });
    };

    // 取消所有訂單失敗的訊息
    const cancelAllOrdersError = (error) => {
        messageApi.open({
            type: "error",
            content: (
                <div>
                    {tradingMarket === "spot"
                        ? `取消所有訂單失敗：${error}`
                        : `平掉所有倉位失敗：${error}`}
                </div>
            ),
        });
    };

    // 買入邏輯
    const onBuy = (value) => {
        setOrderLoading(true);

        const buyUrl = `/api/bitget/order/${value.account}/${tradingMarket}/buy/${value.orderType}`;
        const jsonData = {
            price: value.price,
            amount: value.amount,
            symbol: value.symbol,
            leverage: value.leverage ? value.leverage : 1,
            presetStopLossPrice: value.presetStopLossPrice
                ? value.presetStopLossPrice
                : null,
            presetStopSurplusPrice: value.presetStopSurplusPrice
                ? value.presetStopSurplusPrice
                : null,
        };
        axios
            .post(buyUrl, jsonData)
            .then((response) => {
                setOrderLoading(false);
                if (tradingMarket === "spot") {
                    orderSuccess(response.data);
                } else {
                    orderSuccess(response.data.data);
                }

                getOpenOrderDetail(values.account);
            })
            .catch((error) => {
                console.error("Error:", error);
                setOrderLoading(false);
                orderError(error);
            });
    };

    // 賣出邏輯
    const onSell = () => {
        setOrderLoading(true);

        const buyUrl = `/api/bitget/order/${values.account}/${tradingMarket}/sell/${values.orderType}`;
        const jsonData = {
            price: values.price,
            amount: values.amount,
            symbol: values.symbol,
            leverage: values.leverage ? values.leverage : 1,
            presetStopLossPrice: values.presetStopLossPrice
                ? values.presetStopLossPrice
                : null,
            presetStopSurplusPrice: values.presetStopSurplusPrice
                ? values.presetStopSurplusPrice
                : null,
        };
        axios
            .post(buyUrl, jsonData)
            .then((response) => {
                setOrderLoading(false);
                if (tradingMarket === "spot") {
                    orderSuccess(response.data);
                } else {
                    orderSuccess(response.data.data);
                }
                getOpenOrderDetail(values.account);
            })
            .catch((error) => {
                console.error("Error:", error);
                setOrderLoading(false);
                orderError(error);
            });
    };

    // 獲取正在掛的訂單以及餘額更新
    const getOpenOrderDetail = async (account) => {
        setTableLoading(true);
        setIsBalanceLoading(true);
        setIsAccountSelected(true);
        setAccount(account);

        const openOrderUrl = `/api/bitget/getOpenOrders/${account}/${tradingMarket}`;
        const balanceUrl = `/api/bitget/getBalance/${account}/${tradingMarket}`;

        axios
            .get(openOrderUrl)
            .then((response) => {
                setOpenOrdersDetail(response.data);
                setTableLoading(false);
            })
            .catch((error) => {
                console.error("Error:", error);
                setTableLoading(false);
            });

        axios
            .get(balanceUrl)
            .then((response) => {
                const balance = response.data;
                const balanceData = [];

                // 迭代所有餘額中的硬幣
                Object.keys(balance.total).forEach((coin) => {
                    balanceData.push(
                        {
                            key: `${coin.toLowerCase()}Total`,
                            label: `${coin} 全部`,
                            children: balance.total[coin],
                        },
                        {
                            key: `${coin.toLowerCase()}Free`,
                            label: `${coin} 可用`,
                            children: balance.free[coin],
                        },
                        {
                            key: `${coin.toLowerCase()}Used`,
                            label: `${coin} 已使用`,
                            children: balance.used[coin],
                        }
                    );
                });

                setBalanceData(balanceData);
                setIsBalanceLoading(false);
            })
            .catch((error) => {
                console.error("Error:", error);
                setIsBalanceLoading(false);
            });
    };

    // 取消指定訂單
    const cancelOpenOrder = async (id, symbol) => {
        setCancelOrderLoading(true);
        const url = `/api/bitget/cancelOpenOrder/${
            values.account
        }/${tradingMarket}/${id}/${symbol.replace("/", "")}`;
        axios
            .post(url)
            .then(() => {
                getOpenOrderDetail(values.account);
                setCancelOrderLoading(false);
                cancelOrderSuccess();
            })
            .catch((error) => {
                console.error("Error:", error);
                setCancelOrderLoading(false);
                cancelOrderError(error);
                getOpenOrderDetail(values.account);
            });
    };

    // 取消所有訂單
    const cancelAllOrders = async () => {
        setCancelOrderLoading(true);
        const url = `/api/bitget/cancelAllOrders/${values.account}/${tradingMarket}`;
        axios
            .post(url)
            .then(() => {
                getOpenOrderDetail(values.account);
                setCancelOrderLoading(false);
                cancelAllOrdersSuccess();
            })
            .catch((error) => {
                console.error("Error:", error);
                setCancelOrderLoading(false);
                cancelAllOrdersError(error);
            });
    };

    // 選擇交易市場
    const onTradingMarketChange = (market) => {
        setTradingMarket(market);
        setGetSymbolsLoading(true);
        // 取得目前表單的所有值
        const currentValues = form.getFieldsValue();

        // 需要保留的item
        const fieldsToKeep = ["tradingMarket", "account"];

        // 獲取需要重置的items
        const fieldsToReset = Object.keys(currentValues).filter(
            (field) => !fieldsToKeep.includes(field)
        );

        // 重置除指定item之外的其他items
        form.resetFields(fieldsToReset);

        axios
            .get(`/api/bitget/getAllSymbols/${market}/${account}`)
            .then((res) => {
                const options = res.data.data.map((item) => {
                    return {
                        value: item.symbol,
                        label: item.symbol,
                    };
                });
                setSymbolOptions(options);
                setIsSelectMarketTrading(false);
                setGetSymbolsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getAllSymbols = (tradingMarket, account) => {
        axios
            .get(`/api/bitget/getAllSymbols/${tradingMarket}/${account}`)
            .then((res) => {
                const options = res.data.data.map((item) => {
                    return {
                        value: item.symbol,
                        label: item.symbol,
                    };
                });
                setSymbolOptions(options);
                setIsSelectMarketTrading(false);
                setGetSymbolsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getSymbolDetail = (symbol) => {
        const url =
            tradingMarket === "usdt-futures"
                ? `https://api.bitget.com/api/v2/mix/market/contracts?productType=usdt-futures&symbol=${symbol}`
                : `https://api.bitget.com/api/v2/spot/public/symbols?symbol=${symbol}`;
        axios
            .get(url)
            .then((res) => {
                if (tradingMarket === "usdt-futures") {
                    setMinTradeAmount(Number(res.data.data[0].minTradeNum));
                    setMinTradePrecision(
                        Number(res.data.data[0].sizeMultiplier)
                    );
                } else if (tradingMarket === "spot") {
                    setMinTradeAmount(Number(res.data.data[0].minTradeUSDT));
                    setMinTradePrecision(
                        (
                            0.1 ** Number(res.data.data[0].quantityPrecision)
                        ).toPrecision(
                            Number(res.data.data[0].quantityPrecision)
                        )
                    );
                }
            })
            .catch((error) => console.error(error));
    };

    const handleTransferSuccess = () => {
        getOpenOrderDetail(account);
    };

    return (
        <div className="flex flex-col md:grid md:grid-cols-3 md:grid-rows-1 gap-4">
            {contextHolder}
            <div className="w-full">
                {getSymbolsLoading}
                <Spin size="small" spinning={getSymbolsLoading}>
                    <Form
                        name="orderData"
                        layout="vertical"
                        onFinish={onBuy}
                        onReset={onSell}
                        form={form}
                    >
                        <Form.Item
                            name="tradingMarket"
                            label="交易市場"
                            rules={[
                                {
                                    required: true,
                                    message: "交易市場為必選項",
                                },
                            ]}
                        >
                            <Select
                                placeholder="請選擇現貨or合約"
                                onChange={onTradingMarketChange}
                                options={[
                                    {
                                        value: "spot",
                                        label: "現貨",
                                    },
                                    {
                                        value: "usdt-futures",
                                        label: "USDT專業合約",
                                    },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="account"
                            label="帳戶"
                            rules={[
                                {
                                    required: true,
                                    message: "帳戶為必選項",
                                },
                            ]}
                        >
                            <Select
                                onChange={getOpenOrderDetail}
                                options={accountOptions}
                                placeholder="請選擇帳戶"
                                disabled={isSelectMarketTrading}
                            />
                        </Form.Item>
                        <Form.Item
                            name="symbol"
                            label="交易對"
                            rules={[
                                {
                                    required: true,
                                    message: "交易對為必選項",
                                },
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder="請選擇交易對"
                                optionFilterProp="label"
                                disabled={isSelectMarketTrading}
                                onChange={getSymbolDetail}
                                options={symbolOptions}
                            />
                        </Form.Item>

                        <Form.Item
                            name="orderType"
                            label="訂單類型"
                            rules={[
                                {
                                    required: true,
                                    message: "訂單類型為必選項",
                                },
                            ]}
                        >
                            <Radio.Group disabled={isSelectMarketTrading}>
                                <Radio.Button value="market">市價</Radio.Button>
                                <Radio.Button value="limit">限價</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            name="amount"
                            label={
                                tradingMarket === "spot" ? (
                                    <div className="flex flex-col justify-start">
                                        <div>
                                            {values.orderType === "market"
                                                ? "買入時數量為USDT，賣出時數量為Token"
                                                : "數量(token)"}
                                        </div>
                                        <div>
                                            最小下單數量: {minTradeAmount}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-start">
                                        <div>合約數量(token)</div>
                                        <div>
                                            最小下單數量: {minTradeAmount}
                                        </div>
                                    </div>
                                )
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "數量為必填項",
                                },
                            ]}
                        >
                            <InputNumber
                                min={minTradeAmount}
                                step={minTradePrecision}
                                disabled={isSelectMarketTrading}
                            />
                        </Form.Item>
                        <Form.Item
                            name="leverage"
                            label="槓桿"
                            className={
                                tradingMarket !== "usdt-futures" ? "hidden" : ""
                            }
                        >
                            <InputNumber
                                min={1}
                                step={1}
                                max={10}
                                disabled={isSelectMarketTrading}
                                defaultValue={1}
                            />
                        </Form.Item>
                        <Form.Item
                            name="presetStopLossPrice"
                            label="止損價"
                            className={
                                tradingMarket !== "usdt-futures" ? "hidden" : ""
                            }
                        >
                            <InputNumber
                                min={0}
                                step={0.0001}
                                disabled={isSelectMarketTrading}
                            />
                        </Form.Item>
                        <Form.Item
                            name="presetStopSurplusPrice"
                            label="止盈價"
                            className={
                                tradingMarket !== "usdt-futures" ? "hidden" : ""
                            }
                        >
                            <InputNumber
                                min={0}
                                step={0.0001}
                                disabled={isSelectMarketTrading}
                            />
                        </Form.Item>
                        <Form.Item
                            name="price"
                            label="價格"
                            rules={[
                                {
                                    required: orderType === "limit",
                                    message: "限價訂單價格為必填項",
                                },
                            ]}
                            className={orderType !== "limit" ? "hidden" : ""}
                        >
                            <InputNumber
                                min={0}
                                step={0.0001}
                                disabled={isSelectMarketTrading}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Space>
                                <Spin size="small" spinning={orderLoading}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        disabled={!submittable}
                                    >
                                        {tradingMarket === "spot"
                                            ? "買入"
                                            : "做多"}
                                    </Button>
                                </Spin>
                                <Spin size="small" spinning={orderLoading}>
                                    <Button
                                        htmlType="button"
                                        type="primary"
                                        onClick={onSell}
                                        disabled={!submittable}
                                        danger
                                    >
                                        {tradingMarket === "spot"
                                            ? "賣出"
                                            : "做空"}
                                    </Button>
                                </Spin>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </div>

            <div className="col-span-2">
                {isAccountSelected && (
                    <>
                        <TransferBalanceButton
                            account={account}
                            handleTransferSuccess={handleTransferSuccess}
                        />
                        <Balance
                            balance={balanceData}
                            isBalanceLoading={isBalanceLoading}
                        />
                        <Divider />
                    </>
                )}

                <Popconfirm
                    title="刪除所有訂單"
                    description="確定刪除所有訂單？"
                    okText="確定"
                    cancelText="取消"
                    icon={
                        <QuestionCircleOutlined
                            style={{
                                color: "red",
                            }}
                        />
                    }
                    onConfirm={cancelAllOrders}
                >
                    <Button
                        danger
                        type="primary"
                        className="mb-4"
                        disabled={openOrdersDetail.length === 0 || tableLoading}
                    >
                        {tradingMarket === "spot"
                            ? "取消全部訂單"
                            : "全部倉位平倉"}
                    </Button>
                </Popconfirm>
                <Spin spinning={tableLoading}>
                    <OrderDetailTable
                        dataSource={openOrdersDetail}
                        cancelOpenOrder={cancelOpenOrder}
                        cancelOrderLoading={cancelOrderLoading}
                        tradingMarket={tradingMarket}
                        account={account}
                    />
                </Spin>
            </div>
        </div>
    );
}
