'use client';

import { useEffect, useState } from 'react';

const TARGETS = {
    profileStart: "A seasoned software engineer with 7 years of experience in designing and managing large-scale distributed systems for millions",
    profileEnd: " of users.", // we test the width of the first line
    exp1Line1: "Designed a robust system to process corporate action announcements from multiple third-party sources such as: BNP and",
    exp1Line2: "WMDaten. The system is capable of ensuring the accuracy and integrity of corporate action information (data validation),"
};

export default function TestPage() {
    const [result, setResult] = useState<string>('Calculating...');

    useEffect(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let bestMatch = null;
        let minError = Infinity;

        // We test font-sizes for body from 8.0pt to 12pt
        for (let fs = 9; fs <= 11; fs += 0.1) {
            ctx.font = `400 ${fs}pt "Lora", serif`;

            // The width of the profile line 1
            const wProfileL1 = ctx.measureText(TARGETS.profileStart).width;
            const wProfileWordNext = ctx.measureText(" of").width;

            // The container width must be >= wProfileL1, but < wProfileL1 + wProfileWordNext
            // actually, text-align is justify, so the text is stretched. 
            // The NATURAL width of line 1 must be less than container width.
            // And the natural width of line 1 + " of" must be greater than container width.

            const wExp1L1 = ctx.measureText(TARGETS.exp1Line1).width;
            const wExp1WordNext = ctx.measureText(" WM").width;

            const wExp1L2 = ctx.measureText(TARGETS.exp1Line2).width;

            // Let's find a container width that satisfies both
            for (let w = 400; w <= 600; w += 1) {
                // Condition for Profile Line 1
                const profOk = (w >= wProfileL1) && (w < (wProfileL1 + wProfileWordNext));

                // Bullet points are indented. 
                // We know from our previous analysis the bullet text might be indented.
                // Let's assume an indent of some X pt.
                for (let indent = 10; indent <= 20; indent += 1) {
                    const expOk1 = ((w - indent) >= wExp1L1) && ((w - indent) < (wExp1L1 + wExp1WordNext));
                    //const expOk2 = ((w - indent) >= wExp1L2);

                    if (profOk && expOk1) {
                        bestMatch = { fs, w, indent };
                        console.log("Match found!", bestMatch);
                    }
                }
            }
        }

        setResult(bestMatch ? JSON.stringify(bestMatch, null, 2) : 'No exact match found, you may need letter spacing or different font load.');

    }, []);

    return <pre>{result}</pre>;
}
