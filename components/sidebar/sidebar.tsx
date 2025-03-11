"use client";
import React, { useState } from "react";
import { sidebarConfig } from "@/config/sidebar";
import * as icons from "react-icons/fa";
import Link from "next/link";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleIconClick = (event, index, hasSubMenu) => {
    event.stopPropagation();
    if (hasSubMenu) {
      setActiveIcon(activeIcon === index ? null : index); // Переключаем подменю
    }
  };
  

  const renderMenu = (items, level = 0) => {
    return items.map((item, index) => {
      const IconComponent = icons[item.icon] 
      const hasSubMenu = !!item.subMenu;
      return (
        <div key={index}>
          <Link href={item.link || "#"} onClick={(e) => e.preventDefault()} className="block ">

            <div
              className={`flex items-center p-2 text-gray-200 bg-gray-600 mt-1 pt-1  ${
                activeIcon === index ? "bg-gray-500 rounded-lg" : "rounded-lg"
              } hover:outline hover:outline-2 hover:outline-gray-400 hover:text-white hover:bg-gray-600`}
              onClick={(e) => handleIconClick(e, index, hasSubMenu)}
            >
              {IconComponent && (
                <IconComponent
                  className={`${
                    isOpen ? "mr-2 " : "mx-auto"
                  } ${activeIcon === index ? "text-3xl text-white" : "text-2xl text-gray-300 "}`}
                  style={{ borderRadius: "10px", transition: "all 0.3s ease" }}
                />
              )}
              {isOpen && <span>{item.title}</span>}
            </div>
          </Link>
          {hasSubMenu && (
            <div className="pl-0"> {/* Убираем отступы для подменю */}
              {renderMenu(item.subMenu, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full ${
        isOpen ? "w-64" : "w-16"
      } bg-gray-800 text-white transition-width duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-center h-16 bg-gray-900 rounded-b-lg"></div>
      <nav className="flex-grow p-4 overflow-y-auto">{renderMenu(sidebarConfig.navItems)}</nav>
      <button
        onClick={toggleSidebar}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-600 outline outline-2 outline-gray-500"
      >
        {isOpen ? "<" : ">"}
      </button>
    </div>
  );
};

export default Sidebar;
