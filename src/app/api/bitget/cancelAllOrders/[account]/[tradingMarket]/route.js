import ccxt from "ccxt";
import { NextResponse } from "next/server";
import { accountAPI } from "@/account";

export const POST = async (_, { params }) => {
    const { account, tradingMarket } = params;

    let bitget = null;

    if (account === "test") {
        bitget = new ccxt.bitget(accountAPI[tradingMarket][account]);
        bitget.setSandboxMode(true);
    } else {
        bitget = new ccxt.bitget(accountAPI[tradingMarket][account]);
    }

    try {
        if (tradingMarket === "spot") {
            const orders = await bitget.fetchOpenOrders();

            const uniqueSymbols = [
                ...new Set(orders.map((order) => order.symbol)),
            ];
            for (const symbol of uniqueSymbols) {
                await bitget.cancelAllOrders(symbol);
            }
            return NextResponse.json({ status: "success" });
        } else if (tradingMarket === "usdt-futures") {
            const orders = await bitget.closeAllPositions();
            return NextResponse.json(orders);
        }
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
