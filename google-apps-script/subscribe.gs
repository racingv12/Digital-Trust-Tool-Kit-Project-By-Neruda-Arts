/**
 * Digital Trust Toolkit: email subscription → Google Sheet
 *
 * Paste this into the "Subscribers" Google Sheet:
 *   Extensions › Apps Script › replace everything in Code.gs with this file › Save.
 * Then: Deploy › New deployment › type "Web app"
 *   Execute as: Me    Who has access: Anyone
 * Copy the Web app URL into index.html (data-endpoint on the subscribe form).
 *
 * Each sign-up adds one row: Email | Subscribed. An address that's already in
 * the sheet (any upper/lower case) is never added twice.
 */

var SHEET_NAME = 'Subscribers';   // the tab the emails go into (created if missing)
var EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
var THANKS = 'Thanks! You’re on the list.';

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return reply(false, 'Something went wrong. Please try again.');
  }

  // Hidden spam-trap field: people leave it empty, bots usually fill it in.
  // Pretend it worked so bots learn nothing.
  if (data.website) return reply(true, THANKS);

  var email = String(data.email || '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return reply(false, 'Please enter a valid email address.');
  }
  if (data.consent !== true) {
    return reply(false, 'Please tick the box to agree to receive emails.');
  }

  // One sign-up at a time, so two people subscribing at the same moment
  // can't create a duplicate.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return reply(false, 'The list is busy. Please try again in a moment.');
  try {
    var sheet = getSheet();
    var last = sheet.getLastRow();
    if (last > 1) {
      var existing = sheet.getRange(2, 1, last - 1, 1).getValues();
      for (var i = 0; i < existing.length; i++) {
        if (String(existing[i][0]).trim().toLowerCase() === email) {
          // Already subscribed: same answer, so nobody can find out who is on the list
          return reply(true, THANKS);
        }
      }
    }
    // Saved as plain text so Sheets never treats an address as a formula
    sheet.appendRow(["'" + email, new Date()]);
  } finally {
    lock.releaseLock();
  }
  return reply(true, THANKS);
}

// Opening the Web app URL in a browser just shows that it's running.
function doGet() {
  return ContentService.createTextOutput('Digital Trust subscription service is running.');
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME) || book.getSheets()[0];
  if (sheet.getName() !== SHEET_NAME) sheet.setName(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Email', 'Subscribed']);
    sheet.getRange('A1:B1').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 320);
    sheet.setColumnWidth(2, 180);
  }
  return sheet;
}

function reply(ok, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: ok, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
