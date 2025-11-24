Seamless Loop Player — Electron Desktop App (FFmpeg edition)

Features:
- Bundles ffmpeg-static so unsupported videos (HEVC, MKV, AV1, etc.) are transcoded automatically to H.264/AAC MP4 before playing.
- 'Open & Convert' button will transcode to a temp MP4 and then play it.
- 'Export Loop' will produce a looped MP4 of requested duration using FFmpeg.

How to run (local development):
1. Extract this ZIP to your computer.
2. Open terminal in the folder.
3. Run:
   npm install
   npm start

To build an installer (.exe):
   npm run dist

Notes:
- The bundle includes ffmpeg-static which increases package size.
- On first run Windows Defender might warn about unknown app; it's your build of this app.
