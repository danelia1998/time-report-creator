const XLSX = require('sheetjs-style');
const converter = require('./converter');
const Formatter = require('./formatter');

const formatter = new Formatter();

function createReport(projectName, tabs, settings, timeData) {
  const reportFileName = `${projectName}_${settings.startDate}_${settings.endDate}_report.xlsx`;
  const wb = XLSX.utils.book_new();

  let ws_data = [
    [ "Activities",	"Service Points Spent"]
  ];
  let total = 0;
  tabs.forEach(tab => {
    let spent = timeData.filter(({Tag}) => Tag == tab.tag).map(record => record.Hours).reduce((a, b) => (a + b), 0);
    ws_data.push([tab.tabName, spent]);
    total+= spent;
    if(!spent){
      console.error(`No time spent for project '${projectName}', tab '${tab.tabName}', tag '${tab.tag}'`);
    }
  })
  ws_data.push([ "Total Service Points",	total])

  let ws = XLSX.utils.aoa_to_sheet(ws_data);
  
  // apply formatting
  ["A1", "B1"].forEach(cell => formatter.applyHeaderFormat(ws[cell]));

  XLSX.utils.book_append_sheet(wb, ws, "Summary");

  // create tabs
  tabs.forEach(tabInfo => createTab(tabInfo, timeData, wb));

  XLSX.writeFile(wb, reportFileName);
}

function getHeader(isPackageRequired) {
  let header = ["Employee"];
  if(isPackageRequired) {
    header.push("Package");
  }
  header.push("Activity description", "Date", "Service Points");
  return header;
}

function createTab(tabInfo, timeData, wb) {
  let ws_name = tabInfo.tabName;
  const header = getHeader(tabInfo.leavePackage == 'Y');
  const propertyMap = {
    "Service Points": (info) => info["Hours"],
    "Date": (info) => converter.formatDateFromDays(info["Date"])
  };
  let tabTimeData = timeData.filter(({Tag}) => Tag == tabInfo.tag);
  let ws_data = [header];
  tabTimeData.forEach(info => {
    let row = header.map(property => 
      propertyMap[property] ? propertyMap[property](info) : info[property]
    );
    ws_data.push(row);
  });
  let summaryRow = ["Service Points spent"];
  for(let i = 1; i < header.length - 1; i++) {
    summaryRow.push("");
  }
  summaryRow.push(tabTimeData.map(data => data["Hours"]).reduce((a, b) => (a + b), 0));
  ws_data.push(summaryRow)
  let ws = XLSX.utils.aoa_to_sheet(ws_data);
  const headerCells = ["A1","B1","C1","D1"];
  if(header.length > 4) {
    headerCells.push("E1");
  }
  headerCells.forEach(cell => formatter.applyTabsHeaderFormat(ws[cell]));
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
}

module.exports = {createReport};