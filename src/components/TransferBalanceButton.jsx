import { useState, useRef } from "react";
import { Button, Modal, Form, Space, Select, message, Spin } from "antd";
import { InputNumber } from "antd";
import axios from "axios";

const { Option } = Select;

export default function TransferBalanceButton(props) {
    const { account, handleTransferSuccess } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fromAccountBalance, setFromAccountBalance] = useState(0);
    const [toAccountBalance, setToAccountBalance] = useState(0);
    const formRef = useRef(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [isFetchingFromAccountBalance, setIsFetchingFromAccountBalance] =
        useState(false);
    const [isFetchingToAccountBalance, setIsFetchingToAccountBalance] =
        useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        formRef.current.submit(); // 提交表單
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const transferBalance = (fromType, toType, account, amount) => {
        const url = `/api/bitget/transferBalance/${account}/${fromType}/${toType}/${amount}/USDT`;
        axios
            .post(url)
            .then((res) => {
                if (res.data.msg === "success") {
                    message.success(
                        `已成功將 ${amount}USDT 從 ${
                            fromType === "spot" ? "現貨帳戶" : "合約帳戶"
                        } 劃轉到 ${toType === "spot" ? "現貨帳戶" : "合約帳戶"}`
                    );
                    setIsModalOpen(false);

                    if (handleTransferSuccess) {
                        handleTransferSuccess();
                    }
                }
            })
            .catch((err) => {
                message.error("劃轉出現錯誤" + err);
                console.log(err);
            });
    };

    const onFromAccountSelect = (value) => {
        setIsFetchingFromAccountBalance(true);
        const accountType = value === "usdt_futures" ? "usdt-futures" : "spot";
        const url = `/api/bitget/getBalance/${account}/${accountType}`;
        axios
            .get(url)
            .then((res) => {
                setFromAccountBalance(res.data.USDT.free);
                setIsFetchingFromAccountBalance(false);
            })
            .catch((err) => console.log(err));
    };

    const onToAccountSelect = (value) => {
        setIsFetchingToAccountBalance(true);
        const accountType = value === "usdt_futures" ? "usdt-futures" : "spot";
        const url = `/api/bitget/getBalance/${account}/${accountType}`;
        axios
            .get(url)
            .then((res) => {
                setToAccountBalance(res.data.USDT.free);
                setIsFetchingToAccountBalance(false);
            })
            .catch((err) => console.log(err));
    };

    const onSubmitForm = (values) => {
        transferBalance(values.from, values.to, account, values.usdt);
    };

    return (
        <>
            {contextHolder}
            <Button className="mb-7" onClick={showModal}>
                現貨合約餘額劃轉
            </Button>
            <Modal
                title="餘額劃轉"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    ref={formRef}
                    name="transfer-balance"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    onFinish={onSubmitForm}
                >
                    <Form.Item label="從">
                        <Space>
                            <Form.Item
                                name="from"
                                noStyle
                                rules={[
                                    {
                                        required: true,
                                        message: "此項為必填",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="選擇從哪個帳戶"
                                    onSelect={onFromAccountSelect}
                                >
                                    <Option value="spot">現貨</Option>
                                    <Option value="usdt_futures">
                                        USDT專業合約
                                    </Option>
                                </Select>
                            </Form.Item>
                            <Spin spinning={isFetchingFromAccountBalance}>
                                {`可用餘額：${fromAccountBalance} USDT`}
                            </Spin>
                        </Space>
                    </Form.Item>
                    <Form.Item label="到">
                        <Space>
                            <Form.Item
                                name="to"
                                noStyle
                                rules={[
                                    {
                                        required: true,
                                        message: "此項為必填",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="選擇到哪個帳戶"
                                    onSelect={onToAccountSelect}
                                >
                                    <Option value="spot">現貨</Option>
                                    <Option value="usdt_futures">
                                        USDT專業合約
                                    </Option>
                                </Select>
                            </Form.Item>
                            <Spin spinning={isFetchingToAccountBalance}>
                                {`可用餘額：${toAccountBalance} USDT`}
                            </Spin>
                        </Space>
                    </Form.Item>
                    <Form.Item label="數量">
                        <Space>
                            <Form.Item
                                name="usdt"
                                noStyle
                                rules={[
                                    {
                                        required: true,
                                        message: "此項為必填",
                                    },
                                ]}
                            >
                                <InputNumber
                                    addonAfter="USDT"
                                    min={0.00000001}
                                    max={fromAccountBalance}
                                    step={0.00000001}
                                    controls
                                />
                            </Form.Item>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
