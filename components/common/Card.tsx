import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`glass-card rounded-xl shadow-lg p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;