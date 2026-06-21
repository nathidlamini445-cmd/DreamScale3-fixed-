export type SheetTab = {
  name: string
  rows: string[][]
}

export type GoogleSheetExport = {
  title: string
  sheets: SheetTab[]
}

