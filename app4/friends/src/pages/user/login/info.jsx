import React, { useEffect, useMemo, useState, Suspense, } from 'react'
import { useOutletContext } from 'react-router-dom'
import './LoginInfo.css'



export const LoginInfo = () => {
  const { msgFn, http } = useOutletContext();
  const [raw, setRaw] = useState(null)



  useEffect(() => {
    http.requestParams('GET').then((results) => {
      if (results?.code === 200) {
        setRaw(results?.data || {})
        msgFn('success', results?.message)
      } else {
        console.error('获取用户信息失败：', results?.message || '未知错误')
        msgFn?.('error', results?.message || '获取用户信息失败')
      }
    }).catch((err) => {
      console.error('请求异常：', err)
      msgFn?.('error', '请求异常')
    })

  }, [])

  const user = useMemo(() => {
    if (!raw) return null
    return {
      phone: raw.phone ?? '——',
      creator: raw.creator ?? '——',
      last_time: raw.last_time ?? '——',
      create_time: raw.create_time ?? '——',
      update_time: raw.update_time ?? '——',
      pass_word: raw.pass_word ?? '',
    }
  }, [raw])

  const maskPassword = (password) => {
    if (!password) return '——'
    return '*'.repeat(String(password).length)
  }

  if (!user) {
    return (
      <div className="login-info-container">
        <div className="login-info-empty">加载用户信息中...</div>
      </div>
    )
  }

  return <Suspense fallback={<div>加载中...</div>}>
    <div className="login-info-container">
      <div className="login-info-segment">
        <div className="login-info-card">
          <div className="login-info-card-content">
            <ul className="login-info-list">
              <li className="login-info-list-item">
                <span className="login-info-list-icon">📞</span>
                <div className="login-info-list-content">
                  <div className="login-info-list-header">电话</div>
                  <div className="login-info-list-description">{user.phone}</div>
                </div>
              </li>

              <li className="login-info-list-item">
                <span className="login-info-list-icon">🔒</span>
                <div className="login-info-list-content">
                  <div className="login-info-list-header">密码</div>
                  <div className="login-info-list-description">{maskPassword(user.pass_word)}</div>
                </div>
              </li>

              <li className="login-info-list-item">
                <span className="login-info-list-icon">🧑‍💼</span>
                <div className="login-info-list-content">
                  <div className="login-info-list-header">创建人</div>
                  <div className="login-info-list-description">{user.creator}</div>
                </div>
              </li>

              <li className="login-info-list-item">
                <span className="login-info-list-icon">🕒</span>
                <div className="login-info-list-content">
                  <div className="login-info-list-header">最后登录时间</div>
                  <div className="login-info-list-description">{user.last_time}</div>
                </div>
              </li>

              <li className="login-info-list-item">
                <span className="login-info-list-icon">🗓️</span>
                <div className="login-info-list-content">
                  <div className="login-info-list-header">注册时间</div>
                  <div className="login-info-list-description">{user.create_time}</div>
                </div>
              </li>

              <li className="login-info-list-item">
                <span className="login-info-list-icon">♻️</span>
                <div className="login-info-list-content">
                  <div className="login-info-list-header">更新时间</div>
                  <div className="login-info-list-description">{user.update_time}</div>
                </div>
              </li>

            </ul>
          </div>
        </div>
      </div>
    </div>
  </Suspense>
}
