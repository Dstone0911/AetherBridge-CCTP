import React from 'react';

export const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-7.5-2.152l6.818-1.558a2.59 2.59 0 011.838.297l6.505 3.868c.287.17.447.472.417.803l-.49 5.343a9.04 9.04 0 01-5.748 7.575l-2.025.76a1.125 1.125 0 01-.796 0l-2.025-.76a9.04 9.04 0 01-5.748-7.575l-.49-5.343c-.03-.33.13-.632.417-.803l6.505-3.868a2.59 2.59 0 011.838-.297z" />
  </svg>
);

export const UsdcIcon = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="12" fill="#2775CA"/>
    <path d="M12.75 15.75H11.25V14.25H9.75V12.75H11.25V11.25H9.75V9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V14.25C14.25 15.0784 13.5784 15.75 12.75 15.75Z" fill="white"/>
    <path d="M11.25 8.25H12.75V9.75H14.25V11.25H12.75V12.75H14.25V14.25H11.25C10.4216 14.25 9.75 13.5784 9.75 12.75V9.75C9.75 8.92157 10.4216 8.25 11.25 8.25Z" fill="white"/>
  </svg>
);
