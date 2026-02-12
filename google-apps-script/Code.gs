var SHEET_ID = "1G0nHTkaHAuRnjZuhNBpereUjJm9y-NfgfzBeR_7i224";
var SHEET_NAME = "lista_volontari";
var NOTIFY_EMAIL = "epc2026@unibo.it";

function saveData(data) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Name",
        "Email",
        "Phone",
        "Affiliation",
        "Preferred Role",
        "Availability",
        "Notes"
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold");
    }

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.email || "",
      data.phone || "",
      data.affiliation || "",
      data.preferred_role || "",
      data.availability || "",
      data.notes || ""
    ]);

    // Send confirmation email to the volunteer
    if (data.email) {
      var subject = "EPC 2026 - Volunteer Registration Confirmed";
      var body = "Dear " + (data.name || "Volunteer") + ",\n\n"
        + "Thank you for registering as a volunteer for the European Population Conference 2026!\n\n"
        + "Here is a summary of your registration:\n"
        + "- Name: " + (data.name || "") + "\n"
        + "- Email: " + (data.email || "") + "\n"
        + "- Phone: " + (data.phone || "") + "\n"
        + "- Affiliation: " + (data.affiliation || "") + "\n"
        + "- Preferred Role: " + (data.preferred_role || "") + "\n"
        + "- Availability: " + (data.availability || "") + "\n"
        + "- Notes: " + (data.notes || "") + "\n\n"
        + "We will get back to you with available shifts and more details.\n\n"
        + "Best regards,\n"
        + "EPC 2026 Organizing Committee\n"
        + "Alma Mater Studiorum - University of Bologna";

      MailApp.sendEmail({
        to: data.email,
        subject: subject,
        body: body,
        replyTo: NOTIFY_EMAIL
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  return saveData(e.parameter);
}

function doGet(e) {
  if (e.parameter && e.parameter.name) {
    return saveData(e.parameter);
  }
  return ContentService
    .createTextOutput("EPC 2026 Volunteer Registration API is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}
