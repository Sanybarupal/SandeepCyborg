const http = require('http');

function sendPost(module, action, payload = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ module, action, ...payload });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/system/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, res => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch(e) {
          reject(e);
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING LIVE TESTS ---');
  
  // 1. App Control
  console.log('Testing App Control (Notepad)...');
  let res = await sendPost('app_control', 'open', { appName: 'notepad' });
  console.log('Open Result:', res);
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Testing App Control Close (Notepad)...');
  res = await sendPost('app_control', 'close', { appName: 'notepad' });
  console.log('Close Result:', res);
  
  // 2. File Manager
  console.log('\\nTesting File Manager...');
  res = await sendPost('file_manager', 'create_folder', { path: 'C:\\\\SleepCycle_NewFolder' });
  console.log('Create Folder Result:', res);
  
  res = await sendPost('file_manager', 'rename', { path: 'C:\\\\SleepCycle_NewFolder', destPath: 'C:\\\\SleepCycle_Renamed' });
  console.log('Rename Folder Result:', res);
  
  res = await sendPost('file_manager', 'delete_folder', { path: 'C:\\\\SleepCycle_Renamed' });
  console.log('Delete Folder Result:', res);
  
  // 3. System Status
  console.log('\\nTesting System Status...');
  res = await sendPost('system_status', 'time');
  console.log('Time Result:', res);
  
  res = await sendPost('system_status', 'battery');
  console.log('Battery Result:', res);
  
  console.log('\\n--- TESTS COMPLETED SUCESSFULLY ---');
}

runTests();
