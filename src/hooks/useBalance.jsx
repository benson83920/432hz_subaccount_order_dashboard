import { useState } from "react";
import axios from "axios";

export const useBalance = () => {
    const [balanceData, setBalanceData] = useState([]);
    const [isBalanceLoading, setIsBalanceLoading] = useState(false);

    const updateBalance = async (account, tradingMarket) => {
        setIsBalanceLoading(true);
        try {
            const balanceUrl = `/api/bitget/getBalance/${account}/${tradingMarket}`;
            const response = await axios.get(balanceUrl);
            const balance = response.data;
            const formattedBalanceData = Object.keys(balance.total)
                .map((coin) => [
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
                    },
                ])
                .flat();
            setBalanceData(formattedBalanceData);
        } catch (error) {
            console.error("Error updating balance:", error);
        } finally {
            setIsBalanceLoading(false);
        }
    };

    return { balanceData, isBalanceLoading, updateBalance };
};
