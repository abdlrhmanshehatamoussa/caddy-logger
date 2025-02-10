const { getLogReport } = require("../app");
const path = require('path');

getLogReport().then((r) => {
    const filePath = path.join(__dirname, "output.test.html")
    require('fs').writeFileSync(filePath, r);
})