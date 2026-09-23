<#
.SYNOPSIS
  Move and resize a native window, so a capture of it is legible.

.DESCRIPTION
  A docs screenshot is only useful at the size the panel was drawn at. An
  editor panel that opens at 1006x606 loses its column text to ellipses, and
  no amount of scaling afterwards puts the characters back.

  This calls MoveWindow on the window's own handle. It is not input
  simulation: nothing is typed, nothing is clicked, and no message reaches the
  editor's input stack — Slate simply redraws at the new size, exactly as it
  would if somebody dragged the corner.

  Matching is the same as capture-window.ps1: it refuses an ambiguous match
  rather than picking one.

.EXAMPLE
  .\resize-window.ps1 -ProcessName UnrealEditor -TitleLike "Speech Library*" -Width 1800 -Height 1100
#>
[CmdletBinding()]
param(
  [string] $ProcessName = 'UnrealEditor',
  [string] $TitleLike,
  [int] $X = 80,
  [int] $Y = 60,
  [Parameter(Mandatory = $true)][int] $Width,
  [Parameter(Mandatory = $true)][int] $Height
)

$ErrorActionPreference = 'Stop'

Add-Type -Namespace Win -Name Move -MemberDefinition @'
[DllImport("user32.dll", SetLastError = true)]
public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);
[DllImport("user32.dll")]
public static extern bool SetProcessDPIAware();
'@

[void][Win.Move]::SetProcessDPIAware()

$candidates = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue |
  ForEach-Object { $_.MainWindowHandle; $_ } | Out-Null

$windows = @()
foreach ($p in Get-Process -Name $ProcessName -ErrorAction SilentlyContinue) {
  foreach ($h in @($p.MainWindowHandle)) { if ($h -ne 0) { $windows += [pscustomobject]@{ Handle = $h; Title = $p.MainWindowTitle } } }
}

# MainWindowHandle only ever names one window per process, so enumerate properly.
Add-Type -Namespace Win -Name Enum -MemberDefinition @'
public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
[DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
[DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr hWnd);
[DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);
[DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
[DllImport("user32.dll", SetLastError = true)] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
'@

$pids = @(Get-Process -Name $ProcessName -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
if ($pids.Count -eq 0) { throw "No process named '$ProcessName'." }

$found = New-Object System.Collections.ArrayList
$cb = [Win.Enum+EnumWindowsProc]{
  param([IntPtr]$hWnd, [IntPtr]$lParam)
  if ([Win.Enum]::IsWindowVisible($hWnd)) {
    $wpid = 0
    [void][Win.Enum]::GetWindowThreadProcessId($hWnd, [ref]$wpid)
    if ($pids -contains $wpid) {
      $len = [Win.Enum]::GetWindowTextLength($hWnd)
      if ($len -gt 0) {
        $sb = New-Object System.Text.StringBuilder ($len + 1)
        [void][Win.Enum]::GetWindowText($hWnd, $sb, $sb.Capacity)
        [void]$found.Add([pscustomobject]@{ Handle = $hWnd; Title = $sb.ToString() })
      }
    }
  }
  return $true
}
[void][Win.Enum]::EnumWindows($cb, [IntPtr]::Zero)

$matches = $found
if ($TitleLike) { $matches = @($found | Where-Object { $_.Title -like $TitleLike }) }

if ($matches.Count -eq 0) { throw "No window matching '$TitleLike' in process '$ProcessName'." }
if ($matches.Count -gt 1) {
  $list = ($matches | ForEach-Object { "  $($_.Title)" }) -join "`n"
  throw "Ambiguous: $($matches.Count) windows match '$TitleLike'.`n$list"
}

$w = $matches[0]
[void][Win.Move]::MoveWindow($w.Handle, $X, $Y, $Width, $Height, $true)

[pscustomobject]@{ Handle = $w.Handle; Title = $w.Title; Width = $Width; Height = $Height }
