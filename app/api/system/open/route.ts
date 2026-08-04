import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const appName = body.appName;
    const action = body.action || 'open';
    let command = '';

    const app = appName.toLowerCase().trim();
    
    if (action === 'close') {
      if (app === 'whatsapp') {
        command = 'taskkill /F /IM WhatsApp.exe';
      } else if (app === 'chrome') {
        command = 'taskkill /F /IM chrome.exe';
      } else {
        command = `taskkill /F /IM ${app}.exe`;
      }
    } else {
      if (app === 'whatsapp') {
        command = 'start whatsapp:';
      } else if (app === 'notepad') {
        command = 'start notepad';
      } else if (app === 'chrome') {
        command = 'start chrome';
      } else if (app === 'calculator' || app === 'calc') {
        command = 'start calc';
      } else {
        command = `start ${app}`;
      }
    }

    await execAsync(command);
    return NextResponse.json({ success: true, message: `${appName} processed successfully.` });
  } catch (error) {
    console.error('Error opening app:', error);
    return NextResponse.json({ success: false, error: 'Failed to open app' }, { status: 500 });
  }
}
