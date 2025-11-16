import React from 'react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-sidebar p-2 border border-border rounded-md shadow-lg text-xs">
        <p className="label font-bold text-text-main">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color || pld.fill }}>
            {`${pld.name} : ${pld.value}${pld.unit || ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
