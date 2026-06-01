import { Center, ActionIcon, Title, Grid } from "@mantine/core";
import { IconChevronLeft, IconDots } from "@tabler/icons-react";
import { useNavigate } from "react-router";


export function GlobalAppBar() {
  const navigate = useNavigate();
  const title = currentAppBar((state) => state.title);
  const leftPath = currentAppBar((state) => state.leftPath);
  const rightIcon = currentAppBar((state) => state.rightIcon);
  const rightPath = currentAppBar((state) => state.rightPath);


  return (
    <Grid p={10} align="center">
      <Grid.Col span={2} align="center">
        {leftPath && (
          <ActionIcon variant="subtle" color="gray" onClick={() => navigate(leftPath)}>
            <IconChevronLeft />
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
            {rightIcon}
          </ActionIcon>
        )}
      </Grid.Col>
    </Grid>
  );
}
