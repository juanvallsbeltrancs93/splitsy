import { createTheme } from '@mui/material/styles';

// Design tokens (keep in sync with presentation/styles/colors.css)
const colors = {
  bg:           '#111110',
  bgSurface:    '#1c1b1a',
  bgHover:      '#252422',
  bgInput:      '#161614',
  border:       '#2e2c29',
  primary:      '#e8a045',
  primaryDark:  '#d08a2e',
  text:         '#f5f3ef',
  textMuted:    '#9d9a94',
  textDisabled: '#5a5650',
  error:        '#e06b6b',
  bgDialog:     '#26241f',
} as const;

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: colors.bg,
      paper: colors.bgSurface,
    },
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      contrastText: colors.bg,
    },
    error: {
      main: colors.error,
    },
    text: {
      primary: colors.text,
      secondary: colors.textMuted,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg,
          color: colors.text,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: colors.bgInput,
            borderRadius: 8,
            '& fieldset': {
              borderColor: colors.border,
            },
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: colors.primary,
          },
          '& .MuiInputBase-input': {
            color: colors.text,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 48,
          fontWeight: 600,
          fontSize: '1rem',
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: colors.primary,
            color: colors.bg,
            '&:hover': {
              backgroundColor: colors.primaryDark,
            },
            '&.Mui-disabled': {
              backgroundColor: colors.bgHover,
              color: colors.textDisabled,
            },
          },
        },
      ],
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          width: '100%',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colors.primary,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.bgDialog,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px 24px 16px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px 20px',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '20px 24px 12px',
        },
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        size: 22,
        color: 'inherit',
      },
    },
  },
});

export default theme;
