
import { useNavigate, useLocation } from 'react-router';
import { NavLink, Stack } from '@mantine/core';
import { IconRocket, IconChevronRight } from '@tabler/icons-react';


export const MyList = () => {
    const navigate = useNavigate();
    const location = useLocation()

    return (
        <Stack gap={0}>
            <NavLink
                py={15}
                label="设置代理"
                leftSection={<IconRocket size={20} stroke={1.5} />}
                rightSection={<IconChevronRight size={16} stroke={1.5} />}
                onClick={() => navigate("/user/settings/agent/")}
            />
        </Stack>
    )


}

