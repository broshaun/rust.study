import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { isTauri } from "@tauri-apps/api/core";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    // setGreetMsg(await invoke("greet", { name }));
  }




  function openMsgWindow(id) {
    console.log('打开新的窗口', id)
    setGreetMsg(`isTauri -> ${isTauri()}`)
    const win = new WebviewWindow('my-label', {
      url: 'www.baidu.com'
    });

    win.once('tauri://created', () => {
      console.log('窗口创建成功:', label);
      setGreetMsg(label)
    });

    win.once('tauri://error', (e) => {
       const msg = JSON.stringify(e, null, 2); 
      console.error('窗口创建失败:', e);
      setGreetMsg(msg)
    });
  }




  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <button onClick={() => { openMsgWindow('1') }}>打开新窗口</button>
        <br />
        <br />
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
