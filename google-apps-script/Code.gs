/**
 * EPC 2026 Volunteer Registration - Google Apps Script
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this code into Code.gs
 * 3. Share the Google Sheet with the service account:
 *    fertility-ads@gen-lang-client-0627950481.iam.gserviceaccount.com
 *    (give it Editor access)
 * 4. Click Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the web app URL and paste it in assets/main.js (GOOGLE_SCRIPT_URL)
 */

var SHEET_ID = '1G0nHTkaHAuRnjZuhNBpereUjJm9y-NfgfzBeR_7i224';
var SHEET_NAME = 'lista_volontari';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
    }

    var data = e.parameter;

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Affiliation',
        'Preferred Role',
        'Availability',
        'Notes'
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.affiliation || '',
      data.preferred_role || '',
      data.availability || '',
      data.notes || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('EPC 2026 Volunteer Registration API is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
