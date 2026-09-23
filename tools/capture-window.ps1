<#
.SYNOPSIS
  Render a single native window to a PNG, from its own handle.

.DESCRIPTION
  Uses PrintWindow(hwnd, hdc, PW_RENDERFULLCONTENT) into an offscreen bitmap.

  It never copies the screen. A screen copy captures whatever is on top, and a
  non-DPI-aware process mis-measures the rectangle — on 2026-08-28 that
  combination captured a private messaging window instead of the intended one.
  Rendering from the handle asks the window to draw itself, so nothing that
  happens to be in front of it can appear.

  The script refuses rather than guesses: an ambiguous match, a process with no
  window, or a zero-sized window all stop it with a reason. That matters here
  because the wrong capture is not a failed capture, it is a leak.

.PARAMETER ProcessName
  Match a process by name. Must resolve to exactly one window.

.PARAMETER Handle
  An explicit HWND, when you already know it.

.PARAMETER TitleLike
  Optional wildcard to disambiguate among a process's windows.

.PARAMETER Out
  Destination PNG path.

.EXAMPLE
  .\capture-window.ps1 -ProcessName UnrealEditor -Out shot.png
#>
[CmdletBinding()]
param(
  [string] $ProcessName,
  [IntPtr] $Handle = [IntPtr]::Zero,
  [string] $TitleLike,
  [Parameter(Mandatory = $true)][string] $Out
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

if (-not ("Win32Capture" -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public class Win32Capture {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hwnd, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
  [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr hwnd);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int count);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc proc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr hwnd, int attr, out RECT rect, int size);

  public delegate bool EnumProc(IntPtr hwnd, IntPtr lParam);

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left, Top, Right, Bottom; }

  public static string TitleOf(IntPtr hwnd) {
    int n = GetWindowTextLength(hwnd);
    if (n == 0) return "";
    StringBuilder sb = new StringBuilder(n + 1);
    GetWindowText(hwnd, sb, sb.Capacity);
    return sb.ToString();
  }
}
'@
}

[void][Win32Capture]::SetProcessDPIAware()

# --- Resolve the target window -------------------------------------------

$target = $Handle

if ($target -eq [IntPtr]::Zero) {
  if (-not $ProcessName) { throw "Give -ProcessName or -Handle." }

  $procs = @(Get-Process -Name $ProcessName -ErrorAction SilentlyContinue)
  if ($procs.Count -eq 0) { throw "No process named '$ProcessName' is running." }
  $pids = $procs.Id

  $found = New-Object System.Collections.ArrayList
  $cb = [Win32Capture+EnumProc] {
    param($hwnd, $lparam)
    $wpid = 0
    [void][Win32Capture]::GetWindowThreadProcessId($hwnd, [ref]$wpid)
    if ($pids -contains [int]$wpid -and [Win32Capture]::IsWindowVisible($hwnd)) {
      $t = [Win32Capture]::TitleOf($hwnd)
      if ($t) { [void]$found.Add([pscustomobject]@{ Handle = $hwnd; Title = $t }) }
    }
    return $true
  }
  [void][Win32Capture]::EnumWindows($cb, [IntPtr]::Zero)

  $cands = @($found)
  if ($TitleLike) { $cands = @($cands | Where-Object { $_.Title -like $TitleLike }) }

  if ($cands.Count -eq 0) {
    throw ("'$ProcessName' has no visible titled window" +
           $(if ($TitleLike) { " matching '$TitleLike'" } else { "" }) +
           ". If it lives in the tray, open its window first.")
  }
  if ($cands.Count -gt 1) {
    $list = ($cands | ForEach-Object { "  $($_.Handle)  $($_.Title)" }) -join "`n"
    throw "Ambiguous — $($cands.Count) windows match. Narrow with -TitleLike:`n$list"
  }

  $target = $cands[0].Handle
}

$title = [Win32Capture]::TitleOf($target)

# The DWM extended frame is the window as drawn, without the invisible
# resize border GetWindowRect includes.
$r = New-Object Win32Capture+RECT
$hr = [Win32Capture]::DwmGetWindowAttribute($target, 9, [ref]$r, 16)
if ($hr -ne 0) { throw "DwmGetWindowAttribute failed (0x{0:X}) for '$title'." -f $hr }

$w = $r.Right - $r.Left
$h = $r.Bottom - $r.Top
if ($w -le 0 -or $h -le 0) { throw "Window '$title' has no drawable size ($w x $h)." }

# --- Render it -----------------------------------------------------------

$bmp = New-Object System.Drawing.Bitmap $w, $h
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $gfx.GetHdc()
try {
  # 2 = PW_RENDERFULLCONTENT, which captures composited/DirectX content too.
  $ok = [Win32Capture]::PrintWindow($target, $hdc, 2)
} finally {
  $gfx.ReleaseHdc($hdc)
}

if (-not $ok) { $gfx.Dispose(); $bmp.Dispose(); throw "PrintWindow refused '$title'." }

$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$gfx.Dispose()
$bmp.Dispose()

[pscustomobject]@{
  Handle = $target
  Title  = $title
  Width  = $w
  Height = $h
  Path   = (Resolve-Path $Out).Path
}
