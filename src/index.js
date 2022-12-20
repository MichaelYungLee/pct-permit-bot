const MONTHS = ['03', '04', '05'];
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36');
    await page.goto('https://portal.permit.pcta.org/availability/mexican-border.php');
    await page.waitForSelector('#calendar'); // Give time for Cloudflare processing
    let scripts = await page.$$eval(
        '.container > script',
        scripts => {
            return scripts.map(script => script.textContent);
        }
    );
    let calendarData;
    for (const script of scripts) {
        if (script.includes('data')) {
            calendarData = script.split(';')[1];
        }
    }
    calendarData = JSON.parse(calendarData.split(' ')[3]);
    calendar = calendarData.calendar;
    
    let permits = {};
    let totalPermits = 3220;
    let totalReservedPermits = 0;

    for (const month of MONTHS) {
        permits[month] = {
            "TotalPermits": 0,
            "ReservedPermits": 0,
            "PercentRemaining": 0
        }
    }
    permits['03']["TotalPermits"] += (31*35);
    permits['04']["TotalPermits"] += (30*35);
    permits['05']["TotalPermits"] += (31*35);

    for (const day of calendar) {
        let num = day.num;
        let month = day.start_date.split('-')[1];
        if (typeof num == 'string') {
            num = parseInt(num);
        }
        permits[month]["ReservedPermits"] += num;
        totalReservedPermits += num;
    }
    for (const month of MONTHS) {
        permits[month]["PercentRemaining"] = 
            ((permits[month]["ReservedPermits"] / permits[month]["TotalPermits"])*100).toFixed(2);
    }
    permits["TotalPermits"] = totalPermits;
    permits["TotalReservedPermits"] = totalReservedPermits;
    permits["TotalPermitsRemaining"] = totalPermits - totalReservedPermits;
    permits["TotalPercentRemaining"] = ((1-(totalReservedPermits / totalPermits))*100).toFixed(2);
    console.log(permits);
    await browser.close();
})();
