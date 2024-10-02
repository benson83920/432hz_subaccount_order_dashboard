import React from "react";

const data = [
    {
        buyVolume: "",
        buyPrice: "",
        midPrice: "38.50",
        sellPrice: "",
        sellVolume: "",
    },
    {
        buyVolume: "",
        buyPrice: "",
        midPrice: "38.45",
        sellPrice: "347",
        sellVolume: "",
    },
    {
        buyVolume: "",
        buyPrice: "",
        midPrice: "38.40",
        sellPrice: "389",
        sellVolume: "",
    },
    {
        buyVolume: "",
        buyPrice: "",
        midPrice: "38.35",
        sellPrice: "333",
        sellVolume: "",
    },
    {
        buyVolume: "",
        buyPrice: "",
        midPrice: "38.30",
        sellPrice: "204",
        sellVolume: "",
    },
    {
        buyVolume: "668",
        buyPrice: "38.20",
        midPrice: "38.25",
        sellPrice: "",
        sellVolume: "15",
    },
    {
        buyVolume: "1005",
        buyPrice: "38.15",
        midPrice: "",
        sellPrice: "",
        sellVolume: "",
    },
    {
        buyVolume: "902",
        buyPrice: "38.10",
        midPrice: "",
        sellPrice: "",
        sellVolume: "",
    },
    {
        buyVolume: "1175",
        buyPrice: "38.05",
        midPrice: "",
        sellPrice: "",
        sellVolume: "",
    },
    {
        buyVolume: "2135",
        buyPrice: "38.00",
        midPrice: "",
        sellPrice: "",
        sellVolume: "",
    },
    {
        buyVolume: "",
        buyPrice: "",
        midPrice: "37.95",
        sellPrice: "",
        sellVolume: "",
    },
];

export default function OrderbookTable() {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="grid grid-cols-5 gap-0.5 bg-gray-800 text-white">
                {/* Header */}
                <div className="col-span-1 text-center py-2 bg-green-800">
                    刪買
                </div>
                <div className="col-span-1 text-center py-2 bg-green-600">
                    漲停買
                </div>
                <div className="col-span-1 text-center py-2 bg-black">
                    五檔置中
                </div>
                <div className="col-span-1 text-center py-2 bg-red-600">
                    跌停賣
                </div>
                <div className="col-span-1 text-center py-2 bg-red-800">
                    刪賣
                </div>
                {/* Rows */}
                {data.map((row, index) => (
                    <React.Fragment key={index}>
                        <div
                            className={`col-span-1 text-center py-1 ${
                                row.buyVolume ? "bg-green-800" : "bg-gray-800"
                            }`}
                        >
                            {row.buyVolume}
                        </div>
                        <div
                            className={`col-span-1 text-center py-1 ${
                                row.buyPrice
                                    ? "bg-green-600 text-green-200"
                                    : "bg-gray-800"
                            }`}
                        >
                            {row.buyPrice}
                        </div>
                        <div className="col-span-1 text-center py-1 bg-black">
                            {row.midPrice}
                        </div>
                        <div
                            className={`col-span-1 text-center py-1 ${
                                row.sellPrice
                                    ? "bg-red-600 text-pink-200"
                                    : "bg-gray-800"
                            }`}
                        >
                            {row.sellPrice}
                        </div>
                        <div
                            className={`col-span-1 text-center py-1 ${
                                row.sellVolume ? "bg-red-800" : "bg-gray-800"
                            }`}
                        >
                            {row.sellVolume}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
