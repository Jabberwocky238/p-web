import React, { createContext, useContext, useState } from 'react';

interface DrawerContextType {
    open: boolean;
    toggleDrawer: () => void;
    setDrawer: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleDrawer = () => {
        setOpen(prev => !prev);
    };

    const setDrawer = (open: boolean) => {
        setOpen(open);
    }

    return (
        <DrawerContext.Provider value={{ open, toggleDrawer, setDrawer }}>
            {children}
        </DrawerContext.Provider>
    );
};

export const useDrawer = () => {
    const context = useContext(DrawerContext);
    if (!context) {
        throw new Error("useDrawer must be used within a DrawerProvider");
    }
    return context;
}; 