/* eslint-disable prettier/prettier */
import { JSX, ReactNode, RefObject, useContext } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'
import { ToolbarSlotContext } from './toolbarSlot'


export const ToolbarActions = ({ children }: { children: ReactNode }): JSX.Element | null => {
    const slot = useContext(ToolbarSlotContext)
    return slot ? createPortal(children, slot) : null
}

interface ToolbarProps {
    title: string
    query: string
    onQueryChange: (q: string) => void
    onSubmitQuery: () => void
    searchRef: RefObject<HTMLInputElement | null>
    slotRef: (el: HTMLDivElement | null) => void
}

export const Toolbar = ({ title, query, onQueryChange, onSubmitQuery, searchRef, slotRef }: ToolbarProps): JSX.Element => (
    <header className="toolbar drag flex h-12 shrink-0 items-center gap-3 bg-workspace pl-6">
        <h1 className="min-w-0 flex-1 truncate text-[14px] font-semibold">{title}</h1>

        <div className="relative w-52 shrink-0">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-3" />
            <input
                ref={searchRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onSubmitQuery()
                    if (e.key === 'Escape') { onQueryChange(''); e.currentTarget.blur() }
                }}
                placeholder="ค้นหาเครื่องมือ"
                aria-label="ค้นหาเครื่องมือ"
                className="input h-7 border-transparent bg-accent-wash pr-14 pl-8 hover:border-line"
            />
            {query ? (
                <button
                    onClick={() => onQueryChange('')}
                    aria-label="ล้างการค้นหา"
                    className="focus-ring absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5 text-fg-3 hover:text-fg"
                >
                    <X size={13} />
                </button>
            ) : (
                <span className="kbd pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2">Ctrl K</span>
            )}
        </div>

        <div ref={slotRef} className="flex shrink-0 items-center gap-1.5 empty:hidden" />
    </header>
)
