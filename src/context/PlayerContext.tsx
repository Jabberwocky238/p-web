import React, { createContext, useContext, useState } from 'react';

interface PlayerContextType {
    open: boolean; // 控制 MusicDetailDrawer 显示与否
    togglePlayerDrawer: () => void; // 切换 MusicDetailDrawer 的显示状态
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setMusicDetailOpen] = useState(false);

    const togglePlayerDrawer = () => {
        setMusicDetailOpen(prev => !prev);
    };

    return (
        <PlayerContext.Provider value={{ open, togglePlayerDrawer }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayerContext = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}; 