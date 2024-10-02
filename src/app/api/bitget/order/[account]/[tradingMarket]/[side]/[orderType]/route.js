import ccxt from "ccxt";
import { NextResponse } from "next/server";
import { accountAPI } from "@/account";

export const POST = async (req, { params }) => {
    const { account, side, orderType, tradingMarket } = params;

    const {
        amount,
        price,
        leverage,
        presetStopLossPrice, //止損
        presetStopSurplusPrice, //止盈
        symbol,
    } = await req.json(); // 一次性讀取 JSON 數據
    console.log(amount);

    let processedSymbol = symbol.replace("/", ""); // 處理 symbol

    let bitget = null;

    if (account === "test") {
        bitget = new ccxt.bitget(accountAPI[tradingMarket][account]);
        bitget.setSandboxMode(true);
    } else {
        bitget = new ccxt.bitget(accountAPI[tradingMarket][account]);
    }

    if (tradingMarket === "usdt-futures") {
        bitget.setLeverage(leverage, processedSymbol);
    }
    const param = {};

    if (presetStopLossPrice) {
        param.presetStopLossPrice = presetStopLossPrice;
    }

    if (presetStopSurplusPrice) {
        param.presetStopSurplusPrice = presetStopSurplusPrice;
    }

    try {
        if (tradingMarket == "spot") {
            let order;
            if (orderType === "limit") {
                order = await bitget.createLimitOrder(
                    processedSymbol,
                    side,
                    amount,
                    price
                );
                const id = order.id;
                const orderDetail = await bitget.fetchOrder(
                    id,
                    processedSymbol
                );
                return NextResponse.json(orderDetail);
            } else {
                if (side === "buy") {
                    const ticker = await bitget.fetchTicker(processedSymbol);
                    const tickerPrice = ticker.close;
                    const buyAmount = amount * tickerPrice;

                    order = await bitget.createMarketOrder(
                        processedSymbol,
                        side,
                        buyAmount
                    );
                    const id = order.id;
                    const orderDetail = await bitget.fetchOrder(
                        id,
                        processedSymbol
                    );
                    return NextResponse.json(orderDetail);
                }
                order = await bitget.createMarketOrder(
                    processedSymbol,
                    side,
                    amount
                );
                const id = order.id;
                const orderDetail = await bitget.fetchOrder(
                    id,
                    processedSymbol
                );
                return NextResponse.json(orderDetail);
            }
        } else if (tradingMarket == "usdt-futures") {
            if (orderType === "limit") {
                let order = await bitget.privateMixPostV2MixOrderPlaceOrder({
                    symbol: processedSymbol,
                    side: side,
                    orderType: orderType,
                    price: price,
                    leverage: leverage,
                    productType: tradingMarket,
                    marginMode: "crossed",
                    marginCoin: "USDT",
                    size: amount,
                    presetStopSurplusPrice: presetStopSurplusPrice,
                    presetStopLossPrice: presetStopLossPrice,
                });

                order = await bitget.privateMixGetV2MixOrderDetail({
                    symbol: processedSymbol,
                    orderId: order.data.orderId,
                    productType: tradingMarket,
                });
                return NextResponse.json(order);
            } else {
                let order = await bitget.privateMixPostV2MixOrderPlaceOrder({
                    symbol: processedSymbol,
                    side: side,
                    orderType: orderType,
                    leverage: leverage,
                    productType: tradingMarket,
                    marginMode: "crossed",
                    marginCoin: "USDT",
                    size: amount,
                    presetStopSurplusPrice: presetStopSurplusPrice,
                    presetStopLossPrice: presetStopLossPrice,
                });

                order = await bitget.privateMixGetV2MixOrderDetail({
                    symbol: processedSymbol,
                    orderId: order.data.orderId,
                    productType: tradingMarket,
                });
                return NextResponse.json(order);
            }
        }
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
