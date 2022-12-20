const puppeteer = require('puppeteer');
const SES = require('aws-sdk/clients/ses');

(async() => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({'Referer': 'https://portal.permit.pcta.org/application/'})
    const response = await page.goto('https://portal.permit.pcta.org/ajax/onload-ajax.php?start_location=1');
    if (response.status() != 200) {
        console.log(`Error when retrieving status page. Received ${response.status()} from PCTA portal.`);
    }
    let body = await page.$('body');

    let calendarData = await (await body.getProperty('textContent')).jsonValue();
    calendarData = JSON.parse(calendarData);
    
    let availableDates = getAvailableDates(calendarData.calendar, calendarData.limit);
    if (!isEmpty(availableDates) && containsDesiredDates(availableDates)) {
        // Send notification
        console.log(availableDates);
        sendEmailWithAvailableDates(availableDates);
    }
    await browser.close();
})();

function isEmpty(dates) {
    return Object.keys(dates).length === 0;
}

function getAvailableDates(dates, limit) {
    if (dates.length === 0) {
        console.log('Calendar does not contain any dates.')
    }
    let availableDates = {}
    for (const date of dates) {
        if (date.num < limit) {
            availableDates[date.start_date] = limit - date.num;
        }
    }
    return availableDates;
}

function containsDesiredDates(dates) {
    for (const date of Object.keys(dates)) {
        if (date >= '2023-03-20' && date <= '2023-04-25') {
            return true;
        }
    }
    return false;
}

function sendEmailWithAvailableDates(availableDates) {
    var ses = new SES({
        apiVersion: '2010-12-01',
        region: 'us-west-2'
    });

    var params = {
        Destination: {
            ToAddresses: [
                '6155450739@txt.att.net'
            ]
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: JSON.stringify(availableDates),
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Available Dates for PCTA Permit'
            }
        },
        Source: 'no-reply@pct.mylee.xyz'
    };
    ses.sendEmail(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
    });
}

exports.getAvailableDates = getAvailableDates;
exports.sendEmailWithAvailableDates = sendEmailWithAvailableDates;
exports.containsDesiredDates = containsDesiredDates;
