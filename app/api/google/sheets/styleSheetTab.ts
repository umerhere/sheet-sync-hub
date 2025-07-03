export async function styleSheetTab ({
  sheetId,
  tabSheetId,
  headers,
  token
}: {
  sheetId: string
  tabSheetId: number
  headers: string[]
  token: string
}) {
  const requests = [
    // Merge title row (A1:G1 or based on header length)
    {
      mergeCells: {
        range: {
          sheetId: tabSheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: headers.length
        },
        mergeType: 'MERGE_ALL'
      }
    },
    // Style title row
    {
      repeatCell: {
        range: {
          sheetId: tabSheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: headers.length
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              bold: true,
              fontSize: 14
            },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(textFormat,horizontalAlignment)'
      }
    },
    // Style header row (A2:G2)
    {
      repeatCell: {
        range: {
          sheetId: tabSheetId,
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: headers.length
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              bold: true,
              fontSize: 12
            }
          }
        },
        fields: 'userEnteredFormat.textFormat'
      }
    }
  ]

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    }
  )
}
