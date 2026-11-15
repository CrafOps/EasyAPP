import { createContext } from 'react'

/** หน้าแต่ละหน้าส่งปุ่ม action ขึ้นไปแสดงบน toolbar ผ่าน portal นี้ */
export const ToolbarSlotContext = createContext<HTMLElement | null>(null)
