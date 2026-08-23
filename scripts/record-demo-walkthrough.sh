#!/usr/bin/env bash
# ==============================================================================
# Orchestron — Automated Demo Walkthrough Driver
# This script automates a smooth, realistic 15-second product demonstration
# while you record with macOS Screen Recording (⌘ + Shift + 5).
# ==============================================================================

echo "========================================================"
echo "  🎬 Orchestron Automated Demo Recording Helper"
echo "========================================================"
echo ""
echo "👉 Hướng dẫn quay video chuẩn 60fps sắc nét:"
echo "  1. Nhấn tổ hợp phím:  ⌘ + Shift + 5"
echo "  2. Chọn chế độ: 'Record Selected Window' (Quay cửa sổ)"
echo "  3. Rê chuột click vào cửa sổ Orchestron"
echo "  4. Nhấn [Record] rồi quay lại terminal này nhấn [Enter]"
echo ""
read -p "Nhấn [Enter] để kích hoạt kịch bản tự động chạy..."

echo ""
echo "🚀 Bắt đầu trình diễn trong 2 giây..."
sleep 2

osascript << 'APPLESCRIPT'
tell application "Orchestron"
    activate
    delay 0.5
end tell

tell application "System Events"
    tell process "Orchestron"
        -- 1. Center and resize window smoothly
        try
            set position of front window to {120, 80}
            set size of front window to {1440, 900}
        end try
        delay 2.0

        -- 2. Open Command Palette (⌘K)
        key code 40 using command down
        delay 1.5

        -- 3. Filter Theme in Command Palette
        keystroke "theme"
        delay 1.2
        key code 36 -- Enter
        delay 2.0

        -- 4. Open Orchestra Pit (⇧⌘P)
        key code 35 using {command down, shift down}
        delay 2.5

        -- 5. Toggle Conduct Broadcast Mode (⇧⌘B)
        key code 11 using {command down, shift down}
        delay 2.0

        -- 6. Turn off Conduct Mode
        key code 11 using {command down, shift down}
        delay 1.5

        -- 7. Switch to Git Panel (⇧⌘G)
        key code 5 using {command down, shift down}
        delay 2.5

        -- 8. Return to Workspace Explorer (⇧⌘E)
        key code 14 using {command down, shift down}
        delay 2.0
    end tell
end tell
APPLESCRIPT

echo ""
echo "🎉 Kịch bản biểu diễn tự động đã kết thúc!"
echo "👉 Nhấn nút [Stop] trên thanh Menu Bar của Mac."
echo "👉 File video sẽ tự động nằm ở Desktop hoặc thư mục Movies."
