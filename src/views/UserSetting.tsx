import React, { useState } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import ListItem from '@/components/ListItem';
import AvatarButton from '@/components/AvatarButton';
import ListItemText from '@/components/ListItemText';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';

const UserSetting: React.FC = () => {
    const [nickname, setNickname] = useState<string>('nickname'); // 用户昵称
    const [userId] = useState<string>('123456'); // 用户唯一ID，假设为常量
    const [token, setToken] = useState<string>('token'); // 用户token

    const handleNicknameChange = () => {
        // 处理昵称修改逻辑
        console.log('Nickname updated to:', nickname);
    };

    const handleTokenRefresh = () => {
        // 处理token刷新逻辑
        console.log('Token refreshed');
        // 这里可以添加实际的刷新逻辑
        setToken('new-token'); // 示例：更新token
    };

    return (
        <div>
            <ListItem>
                <ListItemText primary={userId} secondary={"User ID"} />
            </ListItem>
            <ListItem>
                <ListItemText primary={nickname} secondary={"Nickname"} />
                <AvatarButton onClick={handleNicknameChange} icon={<EditIcon />} />
            </ListItem>
            <ListItem>
                <ListItemText primary={token} secondary={"Token"} />
                <AvatarButton onClick={handleTokenRefresh} icon={<RefreshIcon color='error' />} />
            </ListItem>
        </div>
    );
};

export default UserSetting; 