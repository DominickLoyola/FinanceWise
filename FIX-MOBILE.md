# FIX FOR MOBILE - Complete Reset

Since it was working a week ago, this is definitely a cache/route manifest issue. Follow these steps EXACTLY:

## Step 1: Stop Everything
- Press `Ctrl+C` in terminal to stop Expo
- Close Expo Go app on your phone completely

## Step 2: Delete ALL Cache Folders
Run these commands in PowerShell:

```powershell
cd C:\Users\primo\Desktop\HCI\FinanceWise

# Delete .expo folder (contains route manifest)
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Delete .expo-shared folder if it exists
Remove-Item -Recurse -Force .expo-shared -ErrorAction SilentlyContinue

# Delete node_modules cache
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Delete any dist/build folders
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
```

## Step 3: Clear npm and Expo Caches
```powershell
npm cache clean --force
npx expo install --fix
```

## Step 4: Force Route Regeneration
```powershell
# This will force Expo Router to regenerate all routes
npx expo start --clear --reset-cache
```

## Step 5: If Still Not Working - Nuclear Option
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Start with all caches cleared
npx expo start --clear --reset-cache
```

## Step 6: On Your Phone
1. **Completely close Expo Go** (swipe it away from recent apps)
2. **Reopen Expo Go**
3. **Scan the QR code again**

## Why This Happens
Expo Router caches the route manifest in the `.expo` folder. When files change (like going from index.jsx to index.tsx), the cache can become stale and Expo Router thinks there are no routes, showing the default "Welcome to Expo" page.

The `--clear` and `--reset-cache` flags force Expo Router to regenerate everything from scratch.

