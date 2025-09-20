import { google } from "googleapis";

type SalesSheetForm = {
    iten_name: string
    quantity: number
    price: number
    payment_method: string
    userId: string
}

type InventorySheetForm = {
    iten_name: string
    units: number
    sale_price: number
    cost_price: number
    userId: string
}

export const getGoogleSheets = () => {

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ]
  })

  const sheets = google.sheets({
    auth, 
    version: 'v4',
  })

  return sheets
}

export const addSalesToSheet = async (rows: SalesSheetForm[]) => {
  const sheets = getGoogleSheets()
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sales',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows.map(r => [
        r.iten_name,
        r.quantity,
        r.price,
        r.payment_method,
        r.userId,
        new Date().toISOString().replace("T", " ").replace("Z", "")
      ])
    }
  })
}

export const addInventoryToSheet = async (rows: InventorySheetForm[]) => {
  const sheets = getGoogleSheets()
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Inventory',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows.map(r => [
        r.iten_name,
        r.units,
        r.sale_price,
        r.cost_price,
        r.userId,
        new Date().toISOString().replace("T", " ").replace("Z", "")
      ])
    }
  })
}

export const updateExistingInventoryInSheet = async (row: InventorySheetForm, rowIndex: number) => {
  const sheets = getGoogleSheets()
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `Inventory!A${rowIndex}:F${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        row.iten_name,
        row.units,
        row.sale_price,
        row.cost_price,
        row.userId,
        new Date().toISOString().replace("T", " ").replace("Z", "")
      ]]
    }
  })
}

export const addExpensesToSheet = async (rows: { description: string, amount: number, userId: string }[]) => {
  const sheets = getGoogleSheets()
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Expenses',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows.map(r => [
        r.description,
        r.amount,
        r.userId,
        new Date().toISOString().replace("T", " ").replace("Z", "")
      ])
    }
  })
}

export const addInvestmentsToSheet = async (rows: { description: string, amount: number, userId: string }[]) => {
  const sheets = getGoogleSheets()
  await sheets.spreadsheets.values.append({ 
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Investments',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows.map(r => [ 
        r.description,
        r.amount,
        r.userId,
        new Date().toISOString().replace("T", " ").replace("Z", "")
      ])
    }
  })
}

export const findInventoryRowIndex = async (itemName: string) => {
  const sheets = getGoogleSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Inventory!A:A',
  })

  const rows = res.data.values || []
  const index = rows.findIndex(r => r[0] === itemName)

  if (index === -1) return null
  return index + 1
}
