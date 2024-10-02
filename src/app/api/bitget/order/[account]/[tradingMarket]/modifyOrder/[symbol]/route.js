import ccxt from "ccxt";
import { NextResponse } from "next/server";
import { accountAPI } from "@/account";

export const POST = async (req, { params }) => {
    const { account, tradingMarket, symbol } = params;
    const { newPresetStopLossPrice, newPresetStopSurplusPrice, orderId } =
        await req.json();

    let bitget = null;

    if (account === "test") {
        bitget = new ccxt.bitget(accountAPI[tradingMarket][account]);
        bitget.setSandboxMode(true);
    } else {
        bitget = new ccxt.bitget(accountAPI[tradingMarket][account]);
    }

    try {
        const param = {
            symbol: symbol,
            productType: tradingMarket,
            newPresetStopSurplusPrice: newPresetStopSurplusPrice, //止盈
            newPresetStopLossPrice: newPresetStopLossPrice, //止損,
            orderId: orderId,
        };

        const order = await bitget.privateMixPostV2MixOrderModifyOrder(param);
        return NextResponse.json(order);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
