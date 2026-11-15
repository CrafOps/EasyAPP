/* eslint-disable @typescript-eslint/no-explicit-any */
import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// platform จาก main process ใช้เว้นที่ให้ปุ่มหน้าต่างของระบบ
const api = (window as any).api
const root = document.documentElement
if (api?.platform) root.classList.add(`platform-${api.platform}`)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
