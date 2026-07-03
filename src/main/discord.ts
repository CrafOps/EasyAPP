import { Client } from 'discord-rpc'

const CLIENT_ID = '1522711039345688577'
let rpc: Client | null = null

export async function initDiscordRPC(): Promise<void> {
    try {
        rpc = new Client({ transport: 'ipc' })

        rpc.on('ready', () => {
            rpc?.setActivity({
                details: 'CrafOps EasyAPP Application',
                state: 'Made for Minecraft Developer',
                largeImageKey: 'icon',
                largeImageText: 'EasyAPP',
                startTimestamp: new Date(),
                buttons: [
                    { label: '📢 Download', url: 'https://github.com/CrafOps/EasyAPP/releases' },
                    { label: '💸 Support Me', url: 'https://easydonate.app/ppekkungz' }
                ]
            })
        })

        await rpc.login({ clientId: CLIENT_ID })
        console.log('Discord RPC connected')
    } catch (err) {
        console.log('Discord RPC failed (Discord not running):', err)
    }
}

export function updateActivity(details: string, state: string): void {
    rpc?.setActivity({
        details,
        state,
        largeImageKey: 'icon',
        largeImageText: 'EasyAPP',
        startTimestamp: new Date(),
    })
}

export function destroyDiscordRPC(): void {
    rpc?.destroy()
    rpc = null
}