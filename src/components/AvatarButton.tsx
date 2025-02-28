import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { IconButton } from '@mui/material';

const onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    // target.style.backgroundColor = 'rgba(0, 123, 255, 0.1)'; // Change background color on hover
    target.style.boxShadow = '10px 10px 10px rgba(0, 123, 255, 0.5)'; // Add box shadow for glow effect
}

const onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    // target.style.backgroundColor = 'transparent'; // Reset background color
    target.style.boxShadow = 'none'; // Remove box shadow
}

const AvatarButton: React.FC<{
    onClick: () => void,
    icon: React.JSX.Element,
    disabled?: boolean
}> = ({ onClick, icon, disabled }) => {
    return (
        <ListItemAvatar sx={{ cursor: 'pointer' }} >
            <Avatar>
                <IconButton
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    disabled={disabled ?? false}
                    onClick={onClick}
                    size="large">
                    {icon}
                </IconButton>
            </Avatar>
        </ListItemAvatar>
    );
};

export default AvatarButton;