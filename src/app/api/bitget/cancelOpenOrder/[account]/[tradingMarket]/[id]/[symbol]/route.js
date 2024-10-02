import ccxt from "ccxt";
import { NextResponse } from "next/server";
import { accountAPI } from "@/account";

export const POST = async (_, { params }) => {
    const { account, id, tradingMarket, symbol } = params;

    let bitget = null;

    if (account === "test") {
        bitget = new ccxt.bitget(accountAPI[tradingMarket][account]);
        bitget.setSandboxMode(true);
    } else {
        bitget = new ccxt.bitget(accountAPI[tradingMarket][account]);
    }

    try {
        if (tradingMarket === "spot") {
            const order = await bitget.cancelOrder(id, symbol);
            return NextResponse.json(order);
        } else if (tradingMarket === "usdt-futures") {
            const order = await bitget.closePosition(symbol.split(":")[0]);
            return NextResponse.json(order);
        }
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
