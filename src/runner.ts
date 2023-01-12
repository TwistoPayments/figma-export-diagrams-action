import * as core from '@actions/core'
import {mkdirSync, writeFileSync} from 'fs'
import fetch from 'node-fetch'
import path, {sep} from 'path'
import PDFMerger from 'pdf-merger-js'

import {getFigmaExport, FigmaExport} from './export'

type Options = {
    accessToken: string
    fileKey: string
    ids: string[]
    outDir: string
    exportType: 'jpg' | 'png' | 'svg' | 'pdf'
}

type Result = {
    id: string
    name: string
    basename: string
    filepath: string
    cover: string
}

export async function run({accessToken, fileKey, ids, outDir, exportType}: Options): Promise<Result[]> {

    const diagrams = await getFigmaExport({
        accessToken,
        fileKey,
        ids,
        exportType,
    })

    const result: Result[] = []
    console.log("Start exporting diagrams in " + exportType);

    for (const diagram of diagrams) {

        const pages = await Promise.all(
            diagram.pages.map(
                async page => Buffer.from(await fetch(page).then(r => r.arrayBuffer()))
            )
        )

        const cover = Buffer.from(await fetch(diagram.cover).then(r => r.arrayBuffer()))

        const coverFilename = `${diagram.name}.jpg`
        const pdfFilename = `${diagram.name}.pdf`
        const pdfFilepath = path.resolve(outDir, pdfFilename)
        const pdfBasename = path.basename(pdfFilename)

        mkdirSync(path.dirname(pdfFilepath), {recursive: true})

        core.info(pdfBasename)

        // compare case-insensitive export type with PDF or PNG
        if (exportType.toLowerCase() === "pdf") {
            const pdfMerger = new PDFMerger();
            for (const page of pages) {
                await pdfMerger.add(page)
            }
            await pdfMerger.save(path.resolve(outDir, pdfFilename))
        } else if (exportType.toLowerCase() === "png") {
            let pngFileCount = 0
            for (const page of pages) {
                let pngFileName = `${diagram.name}_${pngFileCount}.png`
                console.log(pngFileName);
                writeFileSync(path.resolve(outDir, pngFileName), page)
                pngFileCount = pngFileCount + 1
            }
        } else {
            throw new Error(`Unsupported export type: ${exportType}`)
        }

        writeFileSync(path.resolve(outDir, coverFilename), cover)

        result.push({
            id: diagram.id,
            name: path.basename(diagram.name),
            basename: pdfBasename,
            filepath: `.${sep}${path.join(path.basename(outDir), pdfFilename)}`,
            cover: `.${sep}${path.join(path.basename(outDir), coverFilename)}`,
        })
    }

    return result
}
