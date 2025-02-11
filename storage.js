const fs = require('fs')
const path = require('path')

const uniqueVisitorsDir = "/logs/unique-visitors"

/*
interface
{
    host: "domain.com",
    logger: "http.log.access",
    level: "info",
    client_ip: "41.1.2.3",
    date: "Mon Feb 10 2025 19:19:19 GMT+0200 (Eastern European Standard Time)",
    day: "2025-02-10",
    status: 200,
    duration: 0.541777,
    uri: "/version.json"
}
*/
module.exports.persistLog = async function (log) {
    const dayDir = path.join(uniqueVisitorsDir, log.day);
    fs.mkdirSync(dayDir, { recursive: true });
    const filePath = path.join(dayDir, log.host);
    const exists = fs.existsSync(filePath);
    const currentIp = log.client_ip.toString();
    if (exists) {
        const existingIps = fs.readFileSync(filePath).toString().split(",");
        if (!existingIps.includes(currentIp)) {
            existingIps.push(currentIp);
            fs.writeFileSync(filePath, existingIps.join(","));
        }
    } else {
        fs.writeFileSync(filePath, currentIp);
    }
}

/*
interface
{
    "2025-01-01":{
        "domain1.com":3,
        "domain2.com":2,
       "domain3.com":11
    },
    "2025-01-02":{
       "domain1.com":4,
        "domain2.com":3,
       "domain3.com":7
   },
}
*/
module.exports.getLogsAggregate = async function () {
    const result = {}
    const dateFolders = fs.readdirSync(uniqueVisitorsDir);
    dateFolders.sort((a, b) => Date.parse(b) - Date.parse(a));
    for (const folder of dateFolders) {
        const domainFiles = fs.readdirSync(path.join(uniqueVisitorsDir, folder));
        result[folder] = {}
        for (const domain of domainFiles) {
            const ips = fs.readFileSync(path.join(uniqueVisitorsDir, folder, domain)).toString().split(",");
            const count = (new Set(ips)).size;
            result[folder][domain] = count;
        }
    }
    return result;
}
