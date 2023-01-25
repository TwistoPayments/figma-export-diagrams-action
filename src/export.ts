import {Api, Node, NodeTypes} from 'figma-api'
import {getGroups} from './figma'

export type FigmaExport = {
    id: string
    name: string
    pages: string[],
    cover: string
}

type Props = {
    accessToken: string
    fileKey: string
    ids: string[]
    exportType: 'jpg' | 'png' | 'svg' | 'pdf'
}

const pagesAreOk = (pages: (string | null)[]): pages is string[] => {
    return pages.find(page => typeof page !== 'string') === undefined
}

export const getFigmaExport = async ({accessToken, fileKey, ids = [], exportType}: Props): Promise<FigmaExport[]> => {

    console.log("Start fetching diagrams from Figma : " + exportType);

    const api = new Api({
        personalAccessToken: accessToken
    })

    const {document: {children: pages}} = await api.getFile(fileKey, {ids})

    const groups = getGroups(pages)

    return await Promise.all(
        groups.map(
            async group => {
                const frameIds = group.children.map(frame => frame.id)
                let ids = ""

                if (exportType.toLowerCase() === 'pdf') {
                    ids = frameIds.join(',')
                } else if (exportType.toLowerCase() === 'png') {
                    ids = group.id
                } else {
                    throw new Error(`Unsupported export type: ${exportType}`)
                }

                const exportResponse = await api.getImage(fileKey, {
                    ids: ids,
                    format: exportType,
                    scale: 1
                })

                if (exportResponse.err) {
                    throw new Error(exportResponse.err)
                }

                const pages = Object.values(exportResponse.images)

                if (!pagesAreOk(pages)) {
                    throw new Error('Found empty pages!')
                }

                const coverResponse = await api.getImage(fileKey, {
                    ids: frameIds[0],
                    format: 'jpg',
                    scale: 1
                })

                if (coverResponse.err) {
                    throw new Error(coverResponse.err)
                }

                const [cover] = Object.values(coverResponse.images)

                if (!cover) {
                    throw new Error('Cannot create cover!')
                }

                return {
                    id: group.id,
                    name: group.name,
                    pages,
                    cover
                }
            }
        )
    )
}
