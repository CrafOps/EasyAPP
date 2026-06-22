import fs from 'fs'
import path from 'path'

export interface ItemOutput {
    name: string
    modelJson: object
    langKey: string
    langValue: string
}

export interface ImageToItemResult {
    outputDir: string
    totalFiles: number
    items: string[]
}

function formatText(text: string): string {
    return text.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export async function generateItemFiles(
    inputPaths: string[],
    outputDir: string,
    modid: string,
    foodRegistry: string,
    log: (msg: string) => void
): Promise<ImageToItemResult> {
    const modelsDir = path.join(outputDir, 'models')
    const texuresDir = path.join(outputDir, 'textures')

    // เคลียร์ output dir
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true })
    }
    fs.mkdirSync(outputDir, { recursive: true })
    fs.mkdirSync(modelsDir, { recursive: true })
    fs.mkdirSync(texuresDir, { recursive: true })

    log(`📁 สร้าง output folder: ${outputDir}`)
    log(`🎯 Mod ID: ${modid}`)
    log(`🍖 Food Registry: ${foodRegistry}`)
    log(``)

    const lang: Record<string, string> = {}
    const codeJava: string[] = []
    const canEat: string[] = []
    const pOutput: string[] = []
    const items: string[] = []

    for (const inputPath of inputPaths) {
        const file = path.basename(inputPath)
        if (!file.endsWith('.png')) continue

        const name = file.replace('.png', '')

        // สร้าง model JSON
        const modelJson = {
            parent: 'item/generated',
            textures: {
                layer0: `${modid}:item/foods/${name}`,
            },
        }
        fs.writeFileSync(
            path.join(modelsDir, `${name}.json`),
            JSON.stringify(modelJson, null, 2),
            'utf-8'
        )

        // copy texture
        fs.copyFileSync(inputPath, path.join(texuresDir, file))

        // lang
        lang[`item.${modid}.${name}`] = formatText(name)

        // can_eat
        canEat.push(`${modid}:${name}`)

        // code java (Fabric)
        codeJava.push(
            `    public static final Item ${name.toUpperCase()} = registerItem("${name}", new Item(new FabricItemSettings().food(${foodRegistry}).maxCount(64)));`
        )

        // pOutput
        pOutput.push(`output.accept(ItemsRegister.${name.toUpperCase()});`)

        items.push(name)
        log(`✅ ${name} — model + texture + lang`)
    }

    // เขียนไฟล์ output
    fs.writeFileSync(path.join(outputDir, 'en_us.json'), JSON.stringify(lang, null, 2), 'utf-8')
    log(``)
    log(`📄 en_us.json — ${Object.keys(lang).length} entries`)

    fs.writeFileSync(path.join(outputDir, 'code.txt'), codeJava.join('\n'), 'utf-8')
    log(`📄 code.txt — ${codeJava.length} items`)

    fs.writeFileSync(path.join(outputDir, 'names.json'), JSON.stringify(canEat, null, 2), 'utf-8')
    log(`📄 names.json`)

    fs.writeFileSync(path.join(outputDir, 'pOutput.txt'), pOutput.join('\n'), 'utf-8')
    log(`📄 pOutput.txt`)

    log(``)
    log(`✅ เสร็จแล้ว! รวม ${items.length} items`)
    log(`📁 Output: ${outputDir}`)

    return { outputDir, totalFiles: items.length, items }
}