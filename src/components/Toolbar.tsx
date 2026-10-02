'use client';

import { useState } from 'react';
import styles from './Toolbar.module.css';

export function Toolbar() {
  const [downloading, setDownloading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch('/api/pdf');
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      // Re-wrap as octet-stream so Safari won't render it inline as a PDF
      const downloadBlob = new Blob([blob], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Fachrin_Aulia_Nasution_Resume.pdf';
      a.style.display = 'none';
      // Safari requires the anchor to be in the DOM before clicking
      document.body.appendChild(a);
      a.click();
      // Delay cleanup so the browser has time to start the download
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  if (dismissed) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.content}>
        <p className={styles.text}>
          This one&apos;s worth keeping. Don&apos;t worry, it&apos;s free.
        </p>
        <div className={styles.actions}>
          <button
            className={styles.button}
            onClick={handleDownload}
            disabled={downloading}
          >
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
          <button
            className={styles.dismiss}
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
          >
            &#x2715;
          </button>
        </div>
      </div>
    </div>
  );
}
