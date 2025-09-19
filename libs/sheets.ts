import { google } from "googleapis";

type SheetForm = {
    iten_name: string
    quantity: number
    price: number
    payment_method: string
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

export const addToSalesSheet = async (formData: SheetForm) => {
    const sheets = getGoogleSheets()
    const { iten_name, quantity, price, payment_method } = formData
    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Sales',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [
                [iten_name, quantity, price, payment_method, new Date().toLocaleString()]

            ]
        }
    })
}
