const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile(path.join(__dirname, 'www', 'index.html'));
}

app.whenReady().then(createWindow);

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{name:'Videos', extensions:['mp4','mkv','mov','webm','avi','m4v','ts','mkv']}] });
  if (canceled || !filePaths.length) return null;
  return filePaths[0];
});

ipcMain.handle('convert:openAndConvert', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{name:'Videos', extensions:['*']}] });
  if (canceled || !filePaths.length) return null;
  const src = filePaths[0];
  try {
    const out = await transcodeToMp4(src);
    return out;
  } catch (e) {
    console.error('transcode failed', e);
    return null;
  }
});

ipcMain.handle('export:loop', async (evt, src, durationSec) => {
  const outdir = path.join(os.tmpdir(), 'seamless_exports');
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive:true });
  const out = path.join(outdir, 'export_loop_' + Date.now() + '.mp4');
  return new Promise((resolve)=>{
    const args = [
      '-y',
      '-i', src,
      '-t', String(durationSec),
      '-c:v','libx264','-preset','veryfast',
      '-c:a','aac','-b:a','192k',
      out
    ];
    const ff = spawn(ffmpegPath, args);
    ff.on('error',(err)=>{ resolve({ok:false, error:String(err)}); });
    ff.on('close',(code)=>{
      if(code===0) { shell.showItemInFolder(out); resolve({ok:true, path:out}); }
      else resolve({ok:false, code});
    });
  });
});

function transcodeToMp4(src){
  return new Promise((resolve, reject)=>{
    const outdir = path.join(os.tmpdir(), 'seamless_tmp');
    if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive:true });
    const out = path.join(outdir, 'conv_' + Date.now() + '.mp4');
    const args = ['-y', '-i', src, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac', '-b:a', '192k', out];
    const ff = spawn(ffmpegPath, args, { windowsHide:true });
    ff.stderr.on('data', (d)=>{});
    ff.on('error', (err)=> reject(err));
    ff.on('close', (code)=>{
      if(code===0) resolve(out);
      else reject(new Error('ffmpeg exit ' + code));
    });
  });
}

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
