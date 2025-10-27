import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Layout.css';
import HamburgerMenu from './HamburgerMenu';
import ActionButton from './ActionButton';
import NavSection from './NavSection';
import ConnectionSection from './ConnectionSection';
import {
  connectionData,
  defaultUserInfo,
  defaultSystemStatus,
} from './layoutData';
import { navigationData } from './navigationData';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [connectionStatusExpanded, setConnectionStatusExpanded] =
    useState(false);
  const location = useLocation();

  const isActive = path => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className='layout-container'>
      {/* Header */}
      <header className='app-header'>
        <div className='header-left'>
          <HamburgerMenu
            collapsed={sidebarCollapsed}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div className='brand'>
            <span className='brand-icon'>🚀</span>
            <span className='brand-text'>MIA Logistics</span>
            <span className='brand-version'>v3.0</span>
          </div>
        </div>

        <div className='header-center'>
          <div className='system-status'>
            <div className='status-indicator online'></div>
            <span>Hệ thống hoạt động bình thường</span>
          </div>
        </div>

        <div className='header-right'>
          <div className='user-info'>
            <div className='user-avatar'>👤</div>
            <div className='user-details'>
              <span className='user-name'>Admin</span>
              <span className='user-role'>Quản trị viên</span>
            </div>
          </div>
          <div className='header-actions'>
            <ActionButton icon='🔔' title='Thông báo' />
            <ActionButton icon='⚙️' title='Cài đặt' />
          </div>
        </div>
      </header>

      <div className='layout-body'>
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className='sidebar-nav'>
            <NavSection
              title='Điều hướng'
              items={navigationData.main}
              collapsed={sidebarCollapsed}
              isActive={isActive}
            />

            <NavSection
              title='Công cụ'
              items={navigationData.tools}
              collapsed={sidebarCollapsed}
            />

            <NavSection
              title='Hỗ trợ'
              items={navigationData.support}
              collapsed={sidebarCollapsed}
            />
          </nav>

          <ConnectionSection
            connections={connectionData}
            expanded={connectionStatusExpanded}
            onToggle={() =>
              setConnectionStatusExpanded(!connectionStatusExpanded)
            }
          />
        </aside>

        {/* Main Content */}
        <main className='main-content'>
          <div className='content-wrapper'>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
