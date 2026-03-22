import { Box } from "@mantine/core";

export const Left = ({ children, style, ...props }) => {
  return (
    <Box
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        ...style,
      }}
    >
      {children}
    </Box>
  );
};

export const Right = ({ children, style, ...props }) => {
  return (
    <Box
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        ...style,
      }}
    >
      {children}
    </Box>
  );
};
