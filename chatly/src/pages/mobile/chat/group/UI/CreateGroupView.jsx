import { useState } from "react";
import {
    Box,
    Stack,
    TextInput,
    Button,
    Paper,
    Text,
} from "@mantine/core";

export function CreateGroupView({ onCreateSuccess }) {
    const [groupName, setGroupName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        const name = groupName.trim();

        if (!name) return;

        try {
            setLoading(true);

            const newGroup = {
                group_name: name,
            };

            onCreateSuccess?.(newGroup);
            setGroupName("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p="md">
            <Paper p="md" radius="md" withBorder>
                <Stack gap="md">
                    <Text fw={600} size="lg">
                        创建群聊
                    </Text>

                    <TextInput
                        label="群名称"
                        placeholder="请输入群名称"
                        value={groupName}
                        onChange={(e) => setGroupName(e.currentTarget.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleCreate();
                            }
                        }}
                    />

                    <Button
                        fullWidth
                        loading={loading}
                        disabled={!groupName.trim()}
                        onClick={handleCreate}
                    >
                        创建
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}