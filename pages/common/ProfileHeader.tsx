import React from 'react';
import { Profile as User } from '../../types';

const ProfileHeader: React.FC<{ user: User }> = ({ user }) => (
    <div className="flex items-center space-x-4 mb-6">
        <img src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-24 h-24 rounded-full object-cover"/>
        <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-text-secondary">{user.role}</p>
        </div>
    </div>
);

export default ProfileHeader;
