import React from 'react';

interface ListItemTextProps {
    primary: string;
    secondary?: string;
}

const ListItemText: React.FC<ListItemTextProps> = ({ primary, secondary }) => {
    return (
        <div style={{ marginLeft: '10px', flexGrow: 1 }}>
            <div style={{ fontWeight: 'bold' }}>{primary}</div>
            {secondary && <div style={{ color: '#666' }}>{secondary}</div>}
        </div>
    );
};

export default ListItemText; 