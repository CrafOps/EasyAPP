/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from 'react'
import logo from '../../assets/logo.png'
import { TOOLS, ToolId, matchTool } from './tools'

interface SidebarProps {
    active: ToolId
    query: string
    onSelect: (id: ToolId) => void
}

const version = (window as any).api?.version as string | undefined

export const Sidebar = ({ active, query, onSelect }: SidebarProps): JSX.Element => {
    const visible = TOOLS.filter((t) => matchTool(t, query))

    return (
        <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-sidebar">
            <div className="sidebar-head drag flex h-12 items-center gap-2.5 px-5">
                <img src={logo} alt="" className="h-5 w-5 rounded-[5px]" draggable={false} />
                <span className="text-[13px] font-semibold">EasyAPP</span>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pt-3" aria-label="เครื่องมือ">
                {visible.map((tool) => {
                    const index = TOOLS.indexOf(tool) + 1
                    const isActive = tool.id === active
                    return (
                        <button
                            key={tool.id}
                            onClick={() => onSelect(tool.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`focus-ring group flex h-9 items-center gap-3 rounded-lg px-2.5 text-left text-[13px]
                                transition-[background-color,color] duration-150
                                ${isActive ? 'bg-accent-soft font-medium text-accent' : 'text-fg-2 hover:bg-hover hover:text-fg'}`}
                        >
                            <span className={isActive ? 'text-accent' : 'text-fg-3 group-hover:text-fg-2'}>{tool.icon(16)}</span>
                            <span className="flex-1 truncate">{tool.label}</span>
                            <span className="text-[11px] text-fg-3 opacity-0 transition-opacity group-hover:opacity-100">
                                Ctrl {index}
                            </span>
                        </button>
                    )
                })}
                {visible.length === 0 && (
                    <p className="px-2.5 py-3 text-[12px] text-fg-3">ไม่พบ “{query}”</p>
                )}
            </nav>

            {version && <p className="px-5 py-4 text-[11px] text-fg-3">v{version}</p>}
        </aside>
    )
}
