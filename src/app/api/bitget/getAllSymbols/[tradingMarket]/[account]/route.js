import ccxt from "ccxt";
import { NextResponse } from "next/server";

export const GET = async (_, { params }) => {
    const { tradingMarket, account } = params;

    let bitget = null;

    if (account === "test") {
        bitget = new ccxt.bitget();
        bitget.setSandboxMode(true);
    } else {
        bitget = new ccxt.bitget();
    }

    try {
        if (tradingMarket === "spot") {
            const symbols = await bitget.publicSpotGetV2SpotPublicSymbols();
            return NextResponse.json(symbols);
        } else {
            const symbols = await bitget.publicMixGetV2MixMarketTickers({
                productType: tradingMarket,
            });
            return NextResponse.json(symbols);
        }
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
