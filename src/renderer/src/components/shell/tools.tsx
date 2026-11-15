/* eslint-disable prettier/prettier */
import { JSX } from 'react'
import { AudioWaveform, Globe, Layers, Boxes } from 'lucide-react'

export type ToolId = 'converter' | 'loadpleng' | 'resizer' | 'image-to-item'

export interface Tool {
    id: ToolId
    label: string
    description: string
    keywords: string
    icon: (size: number) => JSX.Element
}

export const TOOLS: Tool[] = [
    {
        id: 'converter',
        label: 'Audio Converter',
        description: 'แปลงไฟล์เสียงเป็น .ogg พร้อม sounds.json',
        keywords: 'audio sound mp3 wav ogg เสียง แปลง',
        icon: (s) => <AudioWaveform size={s} strokeWidth={1.75} />,
    },
    {
        id: 'resizer',
        label: 'Texture Resizer',
        description: 'ย่อขนาด texture ภายในไฟล์ JAR',
        keywords: 'texture jar resize png ย่อ ขนาด',
        icon: (s) => <Layers size={s} strokeWidth={1.75} />,
    },
    {
        id: 'image-to-item',
        label: 'Image → Item',
        description: 'สร้าง model, lang และ code จากไฟล์ PNG',
        keywords: 'image item food png model lang ไอเทม อาหาร',
        icon: (s) => <Boxes size={s} strokeWidth={1.75} />,
    },
    {
        id: 'loadpleng',
        label: 'Loadpleng',
        description: 'ดาวน์โหลดเพลงจาก loadpleng.ppekkungz.in.th',
        keywords: 'loadpleng download music เพลง ดาวน์โหลด web',
        icon: (s) => <Globe size={s} strokeWidth={1.75} />,
    },
]

export const matchTool = (tool: Tool, query: string): boolean => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return `${tool.label} ${tool.description} ${tool.keywords}`.toLowerCase().includes(q)
}
