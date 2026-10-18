import React from 'react';
export function Button({ className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`eva-ai-button ${className}`} />;
}
