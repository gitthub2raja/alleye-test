import React from 'react';
import Card from '../../components/common/Card';

const ProfileViewWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card className="max-w-2xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        {children}
    </Card>
);

export default ProfileViewWrapper;
