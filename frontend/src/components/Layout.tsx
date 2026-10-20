import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';
import { getCurrentUser, type User } from '../api/users';
import { canAssignDevices, canManageRoles, canManageUsers, canViewInventory, canViewStatistics, clearAuth, getCurrentPermissions, getCurrentRole, normalizeRole, ROLE_OPTIONS, setCurrentPermissions } from '../utils/auth';

interface LayoutProps {
    theme: 'light' | 'dark';
    setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

export default function Layout({ theme, setTheme }: LayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<User | null>(null);
    const currentRole = getCurrentRole();
    const profileRole = normalizeRole(profile?.role || currentRole);
    const currentRoleLabel = profile?.role_name || ROLE_OPTIONS.find((role) => role.value === profileRole)?.label || profileRole;
    const activePermissions = profile?.permissions || getCurrentPermissions();
    const canManageUsersNow = canManageUsers(profileRole, activePermissions);
    const canManageRolesNow = canManageRoles(profileRole, activePermissions);
    const canViewInventoryNow = canViewInventory(profileRole, activePermissions);
    const canAssignDevicesNow = canAssignDevices(profileRole, activePermissions);
    const canViewStatisticsNow = canViewStatistics(profileRole, activePermissions);
    const displayName = profile
        ? [profile.surname, profile.name].filter(Boolean).join(" ") || profile.username
        : "Profile";

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        let cancelled = false;

        getCurrentUser()
            .then((user) => {
                if (cancelled) return;
                localStorage.setItem("auth_role", normalizeRole(user.role));
                setCurrentPermissions(user.permissions);
                setProfile(user);
            })
            .catch(() => {
                if (cancelled) return;
                setProfile(null);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const handleLogout = () => {
        clearAuth();
        navigate("/login", { replace: true });
    };

    // Helper to determine page title based on path
    const getPageTitle = (pathname: string) => {
        if (pathname.includes('/dashboard')) return 'Panel';
        if (pathname.includes('/users')) return 'Ulanyjylar';
        if (pathname.includes('/roles')) return 'Rollar';
        if (pathname.includes('/employees')) return 'Işgärler';
        if (pathname.includes('/devices/available')) return 'Elýeterli Enjamlar';
        if (pathname.includes('/devices')) return 'Enjamlar';
        if (pathname.includes('/furnitures/assign')) return 'Mebel birikdirme';
        if (pathname.includes('/furnitures')) return 'Mebeller';
        if (pathname.includes('/assign')) return 'Berkidilme';
        if (pathname.includes('/brands')) return 'Brendler';
        if (pathname.includes('/models')) return 'Modeller';
        if (pathname.includes('/categories')) return 'Kategoriýalar';
        if (pathname.includes('/attributes')) return 'Aýratynlyklar';
        if (pathname.includes('/statistics')) return 'Statistika';
        if (pathname.includes('/profile')) return 'Meniň profilim';
        return 'Panel';
    };

    return (
        <div className="layout-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="brand-section">
                    <h1>Inwentar Ulgamy</h1>
                    <span>Dolandyryş ulgamy</span>
                </div>

                <nav className="nav-links">
                    {canViewStatisticsNow && (
                        <NavLink to="/statistics" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="chart" />
                            Statistika
                        </NavLink>
                    )}
                    {canViewInventoryNow && (
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="dashboard" />
                            Panel
                        </NavLink>
                    )}
                    {canViewInventoryNow && (
                        <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="users" />
                            Işgärler
                        </NavLink>
                    )}
                    {canManageUsersNow && (
                        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="account" />
                            Ulanyjylar
                        </NavLink>
                    )}
                    {canManageRolesNow && (
                        <NavLink to="/roles" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="shield" />
                            Rollar
                        </NavLink>
                    )}
                    {canViewInventoryNow && (
                        <NavLink to="/devices" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} end>
                            <NavIcon name="monitor" />
                            Enjamlar
                        </NavLink>
                    )}
                    {canViewInventoryNow && (
                        <NavLink to="/devices/available" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="box" />
                            Elýeterli
                        </NavLink>
                    )}
                    {canViewInventoryNow && (
                        <NavLink to="/furnitures" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} end>
                            <NavIcon name="sofa" />
                            Mebeller
                        </NavLink>
                    )}
                    {canAssignDevicesNow && (
                        <NavLink to="/assign" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="link" />
                            Berkidilme
                        </NavLink>
                    )}
                    {canAssignDevicesNow && (
                        <NavLink to="/furnitures/assign" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="armchair" />
                            Mebel birikdirme
                        </NavLink>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 12px' }}></div>

                    {canViewInventoryNow && (
                        <NavLink to="/brands" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="tag" />
                            Brendler
                        </NavLink>
                    )}
                    {canViewInventoryNow && (
                        <NavLink to="/models" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="layers" />
                            Modeller
                        </NavLink>
                    )}
                    {canViewInventoryNow && (
                        <NavLink to="/categories" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="grid" />
                            Kategoriýalar
                        </NavLink>
                    )}
                    {canViewInventoryNow && (
                        <NavLink to="/attributes" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <NavIcon name="settings" />
                            Aýratynlyklar
                        </NavLink>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 12px' }}></div>

                    <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                        <NavIcon name="profile" />
                        Meniň profilim
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Rol: {currentRoleLabel}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>v1.0.0</span>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-area">
                <header className="top-bar">
                    <h2 className="page-title">{getPageTitle(location.pathname)}</h2>
                    <div className="top-bar-actions">
                        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme" title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
                            {theme === "light" ? (
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>

                        <NavLink to="/profile" className="profile-pill" style={{ textDecoration: "none" }}>
                            <div className="profile-avatar" aria-hidden="true">
                                {(profile?.name || profile?.username || "U").slice(0, 1).toUpperCase()}
                            </div>
                            <div className="profile-meta">
                                <span className="profile-name">{displayName}</span>
                                <span className="profile-role">{profile?.username || "..." } · {currentRoleLabel}</span>
                            </div>
                        </NavLink>

                        <button type="button" className="logout-btn" onClick={handleLogout} title="Logout">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Çykmak</span>
                        </button>
                    </div>
                </header>

                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

// Simple Icon Component to keep code clean
function NavIcon({ name }: { name: string }) {
    switch (name) {
        case 'dashboard':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
        case 'users':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
        case 'account':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 1 0-16 0"></path><circle cx="12" cy="7" r="4"></circle><path d="M18 8h4"></path><path d="M20 6v4"></path></svg>;
        case 'shield':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>;
        case 'monitor':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
        case 'box':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
        case 'link':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
        case 'tag':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
        case 'layers':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
        case 'grid':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
        case 'settings':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
        case 'chart':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
        case 'profile':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 1 0-16 0"></path><circle cx="12" cy="7" r="4"></circle></svg>;
        case 'sofa':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11V9a4 4 0 0 1 8 0v2"></path><path d="M12 11V9a4 4 0 0 1 8 0v2"></path><path d="M3 11h18v6H3z"></path><path d="M5 17v3"></path><path d="M19 17v3"></path></svg>;
        case 'armchair':
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11V8a5 5 0 0 1 10 0v3"></path><path d="M5 11h14v6H5z"></path><path d="M7 17v3"></path><path d="M17 17v3"></path><path d="M4 11v4"></path><path d="M20 11v4"></path></svg>;
        default:
            return null;
    }
}
