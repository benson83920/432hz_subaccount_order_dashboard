export const transformTimestampToTaipeiDatetime = (timestamp) => {
    const date = new Date(timestamp);

    const options = {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    const formatter = new Intl.DateTimeFormat("zh-TW", options);
    const formattedDate = formatter.format(date);
    return formattedDate;
};
