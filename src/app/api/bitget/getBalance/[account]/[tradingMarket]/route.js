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
        const balance = await bitget.fetchBalance();
        return NextResponse.json(balance);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
