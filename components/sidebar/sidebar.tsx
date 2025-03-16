"use client";
import React, { useState } from "react";
import { sidebarConfig } from "@/config/sidebar";
import * as icons from "react-icons/fa";
import Link from "next/link";

interface SidebarItem {
  title: string;
  icon: string; // ✅ Изменено на string
  link?: string;
  subMenu?: SidebarItem[];
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number | null>(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleIconClick = (event: React.MouseEvent, index: number, hasSubMenu: boolean) => {
    event.stopPropagation();
    if (hasSubMenu) {
      setActiveIcon(activeIcon === index ? null : index);
    }
  };

  const renderMenu = (items: SidebarItem[], level = 0) => {
    return items.map((item, index) => {
      const IconComponent = icons[item.icon as keyof typeof icons]; // ✅ Приведение типа
      const hasSubMenu = !!item.subMenu;
      return (
        <div key={index}>
          <Link href={item.link || "#"} onClick={(e) => e.preventDefault()} className="block">
            <div
              className={`flex items-center p-2 mt-1 pt-1 ${
                activeIcon === index
                  ? "bg-gray-200 dark:bg-gray-700 rounded-lg"
                  : "rounded-lg"
              } hover:outline hover:outline-2 hover:outline-gray-300 dark:hover:outline-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-600`}
              onClick={(e) => handleIconClick(e, index, hasSubMenu)}
            >
              {IconComponent && (
                <IconComponent
                  className={`${
                    isOpen ? "mr-2" : "mx-auto"
                  } ${
                    activeIcon === index
                      ? "text-3xl text-gray-900 dark:text-white"
                      : "text-2xl text-gray-700 dark:text-gray-300"
                  }`}
                  style={{ borderRadius: "10px", transition: "all 0.3s ease" }}
                />
              )}
              {isOpen && <span className="text-gray-900 dark:text-white">{item.title}</span>}
            </div>
          </Link>
          {hasSubMenu && item.subMenu && (
            <div className="pl-0">
              {renderMenu(item.subMenu, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full min-h-screen ${
        isOpen ? "w-64" : "w-16"
      } bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-width duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-center h-16 bg-gray-100 dark:bg-gray-900 rounded-b-lg"></div>
      <nav className="flex-grow p-4 overflow-y-auto">{renderMenu(sidebarConfig.navItems)}</nav>
      <button
        onClick={toggleSidebar}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 outline outline-2 outline-gray-300 dark:outline-gray-600"
      >
        {isOpen ? "<" : ">"}
      </button>
    </div>
  );
};

export default Sidebar;
