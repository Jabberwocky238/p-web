import React from 'react';

interface ListItemProps {
    onClick?: () => void;
    children: React.ReactNode;
}

const ListItem: React.FC<ListItemProps> = ({ onClick, children }) => {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderRadius: '10px',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 123, 255, 0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
        >
            {children}
        </div>
    );
};

export default ListItem; 