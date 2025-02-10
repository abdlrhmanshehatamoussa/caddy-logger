const { getLogsAggregate, persistLog } = require("./storage");

module.exports.parseAndPersistLog = async function (logBuffer) {
    try {
        const logString = logBuffer.toString();
        if (!logString || !logString.trim()) {
            return;
        }
        const log = JSON.parse(logString);
        if (!log.logger || !log.logger.includes("http.log.access")) {
            return;
        }
        const date = new Date(Math.round(log.ts * 1000))
        const monthString = ("0" + (date.getMonth() + 1)).slice(-2)
        const dayOfMonthString = ("0" + date.getDate()).slice(-2);
        const dayFormatted = `${date.getFullYear()}-${monthString}-${dayOfMonthString}`;
        const simplifiedLog = {
            host: log.request.host.replace("www.", ""),
            logger: log.logger,
            level: log.level,
            client_ip: log.request.client_ip,
            date: date,
            day: dayFormatted,
            status: log.status,
            duration: log.duration,
            uri: log.request.uri
        }
        await persistLog(simplifiedLog);
        return simplifiedLog;
    } catch (error) {
        console.log('Error while parsing or persisting log', logBuffer.toString(), error);
        return logBuffer.toString();
    }
}

module.exports.getLogReport = async function () {
    const aggregate = await getLogsAggregate();
    const table = buildTable(aggregate);
    return buildReport(table);
}

const buildTable = function (data) {
    const domains = [...new Set(Object.values(data).flatMap(Object.keys))];

    let html = `<table border="1" cellspacing="0" cellpadding="5">
                    <tr>
                        <th></th>`;

    domains.forEach(domain => {
        html += `<th>${domain}</th>`;
    });

    html += `</tr>`;

    for (const day in data) {
        html += `<tr><td>${day}</td>`;

        domains.forEach(domain => {
            html += `<td>${data[day][domain] || 0}</td>`;
        });

        html += `</tr>`;
    }

    html += `</table>`;

    return html;
}

const buildReport = function (table) {
    const stamp = new Date().toISOString().replace('T', '  ');
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Log Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f4f4f4; }
        </style>
    </head>
    <body>
        <h1>Caddy Logger Dashboard - ${stamp}</h1>
        ${table}
    </body>
</html>`;
    return html;
}
