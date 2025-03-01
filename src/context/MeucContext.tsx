import React, { createContext, useContext, useEffect, useState } from 'react';

interface MenuContextType {
    open: boolean;
    toggleMenuDrawer: () => void;
    setMenuDrawer: (open: boolean) => void;
}

const MeucContext = createContext<MenuContextType | undefined>(undefined);
const defaultOpenLabel = '__MeucContext';
const defaultOpen = () => localStorage.getItem(defaultOpenLabel) === 'true';

export const MeucContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(defaultOpen());

    const toggleDrawer = () => {
        setOpen(prev => {
            localStorage.setItem(defaultOpenLabel, (!prev).toString());
            return !prev;
        });
    };

    const setDrawer = (open: boolean) => {
        setOpen(open);
        localStorage.setItem(defaultOpenLabel, open.toString());
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