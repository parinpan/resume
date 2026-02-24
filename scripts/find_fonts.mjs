import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const result = await page.evaluate(async () => {
        await document.fonts.ready;

        const sandbox = document.createElement('div');
        sandbox.style.width = '183.1mm';
        sandbox.style.fontFamily = 'var(--font-lora), serif';
        sandbox.style.textAlign = 'justify';
        sandbox.style.position = 'absolute';
        sandbox.style.top = '0';
        sandbox.style.left = '0';
        sandbox.style.background = 'white';
        sandbox.style.zIndex = '9999';
        document.body.appendChild(sandbox);

        const profText = "A seasoned software engineer with 7 years of experience in designing and managing large-scale distributed systems for millions of users. Proven track record of consistently delivering exceptional results using a diverse range of technologies including Go, Redis, Kafka, BigQuery, SQS, Docker, Kubernetes, AWS, PostgreSQL, HAProxy, NGINX, gRPC, etc.";
        const profWords = profText.split(' ');

        // Exact targets from original PDF
        const profTarget1 = "millions";
        const profTarget2 = "Go,";

        const upTop = "Designed a robust system to process corporate action announcements from multiple third-party sources such as: BNP and WMDaten. The system is capable of ensuring the accuracy and integrity of corporate action information (data validation), handling discrepancies between data sources efficiently (conflict management), and consolidating information from various sources into a cohesive dataset (data merging). ";
        const upBold = "Tech: Golang, Kafka, PostgreSQL, BigQuery, gRPC";
        const upWords = upTop.trim().split(' ').map(w => ({ w, b: false }))
            .concat(upBold.split(' ').map(w => ({ w, b: true })));

        const upTarget1 = "and";
        const upTarget2 = "validation),";
        const upTarget3 = "various";

        const profDiv = document.createElement('div');
        sandbox.appendChild(profDiv);
        const upDiv = document.createElement('div');
        sandbox.appendChild(upDiv);

        profDiv.innerHTML = profWords.map((w, i) => `<span id="p${i}">${w}</span>`).join(' ');
        upDiv.innerHTML = `<ul style="margin-top: 2.5pt; list-style-type: disc;"><li style="text-align: justify; text-align-last: left; line-height: 1.38">` + upWords.map((w, i) => w.b ? `<b id="b${i}">${w.w}</b>` : `<span id="b${i}">${w.w}</span>`).join(' ') + `</li></ul>`;

        const pSpans = profWords.map((_, i) => document.getElementById(`p${i}`));
        const bSpans = upWords.map((_, i) => document.getElementById(`b${i}`));
        const ul = upDiv.querySelector('ul');

        let minScore = Infinity;
        let fallback = null;

        for (let fs = 8.0; fs <= 9.2; fs += 0.05) {
            sandbox.style.fontSize = `${fs}pt`;
            for (let ls = -0.3; ls <= 0.3; ls += 0.05) {
                sandbox.style.letterSpacing = `${ls}pt`;

                // Measure profile
                const pBreaks = [];
                for (let i = 1; i < pSpans.length; i++) {
                    if (pSpans[i].offsetTop > pSpans[i - 1].offsetTop) pBreaks.push(i - 1);
                }

                let pScore = Math.abs(pBreaks.length - 2) * 100;
                if (pBreaks[0] !== undefined) pScore += (profWords[pBreaks[0]] === profTarget1 ? 0 : 10);
                if (pBreaks[1] !== undefined) pScore += (profWords[pBreaks[1]] === profTarget2 ? 0 : 10);

                for (let pl = 10; pl <= 25; pl += 0.5) {
                    ul.style.paddingLeft = `${pl}pt`;

                    const bBreaks = [];
                    for (let i = 1; i < bSpans.length; i++) {
                        if (bSpans[i].offsetTop > bSpans[i - 1].offsetTop) bBreaks.push(i - 1);
                    }

                    let bScore = Math.abs(bBreaks.length - 3) * 100;
                    if (bBreaks[0] !== undefined) bScore += (upWords[bBreaks[0]].w === upTarget1 ? 0 : 10);
                    if (bBreaks[1] !== undefined) bScore += (upWords[bBreaks[1]].w === upTarget2 ? 0 : 10);
                    if (bBreaks[2] !== undefined) bScore += (upWords[bBreaks[2]].w === upTarget3 ? 0 : 10);

                    const totalScore = pScore + bScore;

                    if (totalScore === 0) {
                        return {
                            exactMatch: true, fs, ls, pl,
                            pWords: pBreaks.map(i => profWords[i]),
                            bWords: bBreaks.map(i => upWords[i].w)
                        };
                    }

                    if (totalScore < minScore) {
                        minScore = totalScore;
                        fallback = {
                            fs, ls, pl, error: totalScore,
                            pWords: pBreaks.map(i => profWords[i]),
                            bWords: bBreaks.map(i => upWords[i].w)
                        };
                    }
                }
            }
        }

        return { exactMatch: false, fallback };
    });

    console.log(JSON.stringify(result, null, 2));
    await browser.close();
})();
