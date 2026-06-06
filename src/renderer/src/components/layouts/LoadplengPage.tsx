/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from 'react'

const WebView = 'webview' as any  // ✅ bypass ESLint webview unknown props

export const LoadplengPage = (): JSX.Element => (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>
        <WebView
            src="https://loadpleng.ppekkungz.in.th/"
            allowpopups="true"
            webpreferences="autoplayPolicy=no-user-gesture-required"
            style={{ flex: 1, width: '100%', height: '100%' }}
        />
    </div>
)