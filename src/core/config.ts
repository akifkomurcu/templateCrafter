import type { DevicePreset } from './types';

// ============================================================
// CONSTANTS
// ============================================================
export const DEVICE_PRESETS: Record<string, DevicePreset> = {
  // Apple
  'iphone-6.7': { label: 'iPhone 6.7" (1290×2796)', width: 1290, height: 2796, category: 'iphone' },
  'iphone-6.5': { label: 'iPhone 6.5" (1284×2778)', width: 1284, height: 2778, category: 'iphone' },
  'iphone-6.1': { label: 'iPhone 6.1" (1179×2556)', width: 1179, height: 2556, category: 'iphone' },
  'iphone-5.5': { label: 'iPhone 5.5" (1242×2208)', width: 1242, height: 2208, category: 'iphone' },
  
  'ipad-12.9':  { label: 'iPad 12.9" (2048×2732)',   width: 2048, height: 2732, category: 'ipad' },
  'ipad-11':    { label: 'iPad 11" (1668×2388)',     width: 1668, height: 2388, category: 'ipad' },
  
  // Android
  'android-16:9': { label: 'Android 16:9 (1080×1920)', width: 1080, height: 1920, category: 'android' },
  'android-9:16': { label: 'Android 9:16 (1080×1920)', width: 1080, height: 1920, category: 'android' },
};

export const COLOR_PRESETS = [
  '#000000', '#ffffff', '#1a1a1a', '#2c3e50',
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
  '#3498db', '#9b59b6', '#34495e', '#95a5a6'
];

export const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #7c5cfc 0%, #38bdf8 100%)',
  'linear-gradient(135deg, #e94560 0%, #f472b6 100%)',
  'linear-gradient(135deg, #1dd1a1 0%, #2ed573 100%)',
  'linear-gradient(135deg, #533483 0%, #16213e 100%)',
  'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
  'linear-gradient(135deg, #00cdac 0%, #8ddad5 100%)',
  'linear-gradient(135deg, #FDC830 0%, #F37335 100%)',
  'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
  'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
];

export const TEMPLATE_COLORS = [
  '#7c5cfc', '#e94560', '#38bdf8', '#2ed573', '#ffa502',
  '#f472b6', '#818cf8', '#fb923c', '#1dd1a1', '#a78bfa',
  '#533483', '#0f3460', '#16213e', '#1a1a2e',
];

export const PRESET_BACKGROUNDS = [
  // 1. ABSTRACT & GRADIENTS
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80', // Gradient
  'https://images.unsplash.com/photo-1614850523296-6313a96a1936?w=800&q=80', // Mesh
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', // Abstract Fluid
  'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=800&q=80', // Purple Mesh
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80', // Fluid Pink
  'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=800&q=80', // Dark Gradient
  
  // 2. MINIMAL & TEXTURE
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80', // Space
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80', // Purple
  'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80', // Minimal Gold
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // Beach
  'https://images.unsplash.com/photo-1519681393798-3828fb4090bb?w=800&q=80', // Mountains
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80', // Dark Minimal
  
  // 3. NATURE & SCENIC
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', // Green Nature
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', // Foggy Forest
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', // Forest Light
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80', // Yosemite
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80', // Autumn Road
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', // Lake & User
];

export const STICKER_EMOJIS = [
  '⭐', '🔥', '✨', '💎', '🚀', '❤️',
  '🎯', '👑', '⚡', '🌟', '🎨', '💡',
  '🏆', '🎉', '🔔',
];

export const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Arial',
  'Helvetica Neue',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
];
