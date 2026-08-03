import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const { appName } = await request.json();
    let command = '';

    const app = appName.toLowerCase().trim();
    if (app === 'whatsapp') {
      command = 'start whatsapp:';
    } else if (app === 'notepad') {
      command = 'start notepad';
    } else if (app === 'calculator' || app === 'calc') {
      command = 'start calc';
    } else {
      // Basic fallback
      command = `start ${app}`;
    }

    await execAsync(command);
    return NextResponse.json({ success: true, message: `${appName} opened successfully.` });
  } catch (error) {
    console.error('Error opening app:', error);
    return NextResponse.json({ success: false, error: 'Failed to open app' }, { status: 500 });
  }
}
