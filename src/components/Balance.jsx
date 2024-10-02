import { Descriptions, Spin } from "antd";

export default function Balance(props) {
    const { balance, isBalanceLoading } = props;

    return (
        <Spin spinning={isBalanceLoading}>
            {!isBalanceLoading && (
                <Descriptions title={"餘額資訊"} items={balance} />
            )}
        </Spin>
    );
}
