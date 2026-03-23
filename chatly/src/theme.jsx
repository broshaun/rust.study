import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",

  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyMonospace:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

  headings: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: "700",
    textWrap: "balance",
    sizes: {
      h1: { fontSize: rem(32), lineHeight: "1.2" },
      h2: { fontSize: rem(28), lineHeight: "1.25" },
      h3: { fontSize: rem(24), lineHeight: "1.3" },
      h4: { fontSize: rem(20), lineHeight: "1.35" },
      h5: { fontSize: rem(18), lineHeight: "1.4" },
      h6: { fontSize: rem(16), lineHeight: "1.4" },
    },
  },

  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(20),
    xl: rem(28),
  },

  radius: {
    xs: rem(6),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(20),
  },

  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px rgba(0, 0, 0, 0.08)",
    md: "0 4px 12px rgba(0, 0, 0, 0.12)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.16)",
    xl: "0 12px 32px rgba(0, 0, 0, 0.2)",
  },

  other: {
    appShellBorderColor: "rgba(255, 255, 255, 0.08)",
    cardBorderColor: "rgba(255, 255, 255, 0.1)",
    inputBorderColor: "rgba(255, 255, 255, 0.12)",
  },

  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },

    ActionIcon: {
      defaultProps: {
        radius: "md",
        variant: "subtle",
      },
    },

    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
        withBorder: true,
        padding: "lg",
      },
    },

    Paper: {
      defaultProps: {
        radius: "lg",
        withBorder: true,
        p: "md",
      },
    },

    TextInput: {
      defaultProps: {
        radius: "md",
        variant: "filled",
      },
    },

    PasswordInput: {
      defaultProps: {
        radius: "md",
        variant: "filled",
      },
    },

    Textarea: {
      defaultProps: {
        radius: "md",
        variant: "filled",
      },
    },

    Select: {
      defaultProps: {
        radius: "md",
        variant: "filled",
      },
    },

    NumberInput: {
      defaultProps: {
        radius: "md",
        variant: "filled",
      },
    },

    Modal: {
      defaultProps: {
        radius: "lg",
        shadow: "lg",
        centered: true,
      },
    },

    Drawer: {
      defaultProps: {
        padding: "md",
      },
    },

    Table: {
      defaultProps: {
        highlightOnHover: true,
        stickyHeader: true,
        striped: "odd",
        verticalSpacing: "sm",
      },
    },

    Badge: {
      defaultProps: {
        radius: "sm",
        variant: "light",
      },
    },

    Tabs: {
      defaultProps: {
        radius: "md",
      },
    },

    Divider: {
      defaultProps: {
        my: "sm",
      },
    },

    Loader: {
      defaultProps: {
        type: "dots",
      },
    },
  },
});