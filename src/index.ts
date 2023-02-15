import * as core from '@actions/core'
import { mkdirSync } from 'fs'
import path from 'path'

import { run } from './runner'

const distFolder = 'dist'
const [_bin, _sourcePath, outDir = path.resolve(__dirname, '..', distFolder)] = process.argv

const jsonParse = <T>(text: string): T | false => {
    try {
        return JSON.parse(text)
    } catch (error) {
        if (error instanceof SyntaxError) {
            return false
        }

        throw error
    }
}

const accessToken = core.getInput('accessToken', { required: true })
const fileKey = core.getInput('fileKey', { required: true })
const exportType = core.getInput('exportType', { required: true }).toLowerCase()
const ids = jsonParse<string[]>(core.getInput('ids', { required: false }) || '[]')

;(async function() {

    if (ids === false) {
        core.setFailed('"ids" must be a stringified array of strings.')
        return;
    }

    // create exportType to enum 'jpg' | 'png' | 'svg' | 'pdf'
    if (exportType !== 'jpg' && exportType !== 'png' && exportType !== 'svg' && exportType !== 'pdf') {
        core.setFailed(`Unsupported export type: ${exportType}`)
        return;
    }

    core.startGroup('Export diagrams')
    const diagrams = await run({ accessToken, fileKey, ids, outDir, exportType })
    core.endGroup()

    mkdirSync(path.resolve(outDir), { recursive: true })

    if (diagrams.length === 0) {
        core.warning('No Diagrams has been exported.')
    }
    core.setOutput('diagrams', diagrams);
    core.setOutput('outDir', `./${distFolder}/`)
})()
