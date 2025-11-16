import React, { useState } from 'react';
import Button from '../../components/common/Button';

interface LogoutButtonProps {
    onLogout: () => Promise<void>;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogoutClick = async () => {
        setIsLoggingOut(true);
        try {
            await onLogout();
            // No need to setIsLoggingOut(false) on success, as the component will unmount.
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false); // Reset on error
        }
    };

    return (
        <Button type="button" variant="danger" onClick={handleLogoutClick} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
    );
};

export default LogoutButton;
