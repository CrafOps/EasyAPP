/* eslint-disable prettier/prettier */
import { JSX } from 'react'
import { AudioWaveform, Settings, Clock, Globe } from 'lucide-react'

interface Tab {
    id: string
    label: string
    icon: JSX.Element
    disabled?: boolean
}

interface BottomNavProps {
    activeTab: string
    onTabChange: (id: string) => void
}

const tabs: Tab[] = [
    { id: 'converter', label: 'Converter', icon: <AudioWaveform size={16} /> },
    { id: 'loadpleng', label: 'Loadpleng', icon: <Globe size={16} /> },
    { id: 'history', label: 'History', icon: <Clock size={16} />, disabled: true },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} />, disabled: true },
]

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps): JSX.Element => (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#0e0e0e] border-t border-[#1e1e1e] flex items-stretch z-50">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
                <button
                    key={tab.id}
                    disabled={tab.disabled}
                    onClick={() => !tab.disabled && onTabChange(tab.id)}
                    className={`
            flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
            ${isActive
                            ? 'text-[#c0c0c0]'
                            : tab.disabled
                                ? 'text-[#2a2a2a] cursor-not-allowed'
                                : 'text-[#444] hover:text-[#777]'
                        }
          `}
                >
                    {tab.icon}
                    <span className="text-[9px] tracking-[0.12em] uppercase">{tab.label}</span>
                    {isActive && (
                        <span className="absolute bottom-0 w-8 h-[1px] bg-[#666]" />
                    )}
                </button>
            )
        })}
    </div>
)