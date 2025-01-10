export const lightTheme = {
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    'surface-variant': '#F5F5F5',
    'on-surface': '#212121',
    'on-surface-variant': '#757575',
    border: 'rgba(0, 0, 0, 0.12)',
    'border-strong': 'rgba(0, 0, 0, 0.22)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    'body-1': {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
    },
    'body-2': {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
    },
    'caption': {
      fontSize: '11px',
      lineHeight: '14px',
      fontWeight: 400,
    },
    'title-1': {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 500,
    },
  },
  shadows: {
    1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    2: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    3: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#121212',
    surface: '#1E1E1E',
    'surface-variant': '#2D2D2D',
    'on-surface': '#FFFFFF',
    'on-surface-variant': '#BBBBBB',
    border: 'rgba(255, 255, 255, 0.12)',
    'border-strong': 'rgba(255, 255, 255, 0.22)',
  },
}; 