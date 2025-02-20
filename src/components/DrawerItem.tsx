import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';

interface Props {
    key: string;
    icon: React.JSX.Element;
    children: React.JSX.Element | string;
    onClick: () => void;
}

export default function DrawerItem(data: Props) {
    const { key, icon, children, onClick } = data;
    return (
        <ListItem key={key} disablePadding onClick={onClick}
            sx={{
                '&:hover': {
                    backgroundColor: '#444749',
                },
                width: 'unset',
                margin: '8px',
                borderRadius: '8px',
            }}
        >
            <ListItemButton>
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                {children}
            </ListItemButton>
        </ListItem>
    )
}