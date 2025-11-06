# Manual Fix Required for SchedulePreview.tsx

## Problem
Lines 1052-1066 in `/components/SchedulePreview.tsx` contain corrupted escaped quotes that prevent the build from succeeding.

## Solution
Delete lines 1052-1066 from the file.

## Step-by-Step Instructions

### Option 1: Using a Text Editor

1. Open `/components/SchedulePreview.tsx` in your text editor
2. Go to line 1052
3. Select and delete lines 1052 through 1066 (15 lines total)
4. Save the file

### Option 2: Using sed (Mac/Linux)

Run this command from the project root:

```bash
sed -i.bak '1052,1066d' components/SchedulePreview.tsx
```

### Option 3: Using Node.js

Run this command from the project root:

```bash
node -e "const fs=require('fs'); const lines=fs.readFileSync('components/SchedulePreview.tsx','utf8').split('\\n'); fs.writeFileSync('components/SchedulePreview.tsx', [...lines.slice(0,1051), ...lines.slice(1067)].join('\\n'));"
```

## What You're Deleting

The corrupted section looks like this:

```
1052:           <div className=\\\"mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded\\\">
1053:             <div className=\\\"flex items-start gap-2\\\">
1054:               <Info className=\\\"w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5\\\" />
1055:               <div className=\\\"text-sm\\\">
1056:                 <p className=\\\"text-blue-900 mb-1\\\">
1057:                   <strong>About Water & Cost Savings</strong>
1058:                 </p>
1059:                 <p className=\\\"text-blue-800\\\">
1060:                   Savings estimates are based on EPA WaterSense research and regional water rates{climateZone ? ` for ${climateZone.name}` : ''}. 
1061:                   Actual results vary by weather patterns, soil conditions, plant health, and current usage. Smart irrigation \n1062:                   typically saves 20-30% compared to traditional timer-based systems.\n1063:                 </p>\n1064:               </div>\n1065:             </div>\n1066:           </div>
```

Notice the `className=\\\"` with backslash escapes - that's invalid JSX and causes the build error.

## After the Fix

After deleting those lines:
- Line 1051 will still be: `{/* Season Change Warning */}`
- Line 1052 will become what was previously line 1068: `{scheduleDetails.daysUntilSeasonChange < 30 && (`

## Verification

After making the fix, run:

```bash
npm run package:plugin
```

The build should complete successfully!

## Why This Happened

These lines had escaped backslashes in className attributes (`className=\\\"...`) instead of regular quotes (`className="..."`). The editing tools couldn't match these corrupted characters, so a manual fix is required.
