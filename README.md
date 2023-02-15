# Figma Export Diagrams action

This action is a for from [Figma Export](https://github.com/marcomontalbano/figma-export) and it's extended to export diagrams from Figma using another formats such as PNG, JPG and SVG.

This action is able to export content from a Figma file as PDF, PNG, JPG and SVG.
Then you can save the pdf as workflow artifact, upload it to an ftp server, or do whatever you want.

## Figma file structure

In order to export a pdf from a Figma file, it have to be structured in a specific way.

```sh
Figma page
|
├── group # this is a pdf
│   ├── frame # page 1
│   ├── frame # page 2
│   └── frame # page 3
|
└── group # this is another pdf
    ├── frame # page 1
    └── frame # page 2
```

A pdf page have to be a `figma frame`, and pages have to be grouped with a `figma group`.
You can take a look at [this example](https://www.figma.com/file/VQxKo2pnaksjE7Vql999Qv/figma-export-pdfs-action?node-id=138%3A28).


## Usage

```yml
- name: Figma Export Diagrams
  id: figmaExportDiagrams
  uses: TwistoPayments/figma-export-diagrams-action@develop
  with:
    accessToken: ${{ secrets.FIGMA_ACCESS_TOKEN }}
    fileKey: VQxKo2pnaksjE7Vql999Qv
    ids: ["120:3","138:28"]
    exportType: 'png'

- name: Log
  echo "pdfs: $pdfs"
  echo "outDir: $outDir"
  env:
    pdfs: ${{ steps.figmaExportDiagrams.outputs.pdfs }}
    outDir: ${{ steps.figmaExportDiagrams.outputs.outDir }}
```

Checkout a working example [`dispatch.yaml`](.github/workflows/run-figma.aml).

### Inputs

| Key           |   Required   | Description                              | Example                                    | Default |
|---------------|:------------:|------------------------------------------|--------------------------------------------|:-------:|
| `accessToken` |   **yes**    | Figma access token                       | xxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |         |
| `fileKey`     |   **yes**    | Figma file key                           | rAJHsSg4SC5NqFIFib5NWz                     |         |
| `ids`         |      no      | List of ids to export. Default to *all*  | ["17:786", "6:786"]                        |   [ ]   |
| `exportType`  |   **yes**    | Export type format (pdf, png, svg, jpg) | 'PNG'                                      |         |


### Outputs

| Key      | Description                                | Example |
|----------|--------------------------------------------|---------|
| `pdfs`   | List of exported diagrams                  | *       |
| `outDir` | Output directory for all emitted pdf files | ./dist/ |

> **\*** For example a `pdfs` could looks like the following:
> 
> ```json
> [
>   {
>     "id": "6:786",
>     "name": "figma-export-cover",
>     "basename": "figma-export-cover.pdf",
>     "filepath": "./dist/figma-export-cover.pdf",
>     "cover": "./dist/figma-export-cover.jpg"
>   }
> ]
> ```


## Live Example

I created a `cron.yaml` workflow that runs scheduled.

This workflow will export the page "cover" and the page "unit-test" from [this Figma file](https://www.figma.com/file/VQxKo2pnaksjE7Vql999Qv).

You can check the latest run from [this page](https://github.com/marcomontalbano/figma-export-pdfs-action/actions/workflows/cron.yaml) and look at the logs.
An artifact called `my-pdfs` is also available for logged user so that you can check what's the final result.



## Export PDFs directly from Figma

What do you think about exporting Figma content as PDF to an FTP Server, just clicking a button from Figma? Would it be cool, isn't it?

Take a look at this [workflow](.github/workflows/from-figma.yaml) and find out how this is totally feasible. Just clone the workflow and setup [this Figma plugin](https://www.figma.com/community/plugin/1096890502176164513) 😉

![Demo](https://raw.githubusercontent.com/marcomontalbano/figma-plugin-run-github-actions-workflows/main/cover.gif)

## Run this action locally for development

***Prerequisites***:
Install act:
- Mac OS - `brew install act`
- Windows - `choco install act`
- Linux - `sudo snap install act`

```sh
act -j export-locally --secret-file my.secrets --container-architecture linux/amd64 --rebuild
```
