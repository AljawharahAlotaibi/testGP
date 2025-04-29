"use client";

// theme/theme.ts
import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#eeeefe',
    100: '#c5c4f5',
    200: '#9c9aec',
    300: '#7370e3',
    400: '#4a46da',
    500: '#332FC8', // main brand color
    600: '#2b28a3',
    700: '#221f7e',
    800: '#191659',
    900: '#110e35',
  },
};


const breakpoints = {
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1536px',
};

const config: ThemeConfig = {
  // optional theme config
};

const customTheme = extendTheme({
  config,
  colors,
  breakpoints,
  fonts: {
    heading: 'Arial, sans-serif',
    body: 'Arial, sans-serif',
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'gray.50',
        color: 'gray.800',
        margin: 0,
        padding: 0,
        fontSize: '16px',
      },
      a: {
        color: 'brand.500',
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default customTheme;
