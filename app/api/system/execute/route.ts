import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { module, action, ...params } = body;
    let command = '';
    let responseMessage = 'Executed successfully.';

    if (module === 'app_control') {
      const app = params.appName?.toLowerCase().trim() || '';
      
      if (action === 'close') {
        if (app === 'whatsapp') command = 'taskkill /F /IM WhatsApp.exe';
        else if (app === 'chrome') command = 'taskkill /F /IM chrome.exe';
        else if (app === 'vscode' || app === 'code') command = 'taskkill /F /IM Code.exe';
        else command = `taskkill /F /IM ${app}.exe`;
        responseMessage = `${params.appName} closed.`;
      } else {
        if (app === 'whatsapp') command = 'start whatsapp:';
        else if (app === 'notepad') command = 'start notepad';
        else if (app === 'chrome') command = 'start chrome';
        else if (app === 'vscode' || app === 'code') command = 'code';
        else if (app === 'explorer' || app === 'file manager') command = 'explorer';
        else command = `start ${app}`;
        responseMessage = `${params.appName} ready hai.`;
      }
      
      await execAsync(command);

    } else if (module === 'file_manager') {
      const targetPath = params.path || 'C:\\';
      const destPath = params.destPath || '';
      
      if (action === 'open') {
        command = `explorer "${targetPath}"`;
        responseMessage = `${targetPath} open ho gayi hai.`;
      } else if (action === 'create_folder') {
        command = `mkdir "${targetPath}"`;
        responseMessage = `Folder ${targetPath} create ho gaya hai.`;
      } else if (action === 'delete_file') {
        command = `del /F /Q "${targetPath}"`;
        responseMessage = `File ${targetPath} delete ho gayi hai.`;
      } else if (action === 'delete_folder') {
        command = `rmdir /S /Q "${targetPath}"`;
        responseMessage = `Folder ${targetPath} delete ho gaya hai.`;
      } else if (action === 'rename') {
        command = `ren "${targetPath}" "${destPath}"`;
        responseMessage = `Rename successful ho gaya hai.`;
      } else if (action === 'copy') {
        command = `copy "${targetPath}" "${destPath}"`;
        responseMessage = `Copy successful ho gaya hai.`;
      } else if (action === 'move') {
        command = `move "${targetPath}" "${destPath}"`;
        responseMessage = `Move successful ho gaya hai.`;
      } else if (action === 'open_vscode') {
        command = `code "${targetPath}"`;
        responseMessage = `Folder ko VS Code mein open kar diya hai.`;
      }
      
      if (command) await execAsync(command);

    } else if (module === 'system_status') {
      if (action === 'time') {
        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        responseMessage = `Abhi time ${time} ho raha hai.`;
      } else if (action === 'battery') {
        // Simple mock for now, Windows requires wmic
        try {
          const { stdout } = await execAsync('wmic path Win32_Battery get EstimatedChargeRemaining');
          const level = stdout.replace(/\\D/g, '').trim();
          if (level) {
             responseMessage = `Battery level ${level} percent hai.`;
          } else {
             responseMessage = 'Battery status available nahi hai (Desktop PC).';
          }
        } catch(e) {
          responseMessage = 'Battery status available nahi hai.';
        }
      } else if (action === 'lock') {
        command = 'rundll32.exe user32.dll,LockWorkStation';
        responseMessage = 'PC Lock ho gaya hai.';
        await execAsync(command);
      } else if (action === 'restart') {
        command = 'shutdown /r /t 0';
        responseMessage = 'Restarting PC...';
        await execAsync(command);
      } else if (action === 'settings') {
        command = 'start ms-settings:';
        responseMessage = 'Settings open kar di hai.';
        await execAsync(command);
      } else if (action === 'browser') {
        const url = params.url || 'https://google.com';
        command = `start chrome "${url}"`;
        responseMessage = `${url} open ho gaya hai.`;
        await execAsync(command);
      }

    } else if (module === 'project_generator') {
      const projectName = params.projectName || 'AI_Project';
      const projectType = params.projectType || 'react';
      // Create folder in C:\
      const baseDir = 'C:\\SleepCycle_Projects';
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
      }
      const projectDir = path.join(baseDir, projectName);
      
      if (projectType === 'react') {
        // Fast mock: create folders instead of slow npx
        fs.mkdirSync(projectDir, { recursive: true });
        fs.mkdirSync(path.join(projectDir, 'src'));
        fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({name: projectName, version: "1.0.0"}));
        fs.writeFileSync(path.join(projectDir, 'src', 'App.js'), 'export default function App() { return <div>SleepCycle AI Ready</div> }');
        // Open VS Code
        await execAsync(`code "${projectDir}"`);
        responseMessage = `React project ${projectName} generate karke VS Code mein open kar diya hai.`;
      }
    } else {
       return NextResponse.json({ success: false, error: 'Unknown module' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: responseMessage });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
