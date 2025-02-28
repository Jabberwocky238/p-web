import React, { createContext, useContext, useState } from 'react';

interface MenuContextType {
    open: boolean;
    toggleMenuDrawer: () => void;
    setMenuDrawer: (open: boolean) => void;
}

const MeucContext = createContext<MenuContextType | undefined>(undefined);

export const MeucContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleDrawer = () => {
        setOpen(prev => !prev);
    };

    const setDrawer = (open: boolean) => {
        setOpen(open);
    }

    return (
        <MeucContext.Provider value={{ open, toggleMenuDrawer: toggleDrawer, setMenuDrawer: setDrawer }}>
            {children}
        </MeucContext.Provider>
    );
};

export const useMeucContext = () => {
    const context = useContext(MeucContext);
    if (!context) {
        throw new Error("useDrawer must be used within a DrawerProvider");
    }
    return context;
}; 