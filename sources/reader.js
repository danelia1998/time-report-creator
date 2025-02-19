const XLSX = require("sheetjs-style");

const converter = require("./converter");

function readSettings(settingsFile, settingsSheet) {
  let settingsWorkbook = null;
  try{
    settingsWorkbook = XLSX.readFile(settingsFile);
  } catch (e) {
    console.error('Could not read the file', e);
    return;
  }
  const settingsData = XLSX.utils.sheet_to_json(settingsWorkbook.Sheets[settingsSheet]);
  const settings = {};
  settings.timeFileName = settingsData[0].File + ".xlsx";
  settings.startDate = converter.formatDateFromDays(settingsData[0].Start);
  settings.endDate = converter.formatDateFromDays(settingsData[0].End);
  settings.projects = groupProjects(settingsData);
  return settings;
}

function groupProjects(settingsData) {
  let projects = new Map();
  settingsData.forEach(({ProjectName, TabName, Tag, LeavePackage}) => {
    let tabInfo = {tabName: TabName, tag: Tag, leavePackage: LeavePackage};
    if(projects.has(ProjectName)) {
      let tabs = projects.get(ProjectName);
      tabs.push(tabInfo);
    } else {
      projects.set(ProjectName, [tabInfo]);
    }
  })
  return projects;
}

function readTimeBook(timeFileName) {
  let timeWorkbook;
  try{
    timeWorkbook = XLSX.readFile(timeFileName);
  } catch(e) {
    console.error(`Cound not read the time file '${timeFileName}'`)
    return;
  }
  const timeData = XLSX.utils.sheet_to_json(timeWorkbook.Sheets[timeWorkbook.SheetNames[0]]);
  return timeData;
}

module.exports = {readSettings, readTimeBook, groupProjects};