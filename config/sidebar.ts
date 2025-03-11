

export const sidebarConfig = {
  navItems: [
    {
      title: "Home",
      link: "/dashboard",
      icon: "FaHome", // Используем строку вместо JSX
    },
    

        {
          title: "Commands",
          link: "/dashboard/commands",
          icon: "FaTerminal",
        },
        {
          title: "Attachments",
          link: "/dashboard/attachments",
          icon: "FaPaperclip",
          subMenu: [
            {
              title: "Inline Keyboard",
              link: "/dashboard/inlinekeyboards",
              icon: "FaKeyboard",
            },
            {
              title: "Keyboard",
              link: "/dashboard/keyboards",
              icon: "FaKeyboard",
            },
            {
              title: "Audio",
              link: "/dashboard/audios",
              icon: "FaVolumeUp",
            },
            {
              title: "Image",
              link: "/dashboard/buttons",
              icon: "FaImage",
            },
            {
              title: "Document",
              link: "/dashboard/documents",
              icon: "FaFile",
            },
            {
              title: "Video",
              link: "/dashboard/videos",
              icon: "FaVideo",
            },
            {
              title: "Location",
              link: "/dashboard/locations",
              icon: "FaMapMarkerAlt",
            },
            {
              title: "Contact",
              link: "/dashboard/contacts",
              icon: "FaAddressBook",
            },
          ],
        },
      

    {
      title: "Function",
      link: "/dashboard/function",
      icon: "FaMousePointer",
    },
    {
      title: "Statistic",
      link: "/dashboard/statistic",
      icon: "FaChartLine",
    },
    {
      title: "Settings",
      link: "/dashboard/settings",
      icon: "FaCog",
    },
  ],
};