export const accountAPI = {
    spot: {
        hzLuke: {
            apiKey: process.env.HZLUKE_BITGET_API_KEY,
            secret: process.env.HZLUKE_BITGET_SECRET_KEY,
            password: process.env.HZLUKE_BITGET_PASSWORD,
            options: {
                defaultType: "spot",
                createMarketBuyOrderRequiresPrice: false,
            },
        },
        // "432hz13": {
        //     apiKey: process.env.HZ432_13_BITGET_API_KEY,
        //     secret: process.env.HZ432_13_BITGET_SECRET_KEY,
        //     password: process.env.HZ432_13_BITGET_PASSWORD,
        //     options: {
        //         defaultType: "spot",
        //         createMarketBuyOrderRequiresPrice: false,
        //     },
        // },
        // test: {
        //     apiKey: process.env.TEST_BITGET_API_KEY,
        //     secret: process.env.TEST_BITGET_SECRET_KEY,
        //     password: process.env.TEST_BITGET_PASSWORD,
        //     options: {
        //         defaultType: "spot",
        //         createMarketBuyOrderRequiresPrice: false,
        //     },
        // },
    },
    "usdt-futures": {
        hzLuke: {
            apiKey: process.env.HZLUKE_BITGET_API_KEY,
            secret: process.env.HZLUKE_BITGET_SECRET_KEY,
            password: process.env.HZLUKE_BITGET_PASSWORD,
            options: {
                defaultType: "future",
                createMarketBuyOrderRequiresPrice: false,
            },
        },
        // "432hz13": {
        //     apiKey: process.env.HZ432_13_BITGET_API_KEY,
        //     secret: process.env.HZ432_13_BITGET_SECRET_KEY,
        //     password: process.env.HZ432_13_BITGET_PASSWORD,
        //     options: {
        //         defaultType: "future",
        //         createMarketBuyOrderRequiresPrice: false,
        //     },
        // },
        // test: {
        //     apiKey: process.env.TEST_BITGET_API_KEY,
        //     secret: process.env.TEST_BITGET_SECRET_KEY,
        //     password: process.env.TEST_BITGET_PASSWORD,
        //     options: {
        //         defaultType: "future",
        //         createMarketBuyOrderRequiresPrice: false,
        //     },
        // },
    },
};

export const accountOptions = [
    {
        value: "hzLuke",
        label: "hzLuke",
    },
    // {
    //     value: "test",
    //     label: "test",
    // },
];
