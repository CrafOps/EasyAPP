/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from 'react'
import { ExternalLink } from 'lucide-react'
import { ToolbarActions } from '../shell/Toolbar'

const WebView = 'webview' as any  // ✅ bypass ESLint webview unknown props
const SITE_URL = 'https://loadpleng.ppekkungz.in.th/'

export const LoadplengPage = (): JSX.Element => (
    <div className="flex h-full flex-col">
        <ToolbarActions>
            <button className="btn-ghost" onClick={() => window.open(SITE_URL)} title="เปิดในเบราว์เซอร์">
                <ExternalLink size={15} strokeWidth={1.75} />
            </button>
        </ToolbarActions>
        <WebView
            src={SITE_URL}
            allowpopups="true"
            webpreferences="autoplayPolicy=no-user-gesture-required"
            style={{ flex: 1, width: '100%', height: '100%' }}
        />
    </div>
)
