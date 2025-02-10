const { getLogsAggregate } = require("../storage");

getLogsAggregate().then((r) => {
    console.log(JSON.stringify(r));
})