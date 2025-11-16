import React from 'react';
import { Profile as User } from '../../../types';
import ProfileViewWrapper from '../../common/ProfileViewWrapper';
import ProfileHeader from '../../common/ProfileHeader';
import ProfileForm from '../../common/ProfileForm';
import LogoutButton from '../../common/LogoutButton';

interface ProfileViewProps {
    user: User;
    onLogout: () => Promise<void>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
    return (
        <ProfileViewWrapper title="My Profile">
            <ProfileHeader user={user} />
            <ProfileForm user={user} allowPasswordChange={true} />
            <div className="border-t border-border mt-6 pt-6 flex justify-end">
                <LogoutButton onLogout={onLogout} />
            </div>
        </ProfileViewWrapper>
    );
};

export default ProfileView;
