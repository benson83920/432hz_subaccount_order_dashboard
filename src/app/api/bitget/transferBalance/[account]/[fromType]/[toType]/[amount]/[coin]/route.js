import ccxt from "ccxt";
import { NextResponse } from "next/server";
import { accountAPI } from "@/account";

export const POST = async (_, { params }) => {
    const { account, fromType, toType, amount, coin } = params;
    let bitget = null;

    const param = {
        fromType,
        toType,
        amount,
        coin,
    };

    if (account === "test") {
        bitget = new ccxt.bitget(accountAPI["spot"][account]);
        bitget.setSandboxMode(true);
    } else {
        bitget = new ccxt.bitget(accountAPI["spot"][account]);
        const result = await bitget.privateSpotPostV2SpotWalletTransfer(param);
        return NextResponse.json(result);
    }

    try {
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
