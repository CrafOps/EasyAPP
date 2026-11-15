/* eslint-disable prettier/prettier */
import { JSX, ReactNode } from 'react'

/** หัวข้อ + กล่องกลุ่ม แบบ System Settings */
export const Group = ({ title, description, actions, children }: {
    title: string
    description?: string
    actions?: ReactNode
    children: ReactNode
}): JSX.Element => (
    <section className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-4 px-1">
            <div>
                <h2 className="text-[13px] font-semibold text-fg">{title}</h2>
                {description && <p className="text-[12px] text-fg-3">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </div>
        <div className="group-box">{children}</div>
    </section>
)

/** แถวในกลุ่ม: ป้ายทางซ้าย, control ทางขวา */
export const Row = ({ label, hint, children }: {
    label: string
    hint?: ReactNode
    children: ReactNode
}): JSX.Element => (
    <div className="group-row">
        <div className="min-w-0 flex-1">
            <p className="text-[13px]">{label}</p>
            {hint && <p className="truncate text-[12px] text-fg-3">{hint}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
)

export const Switch = ({ checked, onChange, label }: {
    checked: boolean
    onChange: (v: boolean) => void
    label: string
}): JSX.Element => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`focus-ring relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200
            ${checked ? 'bg-accent' : 'bg-line-strong'}`}
    >
        <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out
                ${checked ? 'translate-x-4' : ''}`}
        />
    </button>
)

/** ปุ่มเลือก path: แสดง path ปัจจุบัน + ปุ่ม "เลือก…" */
export const PathField = ({ value, placeholder, onPick, disabled }: {
    value: string
    placeholder: string
    onPick: () => void
    disabled?: boolean
}): JSX.Element => (
    <div className="flex w-80 items-center gap-2">
        <span
            className={`min-w-0 flex-1 truncate text-right text-[12.5px] ${value ? 'text-fg-2' : 'text-fg-3'}`}
            title={value}
            dir={value ? 'rtl' : undefined}
        >
            {value || placeholder}
        </span>
        <button className="btn" onClick={onPick} disabled={disabled}>เลือก…</button>
    </div>
)

/** แสดงสถานะผลลัพธ์แบบเรียบ */
export const StatusLine = ({ tone, children }: { tone: 'ok' | 'bad'; children: ReactNode }): JSX.Element => (
    <div className="flex items-center gap-2 px-1 text-[12.5px]">
        <span className={`h-1.5 w-1.5 rounded-full ${tone === 'ok' ? 'bg-ok' : 'bg-bad'}`} />
        <span className="text-fg-2">{children}</span>
    </div>
)

export const Workspace = ({ children }: { children: ReactNode }): JSX.Element => (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pt-4 pb-10">{children}</div>
)
