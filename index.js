const puppeteer = require('puppeteer');

(async () => {
    // Launch the browser in fullscreen mode
    const browser = await puppeteer.launch({
        headless: false, // Set to false to see the browser
        args: ['--start-maximized'] // Launch browser in fullscreen
    });
    const page = await browser.newPage();

    // Set the page to fullscreen by setting the viewport to match the screen size
    const dimensions = await page.evaluate(() => {
        return {
            width: window.screen.width,
            height: window.screen.height
        };
    });
    await page.setViewport(dimensions);

    try {
        // Navigate to the login page
        await page.goto('https://www.screener.in/login/?', { waitUntil: 'networkidle2' });

        // Wait for the login button to be visible (increase timeout to 60 seconds)
        await page.waitForSelector('a.button.account', { visible: true, timeout: 60000 });

        // Scroll the element into view and click
        await page.evaluate(() => {
            const element = document.querySelector('a.button.account');
            if (element) {
                element.scrollIntoView();
            }
        });
        await page.click('a.button.account');

        // Wait for the username field to be visible and interact with it
        await page.waitForSelector('#id_username', { visible: true, timeout: 60000 });
        await page.type('#id_username', 'sofeho9737@avashost.com');
        await page.type('#id_password', 'Atharv@12');

        // Wait for and click the login button
        await page.waitForSelector('button[type="submit"]', { visible: true, timeout: 60000 });
        await page.evaluate(() => {
            const element = document.querySelector('button[type="submit"]');
            if (element) {
                element.scrollIntoView();
            }
        });
        await page.click('button[type="submit"]');

        // Navigate to the screen new page
        await page.goto('https://www.screener.in/screen/new/', { waitUntil: 'networkidle2' });

        // Input the query
        await page.waitForSelector('textarea#query-builder', { visible: true, timeout: 60000 });
        await page.type('textarea#query-builder', "Market capitalization > 500 AND\nPrice to earning < 15 AND\nReturn on capital employed > 22%");

        // Wait for and click the "Run this Query" button
        await page.waitForSelector('button.button-primary', { visible: true, timeout: 60000 });
        await page.click('button.button-primary');

        // Wait for the table to appear
        await page.waitForSelector('table.data-table', { visible: true, timeout: 60000 });

        // Locate the table and extract data
        const tableData = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table.data-table tr'));
            const headers = rows[0].querySelectorAll('th'); // Assuming first row is headers

            // Extract headers
            const keys = Array.from(headers).map(header => header.innerText);

            // Extract data for each row
            const data = rows.slice(1).map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                const values = cells.map(cell => cell.innerText);
                const obj = {};
                keys.forEach((key, index) => {
                    // Convert headers to camelCase for the keys
                    const camelCaseKey = key.replace(/\s+(.)/g, (_, chr) => chr.toUpperCase()).replace(/\s+/g, '');
                    obj[camelCaseKey] = values[index];
                });
                return obj;
            });

            return data;
        });

        // Print the extracted table data in JSON format
        console.log(JSON.stringify(tableData, null, 2));

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Close the browser
        await browser.close();
    }
})();
