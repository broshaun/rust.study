
## tauri.conf.json 配置说明

`tauri.conf.json`是Tauri框架中的配置文件，用于配置Tauri应用程序的各种属性和行为。下面是一些常用的配置选项及其说明：

### tauri

包含Tauri应用程序的全局配置。

- `bundle`：用于配置应用程序的打包选项。
  - `identifier`：应用程序的唯一标识符，用于在操作系统中标识应用程序。必须是唯一的。
  - `icon`：应用程序的图标文件路径。
  - `category`：应用程序在操作系统中的类别（例如Development、Utility等）。
  - `short_description`：应用程序的简短描述。
  - `long_description`：应用程序的详细描述。

- `window`：用于配置应用程序窗口的选项。
  - `title`：应用程序窗口的标题。
  - `width`：应用程序窗口的宽度。
  - `height`：应用程序窗口的高度。
  - `resizable`：指定应用程序窗口是否可以调整大小。
  - `fullscreen`：指定应用程序窗口是否以全屏模式启动。

- `tauri`：用于配置Tauri框架本身的选项。
  - `embeddedServer`：指定是否启用内嵌服务器。
  - `customProtocol`：指定是否启用自定义协议。
  - `allowlist`：指定哪些URL允许在应用程序中加载。

### build

用于配置打包和构建选项。

- `devPath`：开发模式下的文件路径。
- `releasePath`：发布模式下的文件路径。
- `beforeDevCommand`：在开发模式下运行的命令。
- `beforeBuildCommand`：在构建之前运行的命令。

### tauri-dependencies

用于配置Tauri依赖项的选项。

- `tauri`：指定Tauri框架的版本。
- `rust`：指定Tauri使用的Rust版本。

这只是`tauri.conf.json`中一些常用的配置选项的示例。您可以根据您的需求自定义和扩展这些选项。有关更详细的配置说明，请参考[Tauri的官方文档](https://tauri.studio/en/docs/getting-started/configuration/)。
