# Rebuild the code-drawn app mark using Windows System.Drawing. No external dependencies.
Add-Type -AssemblyName System.Drawing
$outputPath = Join-Path $PSScriptRoot '../weight-n-waist-app/dist/icons'
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
foreach ($icon in @(@{Name='icon-192.png';Size=192}, @{Name='icon-512.png';Size=512}, @{Name='icon-maskable-512.png';Size=512}, @{Name='apple-touch-icon.png';Size=180})) {
    $size = $icon.Size
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#285444'))
    $graphics.ScaleTransform($size / 512.0, $size / 512.0)
    $pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#f8f9f4'), 25)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $points = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(132,220), [System.Drawing.PointF]::new(181,329), [System.Drawing.PointF]::new(230,245), [System.Drawing.PointF]::new(279,329), [System.Drawing.PointF]::new(372,183))
    $graphics.DrawLines($pen, $points)
    $graphics.DrawLines($pen, [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(311,183), [System.Drawing.PointF]::new(372,183), [System.Drawing.PointF]::new(372,244)))
    $bitmap.Save((Join-Path $outputPath $icon.Name), [System.Drawing.Imaging.ImageFormat]::Png)
    $pen.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}
