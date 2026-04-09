import { Center, ActionIcon, Title, Grid } from "@mantine/core";
import { IconChevronLeft, IconDots } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { create } from "zustand";


export const useAppBar = create((set) => ({
  title: "主页",
  leftPath: null,
  rightPath: null,

  setTitle: (title) => set({ title }),
  setLeftPath: (leftPath) => set({ leftPath }),
  setRightPath: (rightPath) => set({ rightPath }),
  reset: () => set({ title: "", leftPath: null, rightPath: null }),
}));


export function AppBar() {
  const navigate = useNavigate();
  const title = useAppBar((state) => state.title);
  const leftPath = useAppBar((state) => state.leftPath);
  const rightPath = useAppBar((state) => state.rightPath);
  const handleBack = () => {
    if (leftPath === "-1") {
      navigate(-1);
    } else if (leftPath) {
      navigate(leftPath);
    }
  };

  return (
    <Grid p={15} align="center">
      <Grid.Col span={2} align="center">
        {leftPath && (
          <ActionIcon variant="subtle" color="gray" onClick={handleBack}>
            <IconChevronLeft size={24} />
          </ActionIcon>
        )}
      </Grid.Col>

      <Grid.Col span={8} align="center">
        <Center>
          <Title order={5} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </Title>
        </Center>
      </Grid.Col>

      <Grid.Col span={2} align="center">
        {rightPath && (
          <ActionIcon variant="subtle" color="gray" onClick={() => navigate(rightPath)}>
            <IconDots size={24} />
          </ActionIcon>
        )}
      </Grid.Col>
    </Grid>
  );
}