# MercWar AI Browser

## Overview
The MercWar AI Browser combines futuristic visuals with practical navigation. It integrates an **[atomic splash banner](ca://s?q=Explain_atomic_splash_banner)**, a **[sidebar menu](ca://s?q=Sidebar_navigation_in_browser)**, and a **[content viewer](ca://s?q=Content_viewer_frame)** into a unified interface.

## Core Components
- **Banner Frame**  
  Fixed at the top, height of 220px. Contains the animated nucleus and orbit rings, title, and footer text.  
  Purpose: Symbolizes AI initialization while staying visually contained.

- **Sidebar Navigation**  
  Width of 260px, scrollable. Collapsible sections group files by category.  
  Purpose: Provides quick access to directories loaded from GitHub.

- **Content Viewer**  
  Flexible scrollable area below the banner.  
  Purpose: Displays files without overlapping the banner or sidebar.

- **Starfield Background**  
  Animated twinkling stars confined to the banner frame.  
  Purpose: Adds depth and immersion without interfering with other tags.

## Technical Adjustments
- Scoped CSS ensures the splash animation stays inside its frame.  
- `conn` and `dirs` variables from `config.json` dynamically build GitHub Pages URLs.  
- Responsive design keeps banner and viewer separated across devices.

## Benefits
- **Visual Appeal**: Neon atomic animation with immersive starfield.  
- **Functional Separation**: Banner, sidebar, and viewer operate independently.  
- **Dynamic Loading**: Files fetched from GitHub render seamlessly in the viewer.

## Conclusion
The MercWar AI Browser delivers a futuristic interface with clear separation of elements. The atomic splash remains a contained banner, while the viewer renders content in its own frame, ensuring usability and style coexist.
