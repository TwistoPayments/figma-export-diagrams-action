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
const exportType = core.getInput('exportType', { required: true })
const ids = jsonParse<string[]>(core.getInput('ids', { required: false }) || '[]')

;(async function() {

  if (ids === false) {
    core.setFailed('"ids" must be a stringified array of strings.')
    return;
  }

  core.startGroup('Export diagrams')
  const pdfs = await run({ accessToken, fileKey, ids, outDir , exportType})
  console.log("End group");
  core.endGroup()

  mkdirSync(path.resolve(outDir), { recursive: true })

  if (pdfs.length === 0) {
    core.warning('No Diagrams has been exported.')
  }

  core.setOutput('pdfs', pdfs);
  core.setOutput('outDir', `./${distFolder}/`)
})()
