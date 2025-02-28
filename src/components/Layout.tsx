import React, { useState } from 'react';
import { useMeucContext } from "@/context/MeucContext";
import './Layout.css';
import DrawerList from "@/views/DrawerList";
import Player from "@/views/Player";
import SearchBar from './SearchBar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { isMobile } from '@/core/utils';
import { Button } from '@mui/material';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { open, toggleMenuDrawer: toggleDrawer } = useMeucContext();

    return (
        <div className="layout">
            <div className="topbar">
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                    onClick={toggleDrawer}
                >
                    <MenuIcon />
                </IconButton>
                <SearchBar />
            </div>
            <main className="content" style={{ display: 'flex', flex: 1 }}>
                <div className={`drawer ${open ? 'open' : ''}`} style={{
                    width: open ? (isMobile() ? '100%' : '280px') : 0,
                    position: isMobile() ? 'absolute' : 'relative',
                }}>
                    <DrawerList />
                </div>
                <section className="main-content">
                    {children}
                </section>
            </main>
            <Player />
        </div>
    );
} 