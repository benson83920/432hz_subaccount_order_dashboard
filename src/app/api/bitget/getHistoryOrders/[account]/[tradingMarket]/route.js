import ccxt from "ccxt";
import { NextResponse } from "next/server";
import { accountAPI } from "@/account";

export const GET = async (_, { params }) => {
    const { tradingMarket, account } = params;

    let bitget = null;

    if (account === "test") {
        bitget = new ccxt.bitget();
        bitget.setSandboxMode(true);
    } else {
        bitget = new ccxt.bitget(accountAPI[tradingMarket][account]);
    }

    try {
        if (tradingMarket === "spot") {
            const closedOrders = await bitget.fetchClosedOrders();
            return NextResponse.json(closedOrders);
        } else {
            const param = { productType: tradingMarket };
            const closedPositions =
                await bitget.privateMixGetV2MixOrderFillHistory(param);
            return NextResponse.json(closedPositions);
        }
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
