# Clear All Caches - Mobile Fix

The issue is that Expo Router isn't detecting your index.tsx file. Follow these steps EXACTLY:

## Step 1: Stop the Server
Press `Ctrl+C` in the terminal to stop the current Expo server.

## Step 2: Clear ALL Caches
Run these commands in PowerShell (one at a time):

```powershell
cd C:\Users\primo\Desktop\HCI\FinanceWise

# Clear npm cache
npm cache clean --force

# Clear Expo cache
npx expo start --clear

# If that doesn't work, also try:
# Delete .expo folder if it exists
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Delete node_modules/.cache if it exists  
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Then restart
npx expo start --clear
```

## Step 3: Verify Files Exist
Make sure these files exist:
- ✅ `app/index.tsx` (NOT index.jsx)
- ✅ `app/_layout.tsx`
- ✅ `package.json` with `"main": "expo-router/entry"`

## Step 4: Restart Fresh
After clearing caches:
```powershell
npx expo start --clear
```

## Alternative: Nuclear Option
If still not working, try this complete reset:

```powershell
cd C:\Users\primo\Desktop\HCI\FinanceWise

# Stop server first (Ctrl+C)

# Delete all cache folders
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Clear watchman (if installed)
watchman watch-del-all 2>$null

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install

# Start fresh
npx expo start --clear
```

## Important Notes:
- Make sure you're in the correct directory: `C:\Users\primo\Desktop\HCI\FinanceWise`
- The command is `--clear` (no space, one dash before clear)
- Wait for the bundling to complete before scanning QR code
- Try closing and reopening Expo Go app on your phone

