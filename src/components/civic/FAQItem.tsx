"use client";

import React, { useState } from 'react';
import { FAQ } from '@/types';
import civicStyles from '../CivicProcessMap.module.css';

export default function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(o => !o);

  return (
    <div
      className={civicStyles.faqItem}
      role="region"
      aria-label={`FAQ: ${faq.q}`}
    >
      <button
        className={civicStyles.faqQuestion}
        onClick={toggle}
        aria-expanded={open}
      >
        {faq.q}
        <span className={`${civicStyles.faqIcon} ${open ? civicStyles.faqIconOpen : ''}`}>▾</span>
      </button>
      {open && <p className={civicStyles.faqAnswer}>{faq.a}</p>}
    </div>
  );
}
