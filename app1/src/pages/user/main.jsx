import { createSignal, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { AppBar, AppShell, Drawer, Divider, Icon, XBox, YBox } from "components/flutter";

export function User({children}) {
  const navigate = useNavigate();

  const drawerMenu = [
    {
      key: "login",
      display: true,
      icon: { name: "user-circle", label: "登陆" },
      onTap: () => navigate("/user/login/"),
    },
    {
      key: "register",
      display: true,
      icon: { name: "user-plus", label: "注册" },
      onTap: () => navigate("/user/register/"),
    },
    {
      key: "settings",
      display: true,
      icon: { name: "cog-6-tooth", label: "设置" },
      onTap: () => navigate("/user/settings/setlist/"),
    },
  ];

  const [open, setOpen] = createSignal(false);

  const handleItemClick = (item) => {
    if (!item) return;
    item.onTap && item.onTap();
    setOpen(false);
  };

  return (
    <div> 123{children}
      {/* <Drawer isOpen={open()} onClose={() => setOpen(false)} width={120}>
        <XBox padding={20}>
          <h3>导航</h3>
        </XBox>

        <Divider fade={true} />

        <YBox padding={10} gap={20}>
          <For each={drawerMenu.filter((i) => i.display !== false)}>
            {(item) => (
              <Icon
                name={item?.icon.name}
                label={item?.icon.label}
                onClick={() => handleItemClick(item)}
                labelPos="right"
              />
            )}
          </For>
        </YBox>
      </Drawer>

      <AppShell>
        <AppShell.Header>
          <AppBar leading={<Icon name="menu" onClick={() => setOpen(true)} />} />
        </AppShell.Header>

        <AppShell.Content>
          {children}
        </AppShell.Content>
      </AppShell> */}
    </div>
  );
}