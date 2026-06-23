import { invoke, Channel } from "@tauri-apps/api/core";


export const Test4 = () => {

    const start = async () => {
        await invoke('spawn_demo_task', { name: 'task01', interval_secs: 100 })
    }

    const fntest = async () => {
        const list = await invoke('list_tasks')
        console.log('list++', list)
    }

    const stop = async () => {
        await invoke('cancel_task', { name: 'task01' })
    }

    const test = async () => {
        await invoke('test')
    }

    return <div>
        <button onClick={start}>创建任务</button>
        <button onClick={fntest}>获取任务列表</button>
        <button onClick={stop}>停止任务</button>
        <br/>
        <button onClick={test}>测试actor</button>
    </div>
}