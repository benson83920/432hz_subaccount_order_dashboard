import ccxt from "ccxt";
import { NextResponse } from "next/server";
import { accountAPI } from "@/account";

export const GET = async (_, { params }) => {
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
            const openOrders = await bitget.fetchOpenOrders();
            return NextResponse.json(openOrders);
        } else if (tradingMarket === "usdt-futures") {
            const openPositions = await bitget.fetchPositions();
            return NextResponse.json(openPositions);
        }
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
