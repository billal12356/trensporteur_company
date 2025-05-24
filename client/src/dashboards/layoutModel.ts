export const layoutModelJson = {
  global: {
    tabEnableClose: false,
    tabSetEnableTabStrip: false,
  },
  layout: {
    type: "row",
    children: [
      {
        type: "tabset",
        weight: 20,
        children: [
          {
            type: "tab",
            name: "Sidebar",
            component: "sidebar",
          },
        ],
      },
      {
        type: "tabset",
        weight: 80,
        children: [
          {
            type: "tab",
            name: "Content",
            component: "main",
          },
        ],
      },
    ],
  },
};
